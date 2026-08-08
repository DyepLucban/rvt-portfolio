import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { json } from "./http.ts";
import type { Client } from "./types.ts";

// The knowledge base: narrative content (CV, LinkedIn, FAQ) that the
// portfolio tables don't hold. Markdown in, embedded chunks out.
//
// Everything here runs in-process: `Supabase.ai.Session("gte-small")` is a
// 384-dimension embedding model bundled with the Edge Runtime, so there is no
// embeddings vendor and no second API key. Groq has no embeddings endpoint.

const MAX_CHUNK_CHARS = 800;
const CHUNK_OVERLAP_CHARS = 100;

export type Chunk = { heading: string; content: string };

// ---------------------------------------------------------------- chunking

// Split on markdown headings first: a heading is an author-chosen semantic
// boundary, which beats any character-count heuristic. Only sections that are
// still too long after that get sliced, with overlap so a sentence spanning
// the cut still appears whole in one of the two pieces.
export function chunkMarkdown(markdown: string, documentTitle: string): Chunk[] {
  // HTML comments in the source files are editorial notes to whoever
  // maintains them ("TODO: paste the real dates here"), never content the
  // model should read back to a visitor.
  const lines = markdown.replace(/<!--[\s\S]*?-->/g, "").split("\n");
  const sections: { breadcrumb: string; body: string[] }[] = [];

  // Heading levels currently "open", so a chunk can carry its full path
  // (e.g. "CV > Experience > Backend Engineer, Acme") instead of a bare title.
  const trail: string[] = [];
  let current = { breadcrumb: documentTitle, body: [] as string[] };

  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (!heading) {
      current.body.push(line);
      continue;
    }

    if (current.body.join("").trim()) sections.push(current);

    const level = heading[1].length;
    const text = heading[2].trim();
    trail.length = Math.max(0, level - 1);
    trail[level - 1] = text;

    // A file's H1 is usually also its title — don't repeat it in every
    // breadcrumb ("CV > CV > Experience").
    const path = trail.filter(Boolean);
    if (path[0] === documentTitle) path.shift();

    current = {
      breadcrumb: [documentTitle, ...path].join(" > "),
      body: [],
    };
  }
  if (current.body.join("").trim()) sections.push(current);

  const chunks: Chunk[] = [];
  for (const section of sections) {
    const body = section.body.join("\n").trim();
    if (!body) continue;
    for (const piece of splitLongText(body)) {
      chunks.push({ heading: section.breadcrumb, content: piece });
    }
  }
  return chunks;
}

function splitLongText(text: string): string[] {
  if (text.length <= MAX_CHUNK_CHARS) return [text];

  const pieces: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + MAX_CHUNK_CHARS, text.length);

    // Prefer to cut at a paragraph break, then a sentence end, then a space —
    // anywhere but mid-word.
    if (end < text.length) {
      const window = text.slice(start, end);
      const breakAt = Math.max(
        window.lastIndexOf("\n\n"),
        window.lastIndexOf(". "),
        window.lastIndexOf(" ")
      );
      if (breakAt > MAX_CHUNK_CHARS * 0.5) end = start + breakAt;
    }

    pieces.push(text.slice(start, end).trim());
    if (end >= text.length) break;
    start = Math.max(end - CHUNK_OVERLAP_CHARS, start + 1);
  }
  return pieces.filter(Boolean);
}

// --------------------------------------------------------------- embedding

let session: { run: (input: string, opts: unknown) => Promise<number[]> } | null = null;

function embedder() {
  // `Supabase` is an Edge Runtime global, not an import — hence the cast.
  if (!session) {
    session = new (globalThis as any).Supabase.ai.Session("gte-small");
  }
  return session!;
}

export async function embed(text: string): Promise<number[]> {
  return await embedder().run(text, { mean_pool: true, normalize: true });
}

// The breadcrumb is embedded along with the body so an isolated chunk still
// carries the context of where it came from. Retrieval and ingest must build
// this string identically or the vectors stop being comparable.
export function embeddableText(chunk: Chunk) {
  return `${chunk.heading}\n\n${chunk.content}`;
}

// ------------------------------------------------------------- reads (anon)

export async function getAllChunks(supabase: Client) {
  const { data, error } = await supabase
    .from("knowledge_chunks")
    .select("id, heading, content")
    .order("id", { ascending: true });

  if (error) throw error;
  return data as { id: number; heading: string; content: string }[];
}

export async function matchChunks(supabase: Client, question: string, matchCount = 6) {
  const { data, error } = await supabase.rpc("match_knowledge_chunks", {
    query_embedding: JSON.stringify(await embed(question)),
    match_count: matchCount,
    min_similarity: 0.3,
  });

  if (error) throw error;
  return data as { id: number; heading: string; content: string; similarity: number }[];
}

// ------------------------------------------------------------ ingest (write)

// Constant-time-ish comparison so a wrong secret can't be recovered by
// timing the response. Cheap insurance on the one write endpoint we have.
function secretMatches(provided: string | null, expected: string | undefined) {
  if (!provided || !expected || provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

// Embeddings run in-process (gte-small), and each `run` burns CPU the Edge
// Runtime meters against a per-request limit. Embedding a whole document at
// once trips that limit and the worker is killed (HTTP 546) once a file grows
// past ~a dozen chunks. So ingest is batched: the client re-POSTs with a rising
// `offset` and we embed only this many chunks per call. Chunking is
// deterministic, so slicing the same content by offset is stable across calls.
const INGEST_BATCH_SIZE = 6;

export async function handleIngest(_supabase: Client, req: Request) {
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  if (!secretMatches(req.headers.get("x-ingest-secret"), Deno.env.get("INGEST_SECRET"))) {
    return json({ error: "Unauthorized." }, 401);
  }

  let body: { source?: string; title?: string; content?: string; offset?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body must be JSON." }, 400);
  }

  const source = body.source?.trim();
  const content = body.content ?? "";
  if (!source) return json({ error: "`source` is required." }, 400);
  if (!content.trim()) return json({ error: "`content` is empty." }, 400);

  const title = body.title?.trim() || source;
  const offset = Number.isInteger(body.offset) && body.offset! > 0 ? body.offset! : 0;

  // Writes bypass RLS (the knowledge tables are anon-select-only), so ingest
  // runs on a service-role client rather than the anon one index.ts passes in.
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // The first batch owns the replace: upsert the document row and clear the
  // old chunks before any new ones land. Later batches only append, so a
  // re-run never leaves previous wording behind to be retrieved.
  let documentId: number;
  if (offset === 0) {
    const { data: document, error: documentError } = await admin
      .from("knowledge_documents")
      .upsert({ source, title, updated_at: new Date().toISOString() }, { onConflict: "source" })
      .select("id")
      .single();
    if (documentError) throw documentError;
    documentId = document.id;

    const { error: deleteError } = await admin
      .from("knowledge_chunks")
      .delete()
      .eq("document_id", documentId);
    if (deleteError) throw deleteError;
  } else {
    const { data: document, error: documentError } = await admin
      .from("knowledge_documents")
      .select("id")
      .eq("source", source)
      .single();
    if (documentError) throw documentError;
    documentId = document.id;
  }

  const chunks = chunkMarkdown(content, title);
  const batch = chunks.slice(offset, offset + INGEST_BATCH_SIZE);
  const rows = [];
  for (const chunk of batch) {
    rows.push({
      document_id: documentId,
      heading: chunk.heading,
      content: chunk.content,
      embedding: JSON.stringify(await embed(embeddableText(chunk))),
    });
  }

  if (rows.length) {
    const { error: insertError } = await admin.from("knowledge_chunks").insert(rows);
    if (insertError) throw insertError;
  }

  const next = offset + batch.length;
  return json({
    source,
    title,
    total: chunks.length,
    inserted: rows.length,
    next,
    done: next >= chunks.length,
    characters: content.length,
    updated_at: new Date().toISOString(),
  });
}
