import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { json } from "./http.ts";
import type { Client } from "./types.ts";
import { getExperience, getProjects, getSkills } from "./data.ts";
import { getAllChunks, matchChunks } from "./knowledge.ts";
import { MODEL, type Message, streamChatCompletion } from "./groq.ts";

// --- Caps. Every one of these makes worst-case spend per request a known
// number rather than an open question on a public, unauthenticated endpoint.
const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY_TURNS = 8;
const HOURLY_LIMIT = 15;
const DAILY_LIMIT = 60;

// Past this, injecting the whole knowledge base stops being the cheap option
// and top-k retrieval takes over. Gated on estimated tokens, not chunk count:
// twelve one-paragraph chunks and twelve case studies are not the same
// problem. Today's corpus (CV + LinkedIn + FAQ) is nowhere near it.
const RETRIEVAL_TOKEN_THRESHOLD = 8_000;

const estimateTokens = (text: string) => Math.ceil(text.length / 4);

// --------------------------------------------------------------- the prompt

// Static, and deliberately first in the system message: Groq discounts cached
// input 50% on a matching prefix, so the longer the byte-stable head of the
// prompt, the cheaper every request after the first. Never put a timestamp or
// anything per-request above the question.
const ROLE_FRAMING = `You are the assistant embedded in Jeffrey Lucban's personal portfolio site.
Visitors are recruiters, hiring managers, and engineers evaluating him as a candidate.

Positioning to reinforce: full-stack versatility framed from a backend lean — a backend
engineer who is comfortable end-to-end, not backend-only. The portfolio itself is proof:
he built it solo with a React frontend, Supabase Postgres, and Deno Edge Functions,
including the retrieval pipeline behind this chat.

Brand facts: Jeffrey Lucban, Backend Engineer, based in the Philippines.
Contact: lucbanjep@gmail.com · github.com/DyepLucban · linkedin.com/in/jeffrey-lucban`;

const RULES = `RULES — follow these exactly:
- Answer only from the context above. Never invent employers, project names, metrics,
  dates, technologies, or testimonials. If something is not in the context, it does not exist
  for the purposes of your answer.
- If the answer is not in the context, say so briefly and naturally in the FIRST person —
  for example "I don't have that information" or "I'm not sure about that one" — then point
  the visitor to lucbanjep@gmail.com. Never say "the available documents", "the context",
  "the documents I have", or "real-time information"; just say you don't have it.
- Speak ABOUT Jeffrey in the third person, as a knowledgeable assistant. Never write as
  Jeffrey and never commit him to anything — availability, rates, start dates, relocation —
  beyond exactly what the context states.
- Stay on professional and portfolio topics. Politely redirect anything else in one sentence.
- Be brief. Two or three short paragraphs at most; recruiters skim. Plain prose, no markdown
  headings, no bullet-point walls.`;

function formatKnowledge(chunks: { heading: string; content: string }[]) {
  if (!chunks.length) return "(No background documents have been ingested yet.)";
  return chunks
    .map((chunk) => `### ${chunk.heading}\n${chunk.content}`)
    .join("\n\n");
}

function formatLiveFacts(skills: any[], experience: any[], projects: any[]) {
  const skillLines = skills.map((s) => `- ${s.category}: ${(s.items ?? []).join(", ")}`);

  const experienceLines = experience.map((e) =>
    [
      `- ${e.role} — ${e.company}${e.location ? ` (${e.location})` : ""}`,
      `  ${e.start ?? "?"} to ${e.end ?? "Present"}`,
      e.description ? `  ${e.description}` : null,
      e.tags?.length ? `  Tech: ${e.tags.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("\n")
  );

  const projectLines = projects.map((p) => {
    const description = Array.isArray(p.description)
      ? p.description.join(" ")
      : (p.description ?? "");
    return [
      `- ${p.name}`,
      description ? `  ${description}` : null,
      p.tags?.length ? `  Tech: ${p.tags.join(", ")}` : null,
      p.live_url ? `  Live: ${p.live_url}` : null,
      p.github_url ? `  Source: ${p.github_url}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [
    "SKILLS",
    skillLines.join("\n") || "(none)",
    "",
    "EXPERIENCE",
    experienceLines.join("\n") || "(none)",
    "",
    "PROJECTS",
    projectLines.join("\n") || "(none)",
  ].join("\n");
}

// ------------------------------------------------------------- rate limiting

function adminClient() {
  // Rate-limit counters and chat logs are service-role-only tables (no anon
  // policy at all), so they need their own client. Every read stays on the
  // anon client index.ts passes in.
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// The raw IP never touches a table. Salted SHA-256 keeps per-visitor counting
// and abuse investigation possible without the site accumulating a log of
// visitor IP addresses.
async function hashIp(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const bytes = new TextEncoder().encode(`${Deno.env.get("IP_HASH_SALT") ?? ""}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------- the route

export async function handleChat(supabase: Client, req: Request) {
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  let body: { message?: string; history?: { role?: string; content?: string }[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body must be JSON." }, 400);
  }

  const message = (body.message ?? "").trim();
  if (!message) return json({ error: "Ask me something first." }, 400);
  if (message.length > MAX_MESSAGE_CHARS) {
    // Also enforced in the UI — but the UI is not the security boundary.
    return json({ error: `Keep it under ${MAX_MESSAGE_CHARS} characters.` }, 400);
  }

  const history: Message[] = (body.history ?? [])
    .filter((turn) => turn?.content && (turn.role === "user" || turn.role === "assistant"))
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => ({
      role: turn.role as "user" | "assistant",
      content: String(turn.content).slice(0, MAX_MESSAGE_CHARS * 4),
    }));

  const admin = adminClient();
  const ipHash = await hashIp(req);

  const { data, error: limitError } = await admin
    .rpc("bump_chat_rate_limit", {
      p_ip_hash: ipHash,
      p_hourly_limit: HOURLY_LIMIT,
      p_daily_limit: DAILY_LIMIT,
    })
    .single();

  if (limitError) throw limitError;

  // The function is `returns table (...)`, so PostgREST hands back one row.
  const limit = data as { allowed: boolean } | null;
  if (!limit?.allowed) {
    return json(
      {
        error:
          "You've reached the message limit for now. Please try again later, " +
          "or email Jeffrey directly at lucbanjep@gmail.com.",
      },
      429
    );
  }

  const [skills, experience, projects, allChunks] = await Promise.all([
    getSkills(supabase),
    getExperience(supabase),
    getProjects(supabase),
    getAllChunks(supabase),
  ]);

  // Full injection while the corpus is small — perfect recall, one Groq call,
  // and a byte-stable prefix that the prompt cache can actually hit. Retrieval
  // is built and dormant; it takes over on its own once the corpus grows.
  // (Measuring by fetching is only wasteful on the path that then discards
  // the fetch, which by definition is the oversized-corpus path.)
  const kbTokenEstimate = estimateTokens(
    allChunks.map((c) => c.heading + c.content).join("")
  );
  const chunks =
    kbTokenEstimate <= RETRIEVAL_TOKEN_THRESHOLD
      ? allChunks
      : await matchChunks(supabase, message);

  const systemPrompt = [
    ROLE_FRAMING,
    "",
    "=== BACKGROUND DOCUMENTS (CV, LinkedIn, FAQ) ===",
    formatKnowledge(chunks),
    "",
    "=== LIVE PORTFOLIO DATA (current contents of the site's database) ===",
    formatLiveFacts(skills, experience, projects),
    "",
    RULES,
  ].join("\n");

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  const retrievedIds = chunks.map((c) => c.id);

  return await streamChatCompletion(messages, async ({ text, usage }) => {
    // What visitors actually ask is the most valuable byproduct of this
    // feature — it feeds straight back into knowledge/faq.md.
    await admin.from("chat_logs").insert({
      question: message,
      answer: text,
      ip_hash: ipHash,
      retrieved_ids: retrievedIds,
      model: MODEL,
      prompt_tokens: usage?.prompt_tokens ?? null,
      completion_tokens: usage?.completion_tokens ?? null,
      cached_tokens: usage?.prompt_tokens_details?.cached_tokens ?? null,
    });
  });
}
