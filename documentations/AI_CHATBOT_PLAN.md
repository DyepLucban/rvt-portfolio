# AI Chatbot Plan — "Know more"

### (A grounded, streaming chat widget backed by Groq + pgvector — extends the Supabase Edge Function architecture, changes none of it)

This document specs a conversational "Know more" surface for the portfolio: a floating chat
widget, available on every route, that answers questions about Jeffrey using his CV, his
LinkedIn profile, and the live content already in Supabase Postgres. It does **not** change
the `Component → Hook → Service → Edge Function → Postgres` layering described in
`CLAUDE.md` — it adds one more resource to it.

**Why**: the site currently answers only the questions it thought to answer. A recruiter
skimming Me/Skills/Experience can't ask "has he owned a feature from schema to UI?" or "is
he open to relocating?" — they either infer it from cards or leave. A grounded chatbot turns
a one-way brochure into something interrogable, and it does double duty as proof of the
positioning in `PRODUCT.md`: a backend-leaning engineer who ships end-to-end, demonstrated
by an RAG pipeline and a streaming Edge Function he built on his own portfolio.

**Note on precedent**: `DESIGN_REVAMP.md` §1 explicitly dropped an "Ask me anything" chat/AI
input as out of scope. That decision is deliberately **reversed** here — it was made before
the Supabase Edge Function backend existed, when there was nowhere safe to hold an API key
and nothing to ground answers against. Both conditions have changed.

---

## 1. What's changing vs. what's not

| Changing | Not changing |
|---|---|
| Two new routes on the `portfolio` Edge Function (`chat`, `ingest`) | The layered architecture — components still never touch Supabase directly |
| New pgvector tables: `knowledge_documents`, `knowledge_chunks` | The four existing routes and their handlers (reused, not rewritten) |
| A floating chat widget mounted once in `MainLayout` | Design tokens, fonts, and `src/lib/motionVariants.js` — all reused as-is |
| `DESIGN_REVAMP.md` §1's "no AI input" decision | Read-only public site: still no auth, still no admin UI |
| A versioned `knowledge/` directory of markdown source documents | Supabase Postgres stays the source of truth for skills/experience/projects |

Explicitly **out of scope**:

- No cross-visit chat history — the thread lives in `sessionStorage` and dies with the tab.
- No admin UI for the knowledge base — ingest is a deliberate CLI step, not a form.
- No voice input, no multi-language, no citations UI in v1.
- No new design language — every pixel comes from existing tokens and `src/components/ui/`.

---

## 2. Architecture

The chatbot is one more resource on the existing Edge Function, consumed through the
existing service/hook layering:

```
ChatWidget → useChat → chatService → portfolioAPI.sendChat
  → Edge Function "portfolio/chat"
      ├── knowledge base                      all chunks by default (§5.2)
      │     └── or: embed(question) → match_knowledge_chunks()   past the size threshold
      ├── getSkills / getExperience / getProjects   ← existing handlers, reused
      └── Groq chat/completions (stream: true)
             └── re-emitted as our own SSE → browser
```

The important design point: **the existing handlers supply the "live facts" half of the
context.** `getSkills`, `getExperience`, and `getProjects` (`supabase/functions/portfolio/index.ts`,
lines 15–77) are called directly by the chat handler rather than duplicated or snapshotted.
Edit a project row in Supabase and the bot's answer changes on the next question, with no
re-ingest. The ingested CV/LinkedIn/FAQ chunks supply the *narrative* half — the story, the
motivations, the things a database row can't hold.

### File layout

The function directory gets split rather than growing one file past readability:

| File | Responsibility |
|---|---|
| `supabase/functions/portfolio/index.ts` | CORS, `json()`, the `ROUTES` map, `Deno.serve` — kept, lightly widened (§3) |
| `supabase/functions/portfolio/chat.ts` | Retrieval, prompt assembly, guardrails, SSE response |
| `supabase/functions/portfolio/knowledge.ts` | Chunking, `gte-small` embedding, the `ingest` handler |
| `supabase/functions/portfolio/groq.ts` | Groq request + SSE transform — the only file that knows Groq exists |

Frontend files are listed in §8.

---

## 3. Router change (small, backwards-compatible)

Today `ROUTES` is typed `(supabase) => Promise<unknown>` and every result is wrapped by
`json()`. Chat needs the `Request` (for the POST body and the client IP) and returns a
*streaming* `Response` rather than a JSON body. The minimal widening:

```ts
// supabase/functions/portfolio/index.ts (concept)
type Handler = (
  supabase: ReturnType<typeof createClient>,
  req: Request,
) => Promise<unknown | Response>;

const ROUTES: Record<string, Handler> = {
  skills: getSkills,
  experiences: getExperience,
  projects: getProjects,
  chat: handleChat,
  ingest: handleIngest,
};

// ...inside Deno.serve, replacing `return json(await handler(supabase))`:
const result = await handler(supabase, req);
return result instanceof Response ? result : json(result);
```

The three existing handlers keep working untouched — they simply ignore the extra argument.
CORS preflight handling and the error-shaping `catch` at the bottom of `index.ts` stay
exactly as they are.

**Cleanup while in here**: `getProjects` orders with `.order("id", { descending: true })`,
which is not a valid PostgREST option — the correct form is `{ ascending: false }`, as
already used by `getExperience`. Worth fixing in the same pass.

---

## 4. Data model

```sql
-- Knowledge base: narrative content the portfolio tables don't hold.
create extension if not exists vector;

create table knowledge_documents (
  id          bigint generated always as identity primary key,
  source      text not null unique,        -- 'cv' | 'linkedin' | 'faq'
  title       text,
  updated_at  timestamptz not null default now()
);

create table knowledge_chunks (
  id          bigint generated always as identity primary key,
  document_id bigint not null references knowledge_documents(id) on delete cascade,
  heading     text,                        -- breadcrumb, prepended to content before embedding
  content     text not null,
  embedding   vector(384),                 -- gte-small
  created_at  timestamptz not null default now()
);

create index on knowledge_chunks using hnsw (embedding vector_cosine_ops);
```

Similarity search lives in a Postgres function so the Edge Function stays thin:

```sql
create or replace function match_knowledge_chunks(
  query_embedding vector(384),
  match_count     int   default 6,
  min_similarity  float default 0.3
)
returns table (id bigint, heading text, content text, similarity float)
language sql stable
as $$
  select c.id,
         c.heading,
         c.content,
         1 - (c.embedding <=> query_embedding) as similarity
  from knowledge_chunks c
  where 1 - (c.embedding <=> query_embedding) > min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
```

**RLS**: `knowledge_documents` and `knowledge_chunks` get a select-only policy for `anon` —
the content is a public CV on a public site, so there is nothing to hide, and it keeps the
chat handler on the same anon client as every other route. The guardrail tables in §7 are
service-role only: no anon policy at all.

---

## 5. Ingest — getting the CV and LinkedIn in

### 5.1 From PDF to embedded chunks

Both source documents already exist as PDFs — the CV, and the LinkedIn profile saved via
*More → Save to PDF*. Nothing is fetched at runtime: ingest is a deliberate, versioned,
run-when-it-changes step, which is the right shape for documents that change a few times a
year.

1. Convert `cv.pdf` → `knowledge/cv.md` and `linkedin.pdf` → `knowledge/linkedin.md`.
   **Markdown headings become chunk boundaries**, so structure them the way you'd want them
   retrieved: one heading per role, per project, per section.
2. Add `knowledge/faq.md` for what neither document says and recruiters always ask —
   relocation, notice period, remote/onsite preference, the why-backend story, salary
   stance, what he's looking for next. This file carries more weight than the other two
   combined (see §5.2).
3. Run `npm run ingest` — a small Node script that POSTs each file to `portfolio/ingest`
   with an `x-ingest-secret` header.

**On step 1: convert by hand, once.** Automated PDF text extraction is available (`unpdf`,
`pdf-parse` in the ingest script) but it's the wrong trade here. CV and LinkedIn PDFs are
*designed* documents — multi-column layouts, styled headings, icon glyphs — and extractors
reliably interleave columns, flatten headings into body text, and emit stray ligatures.
Since headings are what the chunker splits on, a mangled heading structure degrades every
downstream answer. Markdown is also the format you'll want to hand-edit when an answer comes
out wrong, which happens more often than the CV changes. If maintaining three markdown files
ever becomes the friction point, adding extraction to `scripts/ingest.mjs` is a contained
change — but start manual.

Server side, `handleIngest`:

- rejects any request whose `x-ingest-secret` doesn't match the `INGEST_SECRET` function
  secret (this is the one write endpoint on an otherwise read-only site);
- chunks the markdown — split on headings first, then wrap any section over ~800 characters
  with ~100 characters of overlap, prepending the `Document Title > ## Heading` breadcrumb
  to each chunk so an isolated chunk still carries its context;
- embeds each chunk with `new Supabase.ai.Session("gte-small")`, running natively in the
  Edge Runtime — **no external embeddings vendor and no second API key**;
- upserts the `knowledge_documents` row and **replaces** all of that source's chunks, so
  re-running is idempotent and never leaves stale text behind.

> **Embeddings note**: Groq does not offer an embeddings endpoint (confirmed against Groq's
> docs and community, August 2026) — it is an inference platform for generation, speech, and
> vision. Supabase Edge Runtime's built-in `gte-small` (384 dimensions) fills the gap for
> free and in-process. If retrieval quality ever plateaus, swapping in a paid embeddings API
> means changing one function in `knowledge.ts` and the `vector(384)` column width.

### 5.2 Retrieval is built, but switched off at launch — **decided**

A CV plus a LinkedIn profile is roughly 3–6k tokens. The chosen model's context window is
131k. Everything fits — so at launch, **inject the whole knowledge base and skip retrieval.**

This is not just "simpler is better". At this corpus size, full injection is *strictly
better* on every axis that matters:

| | Full injection | Top-k retrieval |
|---|---|---|
| Recall | Perfect — the model sees everything | Can miss; `match_count: 6` is a guess |
| Latency | One Groq call | Plus an embedding call and a pgvector RPC |
| Cost | 50% off input after the first request (see prompt caching, §6) | Cache never hits — the prefix changes every question |
| Synthesis questions | Works | **Breaks** |

That last row is the decisive one. Groq's prompt caching keys on a **stable prefix**, which
a fixed knowledge base is and retrieved chunks are not — retrieval would forfeit the
discount on every request. And recruiter questions skew heavily toward synthesis ("is he
more backend or full-stack?", "what's the through-line in his work?", "what's his strongest
skill?"). Those need the whole corpus at once, and top-6 chunk retrieval is precisely the
wrong tool for them.

Retrieval still gets **built** in Phase 2, because the corpus grows — project write-ups,
case studies, talk notes, and an FAQ that expands every time someone asks something new —
and retrofitting a retrieval path into a live prompt pipeline is worse than shipping one
that's dormant.

**The rule:**

```ts
// supabase/functions/portfolio/chat.ts (concept)
const RETRIEVAL_TOKEN_THRESHOLD = 8_000;

const context = kbTokenEstimate <= RETRIEVAL_TOKEN_THRESHOLD
  ? await getAllChunks(supabase)                      // default today
  : await matchChunks(supabase, await embed(question)); // when the KB outgrows the window
```

- Gate on **estimated tokens, not chunk count** — twelve chunks of a paragraph each and
  twelve chunks of a full case study are not the same problem.
- **Embed at ingest time from day one anyway.** `gte-small` runs in-process and costs
  nothing, so the vectors and the HNSW index simply exist. Crossing the threshold later is a
  config change, not a migration and not a backfill.
- Revisit the threshold if latency or spend becomes the binding constraint before size does.

**Where the effort actually pays off**: at this corpus size the answer-quality ceiling is set
entirely by what the documents *say*, not by how they're fetched. An hour spent writing
`knowledge/faq.md` beats any amount of retrieval tuning. Read `chat_logs` (§7) monthly and
feed the real questions back into it — that loop is the feature.

---

## 6. The Groq call

### Secrets — and why this needs no separate project

```bash
npx supabase secrets set GROQ_API_KEY=gsk_...
npx supabase secrets set INGEST_SECRET=...
npx supabase secrets set IP_HASH_SALT=...
```

The Groq key **must never** be a `VITE_*` variable. Anything prefixed `VITE_` is inlined into
the client bundle at build time and is readable by every visitor. The existing (unused)
`VITE_SUPABASE_SECRET_KEY` entry in `.env` is exactly the pattern not to copy.

That constraint does **not** imply the chatbot needs its own repo or its own Supabase
project. The separation already exists: `supabase/functions/` is Deno code deployed to
Supabase's servers, not part of the Vite app. It only looks adjacent because it shares a
folder — different runtime, different machine, different trust boundary.

| Where a value lives | Reaches the browser? | Right home for the Groq key? |
|---|---|---|
| `.env` as `VITE_FOO` | **Yes** — inlined into the bundle | Never |
| `.env` as `FOO` (no prefix) | No, but also invisible to a deployed Edge Function — local tooling only | No (useless) |
| `npx supabase secrets set` | No — injected as `Deno.env` at runtime, server-side | **Yes** |
| `supabase/functions/portfolio/.env.local` | No — local `npx supabase functions serve` only | Yes, for local dev |

`.env.local` is already covered by `.gitignore`, so the local-dev secret stays uncommitted.
A separate project would buy two deploy pipelines, two sets of credentials, and a CORS
problem in exchange for a boundary that's already there. The isolation worth actually adding
is the privilege split in §7 — the chat handler holding a service-role client for
rate-limit and log writes, while every read stays on anon.

### Prompt caching

Groq caches automatically on prefix match: **50% off cached input tokens**, roughly a 2-hour
idle TTL, no code changes required, supported on both `gpt-oss` models. Two consequences for
how the prompt gets assembled:

- **Order static content first.** Role framing → knowledge base → live DB facts → capped
  history → the question. The longer the stable prefix, the more of each request is
  discounted.
- **Don't reorder or timestamp the prefix per request.** Injecting `new Date()` or shuffling
  chunks at the top of the prompt silently forfeits every cache hit.

This is the mechanism that makes full knowledge-base injection (§5) cheaper than retrieval at
current corpus size, not just simpler.

### Request

```ts
// supabase/functions/portfolio/groq.ts (concept)
const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "openai/gpt-oss-120b",
    messages,                      // system prompt + capped history + question
    temperature: 0.3,              // grounded, not creative
    max_completion_tokens: 600,
    stream: true,
  }),
});
```

### Model choice

| Model | Use | Note |
|---|---|---|
| `openai/gpt-oss-120b` | **Default.** Best answer quality of the current production line-up | 131k context, 65k max completion |
| `openai/gpt-oss-20b` | Fallback if latency or cost matters more than nuance | Fastest throughput on Groq |
| `llama-3.3-70b-versatile` | **Do not use** | Deprecation announced 2026-06-17 |
| `llama-3.1-8b-instant` | **Do not use** | Deprecation announced 2026-06-17 |

Groq's production model list moves faster than this document will. Re-check
`console.groq.com/docs/models`, `/docs/deprecations`, and the current pricing page before
launch rather than trusting anything written here — deliberately, no price figures are
quoted in this doc.

### Streaming

Groq streams OpenAI-shaped SSE (`data: {"choices":[{"delta":{"content":"..."}}]}`). Rather
than forward that verbatim, `groq.ts` transforms it into a minimal in-house event shape:

```
data: {"delta":"Jeffrey "}
data: {"delta":"spent "}
data: {"done":true}
```

The browser then never couples to Groq's response schema, and swapping inference providers
later touches exactly one file. Errors mid-stream are emitted as `data: {"error":"..."}` so
the widget can degrade gracefully instead of hanging on a truncated stream.

### System prompt

Assembled per request from four parts:

1. **Role framing** drawn from `PRODUCT.md` — the positioning ("full-stack versatility from a
   backend lean"), the two audiences (recruiters and engineers), the brand facts.
2. **Retrieved knowledge chunks** (§5), labelled with their breadcrumbs.
3. **Live DB facts** — skills grouped by category, experience entries, project entries, from
   the reused handlers.
4. **Rules**, the load-bearing part:
   - Answer only from the provided context. **Never invent employers, project names,
     metrics, dates, or testimonials** — this mirrors `PRODUCT.md` Product Principle 4, which
     already governs the rest of the site.
   - If the answer isn't in context, say so plainly and point to `lucbanjep@gmail.com`.
   - Stay on professional/portfolio topics; politely redirect anything else.
   - Speak *about* Jeffrey in the third person, as a knowledgeable assistant — not as
     Jeffrey. Never impersonate him or commit him to anything (availability, rates, start
     dates) beyond what the context states.
   - Be brief. Two or three short paragraphs maximum; recruiters skim.

---

## 7. Guardrails

This is a public URL with no authentication, calling a paid API. All four of the following
ship in v1 — they are cheap, and the first request from a bored visitor with a loop is not
the moment to start writing them.

| Guardrail | Detail | Why |
|---|---|---|
| **Scope-lock prompt** | Professional topics only; refuse-and-redirect otherwise; hard no-fabrication rule | Free to implement, and the no-fabrication rule is already site policy (`PRODUCT.md` Principle 4) |
| **Input + history caps** | 500 chars per message (enforced client *and* server side), last 8 turns sent, `max_completion_tokens: 600` | Makes worst-case spend per request a known, fixed number rather than an open question |
| **Per-IP rate limit** | `chat_rate_limits(ip_hash, window_start, count)`; 15 messages/hour and 60/day; over the cap returns `429` with a friendly "ask me again in a bit, or just email Jeffrey" message | The only thing standing between an unauthenticated public endpoint and an unbounded Groq bill |
| **Chat logging** | `chat_logs(question, answer, ip_hash, retrieved_ids, created_at)`, plus a one-line "conversations are logged" note in the widget footer | Knowing what recruiters actually ask is the single most valuable byproduct of this feature — it should feed straight back into `knowledge/faq.md`. The disclosure line keeps it honest |

The client IP comes from the `x-forwarded-for` header and is **never stored raw** — it's
SHA-256'd with the `IP_HASH_SALT` secret before it touches a table. That keeps rate limiting
and abuse investigation possible without the site quietly accumulating a log of visitor IP
addresses.

Rate-limit and log writes need to bypass RLS, so `chat.ts` creates a second, service-role
client (`SUPABASE_SERVICE_ROLE_KEY`) scoped to those two tables. The anon client passed in by
`index.ts` continues to handle all reads.

---

## 8. Frontend

Every new component is assembled from primitives that already exist in
`src/components/ui/` — `Frame`, `PanelHeader`, `Button`, `IconButton`, `Tag`, `Spinner` — and
styled purely with existing tokens. The widget should look like it was always part of the
terminal-panel language of the Me page, not like a bolted-on SaaS chat bubble.

| File | Role |
|---|---|
| `src/components/chat/ChatWidget.jsx` | Launcher button + `AnimatePresence` panel; owns open/closed state and the `sessionStorage`-backed thread |
| `src/components/chat/ChatPanel.jsx` | `Frame` + `PanelHeader label="~/ask.me"` shell — same motif as `~/me` and `~/spec.data` |
| `src/components/chat/ChatMessage.jsx` | One turn; mono type for the assistant, accent-tinted for the visitor |
| `src/components/chat/ChatInput.jsx` | Textarea + send; enforces the 500-char cap, Enter to send / Shift+Enter for newline |
| `src/components/chat/SuggestedQuestions.jsx` | Three starter chips built on the existing `Tag` component — an empty chat box is a dead end |
| `src/hooks/useChat.js` | `{ messages, send, streaming, error, reset }` |
| `src/services/chatService.js` | Async generator yielding text deltas — **the only frontend file that knows SSE exists** |

`src/lib/supabaseClient.js` gains one method, matching the existing shape:

```js
export const portfolioAPI = {
  getSkills: () => supabase.functions.invoke("portfolio/skills"),
  getExperiences: () => supabase.functions.invoke("portfolio/experiences"),
  getProjects: () => supabase.functions.invoke("portfolio/projects"),
  sendChat: (body) => supabase.functions.invoke("portfolio/chat", { body }),
};
```

supabase-js returns the raw `Response` object (rather than parsed JSON) when the response
content type is `text/event-stream`, so streaming works *through* `functions.invoke` and the
`portfolioAPI` pattern holds with no exception carved out for chat. If that behaviour proves
unreliable in practice, `chatService.js` falls back to a plain `fetch` against
`${VITE_SUPABASE_URL}/functions/v1/portfolio/chat` with the publishable key as a bearer
token — a change confined to that one file.

`useChat` deviates from `useProjects`/`useSkills` in one respect and one only: it's
imperative rather than fetch-on-mount, since messages are sent in response to user action.
The `{ data, loading, error }` contract carries over as `{ messages, streaming, error }`.

### Mounting

`<ChatWidget />` goes in `src/layouts/MainLayout.jsx`, **after `<Footer />` and outside the
`AnimatePresence` that wraps `<Outlet />`**. Inside it, the widget would unmount and remount
on every route change, wiping mid-conversation state; outside it, the thread survives
navigation — which is the whole point of putting it on every page.

### Motion and accessibility

- Reuse `scaleUp` for the panel entrance, `staggerItem` for message entrance, `badgeHover`
  for the launcher and chips, `transitionConfig` for shared timing. No new variants unless a
  genuinely new motion need appears — the point of `motionVariants.js` is that timing stays
  consistent site-wide.
- Honour `useReducedMotion()`: no panel scale, no blinking caret. Text still streams —
  streaming is data arrival, not decoration.
- Thread container is `role="log" aria-live="polite"` so screen readers announce replies
  without interrupting.
- `Escape` closes the panel. Focus moves to the input on open and returns to the launcher on
  close. The launcher carries a real `aria-label` (`IconButton` already requires `label`).
- Auto-scroll to the newest message, but stop auto-scrolling if the visitor has scrolled up.

---

## 9. Implementation checklist

Each phase is independently testable — don't start the next until the current one is
verified.

**Phase 0 — Foundations**
- [ ] Enable `vector`; create `knowledge_documents`, `knowledge_chunks`, and the HNSW index
- [ ] Create the `match_knowledge_chunks` function; add anon select policies
- [ ] Set `GROQ_API_KEY`, `INGEST_SECRET`, `IP_HASH_SALT` as Edge Function secrets
- [ ] Widen the `ROUTES` handler type in `index.ts`; fix the `getProjects` order option

**Phase 1 — Chat route, non-streaming**
- [ ] `groq.ts` with a plain (`stream: false`) completion
- [ ] `chat.ts`: parse body, assemble system prompt from the reused DB handlers, return JSON
- [ ] Verify end-to-end with `curl` before any frontend exists

**Phase 2 — Knowledge ingest**
- [ ] Write `knowledge/cv.md`, `knowledge/linkedin.md`, `knowledge/faq.md`
- [ ] `knowledge.ts`: chunking + `gte-small` embedding + secret-guarded `ingest` handler
- [ ] `scripts/ingest.mjs` + `npm run ingest`
- [ ] Wire the knowledge base into `chat.ts` — full injection by default, retrieval behind
      the token threshold; order the prompt static-first so caching can hit

**Phase 3 — Streaming**
- [ ] Switch Groq to `stream: true`; transform its SSE into the in-house event shape
- [ ] Return `text/event-stream` with the existing CORS headers

**Phase 4 — Widget**
- [ ] Build the chat components, hook, and service; add `sendChat` to `portfolioAPI`
- [ ] Mount in `MainLayout` after `<Footer />`
- [ ] Motion, reduced-motion, keyboard, and screen-reader passes

**Phase 5 — Guardrails**
- [ ] `chat_rate_limits` + `chat_logs` tables (service-role only)
- [ ] Salted IP hashing, hourly/daily caps, `429` path with a friendly message
- [ ] Input/history/output caps enforced server-side, not just in the UI
- [ ] Logging disclosure line in the widget footer

**Phase 6 — Documentation**
- [ ] `CLAUDE.md`: new routes, the new `portfolioAPI` method, the `knowledge/` directory, the
      split Edge Function files. (While there: its Styling section is stale — it describes a
      light palette with Space Grotesk/JetBrains Mono, but `src/index.css` is a dark navy and
      gold theme using Rajdhani/IBM Plex Mono, and `--gradient-hero` no longer exists.)
- [ ] `PRODUCT.md`: Capabilities and Constraints now includes an AI surface and a logged,
      rate-limited write endpoint — the "read-only public site" line needs qualifying
- [ ] `README.md`: the ingest workflow and required secrets

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| Groq's model line-up churns — two Llama models were retired in June 2026 alone | Model ID lives in one constant in `groq.ts`; check the deprecations page before each deploy |
| SSE behaviour through `functions.invoke` and Vercel's edge network | Verify streaming end-to-end in Phase 3, before the widget is built; documented `fetch` fallback in `chatService.js` |
| `gte-small` retrieval quality as the corpus grows | Doesn't bind until retrieval switches on past ~8k KB tokens; swapping to a paid embeddings API is one function plus a column-width migration |
| Prompt caching silently stops hitting, and input cost doubles without any visible failure | Keep the prefix byte-stable — no timestamps, no reordered chunks above the question. Watch Groq's `cached_tokens` in the usage payload when logging (§7) |
| `knowledge/*.md` drifting from the Supabase content | Postgres stays the source of truth for skills/experience/projects — `knowledge/` covers only narrative the DB doesn't hold. Never duplicate a project description into both |
| The bot saying something Jeffrey wouldn't | Temperature 0.3, hard no-fabrication rule, third-person framing, no commitments on his behalf. `chat_logs` exists partly so this is observable rather than assumed |
| Ingest is manual, so a stale CV is invisible | `knowledge_documents.updated_at` makes staleness queryable; consider surfacing it in the ingest script's output |
