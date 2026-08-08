# AI Chatbot — What Was Built

### (Implementation notes for `AI_CHATBOT_PLAN.md`, written for someone new to RAG)

This is the companion to [`AI_CHATBOT_PLAN.md`](AI_CHATBOT_PLAN.md). The plan says what to
build and why; this says **what actually shipped**, **what the concepts mean**, and **what is
left to do by hand**.

---

## 1. Files

### Backend — `supabase/functions/portfolio/`

The function directory is now split by responsibility instead of one file growing past
readability.

| File | Job | New? |
|---|---|---|
| `index.ts` | Routing only — the `ROUTES` map and `Deno.serve` | modified |
| `http.ts` | `corsHeaders`, `json()`, `errorMessage()` | new |
| `types.ts` | The shared `Client` alias for the untyped Supabase client | new |
| `data.ts` | `getSkills` / `getExperience` / `getProjects` — the three read handlers, moved out of `index.ts` | new (moved) |
| `knowledge.ts` | Chunking, `gte-small` embedding, the `ingest` endpoint | new |
| `chat.ts` | Retrieval, prompt assembly, rate limiting, logging | new |
| `groq.ts` | The Groq request and its SSE transform | new |

**Deviation from the plan:** it listed four new files (`chat`, `knowledge`, `groq`, and a
lightly-widened `index`). Three more were needed. `chat.ts` calls `getSkills()` and `json()`,
and importing those from `index.ts` would be a circular import back into the file that calls
`Deno.serve` — so the shared pieces moved into `http.ts`, `data.ts`, and `types.ts` where both
sides can import them cleanly.

### Frontend

```
src/components/chat/
  ChatWidget.jsx          launcher + panel; owns open/closed state
  ChatPanel.jsx           Frame + PanelHeader "~/ask.me" shell, auto-scroll, error banner
  ChatMessage.jsx         one turn — mono for the assistant, accent-tinted for the visitor
  ChatInput.jsx           textarea + send/stop, 500-char cap, Enter to send
  SuggestedQuestions.jsx  three starter chips built on the existing Tag component

src/hooks/useChat.js      { messages, send, stop, reset, streaming, error }
src/services/chatService.js   async generator over SSE — the ONLY frontend file that knows SSE exists
src/lib/supabaseClient.js     gains sendChat()
src/layouts/MainLayout.jsx    mounts <ChatWidget /> after <Footer />
```

Every component is assembled from primitives that already existed in `src/components/ui/`
(`Frame`, `PanelHeader`, `IconButton`, `Tag`) and styled purely with existing tokens. No new
design language, no new motion variants.

### Everything else

| Path | What |
|---|---|
| `supabase/migrations/20260808000000_ai_chatbot.sql` | Tables, indexes, RLS policies, and two Postgres functions |
| `knowledge/cv.md`, `linkedin.md`, `faq.md` | Source documents for the knowledge base |
| `knowledge/README.md` | How to write and maintain them |
| `scripts/ingest.mjs` + `npm run ingest` | Pushes those files into the database |
| `CLAUDE.md`, `PRODUCT.md`, `README.md`, `.env.example` | Updated |

### Bug fixed along the way

`getProjects` ordered with `.order("id", { descending: true })`. That is not a valid PostgREST
option — it was silently ignored, so the projects list was sorting **ascending** the whole
time. Corrected to `{ ascending: false }`, matching `getExperience`.

---

## 2. The concepts

### The problem

An LLM knows nothing about you. Fine-tuning one on your CV is expensive and wrong-shaped —
you would have to retrain every time you change jobs.

So instead you **paste the relevant facts into the question**:

> "Here are Jeffrey's CV and project list. Now answer: what's his strongest skill?"

That is called **grounding**, and it is the whole trick. Everything below is plumbing around
that one idea.

### Chunking

You can't paste a 40-page corpus into every question — too expensive, too slow. So you cut
documents into pieces you can fetch selectively.

The naive way is every 500 characters, which slices sentences in half. The better way, and
what `knowledge.ts` does, is to **split on markdown headings** — because a heading is a
boundary a human already decided was meaningful.

Three details make it work:

- **Breadcrumbs.** Each chunk carries where it came from
  (`Curriculum Vitae > Experience > Backend Engineer`), so a fragment retrieved on its own
  still knows its context.
- **Overlap.** Sections still over ~800 characters get sliced with ~100 characters of
  overlap, so a sentence spanning a cut survives whole in one of the two halves.
- **Comments are stripped.** `<!-- TODO: ... -->` in the source files never reaches the
  database. That is what makes it safe to ship half-finished documents.

### Embeddings

This is the part that sounds mystical and isn't.

An embedding model reads a piece of text and outputs a list of numbers — here, 384 of them.
That list is a **coordinate**, and texts that mean similar things land near each other in that
384-dimensional space.

```
"Has he shipped a feature end to end?"     →  [0.03, -0.21, 0.44, ...]   ┐
"owned a project from schema to UI"        →  [0.04, -0.19, 0.41, ...]   ┘  close together

"What's his notice period?"                →  [-0.55, 0.30, -0.02, ...]     far away
```

Those first two share almost no words, but their coordinates are nearly identical. That's the
entire point: **search by meaning, not by keyword.**

The model here is `gte-small`, which Supabase ships **inside** the Edge Runtime. No API key,
no vendor, no per-call cost. Groq is inference-only and has no embeddings endpoint at all —
which is exactly why this split exists.

### pgvector

Postgres can't natively store or compare those coordinate lists. The `vector` extension adds:

- a `vector(384)` column type,
- the `<=>` operator — cosine distance, i.e. "how far apart are these two meanings",
- an **HNSW index**, which makes that search fast without comparing against every single row.

The `match_knowledge_chunks` SQL function wraps all of it, so the Edge Function just asks for
"the 6 closest chunks to this question" and gets rows back. Keeping the SQL in the database
keeps the Edge Function thin.

### Ingestion

The offline half. Runs when *you* type `npm run ingest`, not when a visitor asks something:

```
knowledge/faq.md
   → strip HTML comments
   → split on headings, add breadcrumbs, slice anything oversized
   → embed each chunk with gte-small
   → store text + vector in knowledge_chunks
```

Re-running **replaces** a document's chunks rather than appending, so editing a file never
leaves the old wording behind to be retrieved later. That idempotence is why a manual CLI step
is fine here — documents change a few times a year, and a versioned, reviewable run beats an
admin UI nobody maintains.

### RAG

**R**etrieval-**A**ugmented **G**eneration is just those pieces in order:

```
question → embed it → find nearest chunks → paste into prompt → generate answer
```

That's it. The acronym is bigger than the idea.

### Streaming

Waiting 8 seconds for a complete answer feels broken. So Groq sends the answer word by word
over **SSE** (server-sent events — a long-lived HTTP response that dribbles out `data: {...}`
lines).

`groq.ts` re-emits those in *our own* shape rather than forwarding Groq's:

```
data: {"delta":"Jeffrey "}
data: {"delta":"spent "}
data: {"done":true}
```

So the browser never learns which inference provider is behind it. Swapping providers later
touches exactly one file. Errors mid-stream arrive as `data: {"error":"..."}` so the widget can
show a failure instead of hanging on a stream that just stops.

---

## 3. How a single question flows

```
ChatWidget → useChat → chatService → portfolioAPI.sendChat
  → Edge Function "portfolio/chat"
      ├── rate limit check          bump_chat_rate_limit() — atomic, one round trip
      ├── knowledge base            all chunks (or match_knowledge_chunks past the threshold)
      ├── getSkills/Experience/Projects   ← the existing handlers, reused not duplicated
      ├── Groq chat/completions (stream: true)
      │      └── re-emitted as our own SSE → browser
      └── chat_logs insert          after the stream finishes
```

The important design point: **the existing handlers supply the "live facts" half.** They are
called directly rather than snapshotted, so editing a project row in Supabase changes the
bot's answer on the very next question — no re-ingest. The `knowledge/` chunks supply the
*narrative* half: the story, the motivations, the things a database row can't hold.

Which is also the rule for maintaining it: **never duplicate a project description into
both.** Postgres stays the source of truth for skills, experience, and projects. Duplication
is how the bot ends up contradicting the site.

---

## 4. The one counterintuitive decision

**Retrieval is fully built and switched off.**

The corpus is maybe 3–6k tokens. The model's context window is 131k. It *all fits* — so
`chat.ts` injects the whole knowledge base and skips retrieval, flipping to `matchChunks`
automatically only once the corpus passes ~8k estimated tokens:

```ts
const RETRIEVAL_TOKEN_THRESHOLD = 8_000;

const chunks = kbTokenEstimate <= RETRIEVAL_TOKEN_THRESHOLD
  ? allChunks                             // today
  : await matchChunks(supabase, message); // when the KB outgrows the window
```

That is not laziness. At this size full injection is *strictly better*:

| | Full injection | Top-k retrieval |
|---|---|---|
| Recall | Perfect — the model sees everything | Can miss; "top 6" is a guess |
| Latency | One API call | Plus an embedding call and a vector query |
| Cost | 50% off input after the first request | Cache never hits |
| Synthesis questions | Works | **Breaks** |

**On cost:** Groq discounts input tokens by 50% when a prompt's opening bytes are identical to
a previous request. A fixed knowledge base is byte-identical every time. Retrieved chunks
change with every question, so retrieval would forfeit that discount on every single request.

**On synthesis:** recruiters ask "is he more backend or full-stack?", "what's the through-line
in his work?", "what's his strongest skill?" Those need the *whole* corpus at once. Top-6
chunk retrieval is precisely the wrong tool for them.

> ### ⚠ The rule that follows from this
>
> **Never put anything per-request above the question in the prompt.** A `new Date()` at the
> top of the system message, or reshuffled chunks, silently doubles input cost with no visible
> failure. Watch `cached_tokens` in `chat_logs` to confirm the cache is still hitting.

Retrieval still got built, because the corpus grows — project write-ups, case studies, an FAQ
that expands every time someone asks something new. Retrofitting a retrieval path into a live
prompt pipeline is worse than shipping one that's dormant. The vectors and the HNSW index
already exist, so crossing the threshold later is a config change, not a migration.

---

## 5. Guardrails

This is a public URL with no authentication, calling a paid API. All of these ship enabled.

| Guardrail | Detail |
|---|---|
| **Scope-lock prompt** | Professional topics only; refuse-and-redirect otherwise; hard no-fabrication rule; third person, never impersonating Jeffrey, never committing him to availability or rates |
| **Input caps** | 500 chars per message and 8 turns of history — enforced server-side, not just in the UI. `max_completion_tokens: 600` |
| **Per-IP rate limit** | 15/hour and 60/day via `bump_chat_rate_limit()`. Over the cap returns `429` with "ask me again in a bit, or just email Jeffrey" |
| **Chat logging** | Every exchange into `chat_logs`, plus a "conversations are logged" line in the widget footer |

Two things worth knowing:

- **Raw IPs are never stored.** The `x-forwarded-for` address is SHA-256'd with a secret salt
  before it touches a table. Rate limiting and abuse investigation stay possible; a log of
  visitor IP addresses never accumulates.
- **The rate-limit check is atomic.** It is one Postgres function, not a read-then-write from
  the Edge Function — otherwise two simultaneous requests could both read "14 so far" and both
  be allowed through.

`chat_rate_limits` and `chat_logs` are service-role-only (RLS on, **no anon policy at all**),
so `chat.ts` builds a second service-role client just for those writes. Every read stays on the
anon client. The knowledge tables get an anon *select* policy — it's a public CV on a public
site, there's nothing to hide.

---

## 6. What is left to do by hand

Three steps. None of them are code, and none could be done for you.

### Step 1 — Run the migration

Paste `supabase/migrations/20260808000000_ai_chatbot.sql` into the Supabase dashboard SQL
editor, or:

```bash
npx supabase db push
```

It enables `vector` and creates `knowledge_documents`, `knowledge_chunks`, `chat_rate_limits`,
`chat_logs`, the HNSW index, both Postgres functions, and the RLS policies.

### Step 2 — Set the secrets and deploy

```bash
npx supabase secrets set GROQ_API_KEY=gsk_...
npx supabase secrets set INGEST_SECRET=$(openssl rand -hex 32)
npx supabase secrets set IP_HASH_SALT=$(openssl rand -hex 32)

npx supabase functions deploy portfolio
```

Then put that **same** `INGEST_SECRET` into `.env` so `npm run ingest` can authenticate.

> The Groq key must **never** be a `VITE_*` variable. Anything prefixed `VITE_` is inlined into
> the client bundle at build time and readable by every visitor. `npx supabase secrets set`
> injects into `Deno.env` at runtime, server-side, where it belongs.

For local `npx supabase functions serve`, the same three values go in
`supabase/functions/portfolio/.env.local` (already gitignored).

### Step 3 — Write the knowledge base

There is no `cv.pdf` in this repo, and employment history is not something to invent. So:

| File | State |
|---|---|
| `knowledge/cv.md` | **Scaffold.** Heading structure only; every unknown sits in an HTML comment |
| `knowledge/linkedin.md` | **Scaffold.** Same |
| `knowledge/faq.md` | **Partly real** — positioning, contact, how the site is built, all grounded in `PRODUCT.md` and the actual code. The rest is commented TODOs |

Because comments are stripped before chunking, unfinished sections are safe: the bot simply
says it doesn't know and points to the email address, rather than guessing.

The commented-out FAQ questions are the ones only you can answer — relocation, notice period,
remote/onsite, salary stance, the why-backend story, what you're looking for next.

Convert the two PDFs **by hand, once**. Automated extraction exists, but CV and LinkedIn PDFs
are *designed* documents — multi-column layouts, styled headings, icon glyphs — and extractors
reliably interleave columns and flatten headings into body text. Since headings are what the
chunker splits on, a mangled heading structure degrades every downstream answer.

Then:

```bash
npm run ingest            # all files
npm run ingest -- faq     # just knowledge/faq.md
```

---

## 7. The maintenance loop

At this corpus size the answer-quality ceiling is set entirely by **what the documents say**,
not by how they're fetched. An hour spent on `faq.md` beats any amount of retrieval tuning.

So, monthly:

```sql
select question, created_at from chat_logs order by created_at desc limit 50;
```

Read what visitors actually asked. Feed the real questions back into `knowledge/faq.md`.
Re-ingest. That loop *is* the feature — the logging exists for it, not for analytics.

Worth watching in the same table:

```sql
-- Is prompt caching still hitting? cached_tokens should be most of prompt_tokens.
select created_at, prompt_tokens, cached_tokens from chat_logs order by created_at desc limit 20;
```

---

## 8. Verification performed

| Check | Result |
|---|---|
| `npm run build` | Passes |
| `npm run lint` | No new errors (the 173 pre-existing ones are all vendored files under `.github/skills/`) |
| `deno check` | Clean across all seven function files |
| Chunker | Tested: breadcrumbs correct, comments stripped, oversized sections split with overlap, empty sections dropped |
| SSE round-trip | Tested against a stubbed Groq response deliberately sliced at 17-byte boundaries — mid-JSON splits reassemble correctly, usage and `cached_tokens` captured |
| Widget in a real browser | Opens; focus lands in the textarea; Escape closes and returns focus to the launcher; the error path renders cleanly |

**Not verified, because it requires the three manual steps above:** the live Groq call, real
embeddings against real content, and streaming through Vercel's edge network. Do those in that
order — the plan's Phase 3 risk note about SSE behaviour through `functions.invoke` is worth
confirming with `curl` before trusting the widget.

Current expected behaviour before deploying: the widget renders and the error banner reads
`Unknown resource "chat"`, because the deployed function predates these routes. That is the
correct failure.

---

## 9. Known risks

| Risk | Mitigation |
|---|---|
| Groq's model line-up churns | The model ID is one constant in `groq.ts`. Check `console.groq.com/docs/deprecations` before each deploy |
| SSE through `functions.invoke` / Vercel | Verified in principle; confirm end-to-end after deploying. `chatService.js` can fall back to plain `fetch` — a change confined to that one file |
| Prompt caching silently stops hitting | Keep the prefix byte-stable. Watch `cached_tokens` (§7) |
| `knowledge/*.md` drifting from Supabase content | Never duplicate a project or experience description into both |
| The bot saying something Jeffrey wouldn't | Temperature 0.3, hard no-fabrication rule, third-person framing, no commitments on his behalf. `chat_logs` exists partly so this is observable rather than assumed |
| Ingest is manual, so a stale CV is invisible | `knowledge_documents.updated_at` makes staleness queryable |
