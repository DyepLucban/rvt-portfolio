# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A personal portfolio site (React 19 + Vite + Tailwind CSS 4) with four routed pages (Me, Experience, Skills, Projects) backed by a Supabase Postgres database via a single Edge Function, plus a grounded chat widget ("Know more") on every route that answers questions about Jeffrey from an ingested knowledge base and the live database.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build (outputs to `dist/`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint (flat config in `eslint.config.js`)
- `npm run ingest` — push `knowledge/*.md` into the chatbot's knowledge base (`npm run ingest -- faq` for one file)

There is no test suite configured in this repo.

### Supabase Edge Function

The `portfolio` Edge Function lives in `supabase/functions/portfolio/` (Deno). To work on it locally, use the Supabase CLI (already a devDependency, invoke via `npx supabase ...`):

- `npx supabase functions serve portfolio` — run the function locally
- `npx supabase functions deploy portfolio` — deploy changes
- `deno check supabase/functions/portfolio/index.ts` — type-check it without deploying

Its files, one responsibility each:

| File | Responsibility |
|---|---|
| `index.ts` | The `ROUTES` map and `Deno.serve` — routing only |
| `http.ts` | `corsHeaders`, `json()`, `errorMessage()` (separate from `index.ts` so handlers can import them without a circular import) |
| `types.ts` | The shared `Client` alias for the untyped Supabase client |
| `data.ts` | `getSkills` / `getExperience` / `getProjects` — the three read handlers |
| `chat.ts` | Retrieval, prompt assembly, rate limiting, logging |
| `knowledge.ts` | Chunking, `gte-small` embedding, the `ingest` handler |
| `groq.ts` | The Groq request and its SSE transform — the only file that knows Groq exists |

Secrets are set with the CLI, never in `.env` (a `VITE_`-prefixed key would be inlined into the browser bundle):

```bash
npx supabase secrets set GROQ_API_KEY=gsk_...   # inference
npx supabase secrets set INGEST_SECRET=...      # guards the one write endpoint
npx supabase secrets set IP_HASH_SALT=...       # salts IP hashes for rate limiting
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically. For local `functions serve`, put the three secrets in `supabase/functions/portfolio/.env.local` (gitignored).

## Architecture

### Data flow: Component → Hook → Service → Supabase Edge Function → Postgres

Every data-backed page follows the same layered pattern; **never let a component call Supabase or fetch directly**:

1. `src/services/*Service.js` — the only files that know about Supabase. Each calls `portfolioAPI.<method>()` from `src/lib/supabaseClient.js` and returns plain data (throws on error).
2. `src/hooks/use*.js` — call the service inside `useEffect`, and expose `{ data, loading, error }` to components.
3. `src/pages/*.jsx` — thin route-level wrappers that render the corresponding `src/sections/<Name>/<Name>.jsx` component, which uses the hook.

`src/lib/supabaseClient.js` defines one shared Supabase client and a single `portfolioAPI` object with one method per resource (`getSkills`, `getExperiences`, `getProjects`, `sendChat`). Each method calls `supabase.functions.invoke("portfolio/<resource>")` — a single Deno Edge Function fields all five routes (`skills`, `experiences`, `projects`, `chat`, `ingest`) by inspecting the URL path segment (see the `ROUTES` map in `index.ts`), queries the corresponding table, and shapes the JSON response server-side (e.g. skills are grouped by category with a fixed `CATEGORY_ORDER`). Add a new resource by adding a handler + `ROUTES` entry in the Edge Function, then a matching method on `portfolioAPI`.

Handlers receive `(supabase, req)` and may return either a plain value (which `index.ts` wraps with `json()`) or a `Response` directly. `chat` uses the second form to stream; the three read handlers ignore both extras.

**`src/data/*.js` is legacy** — it held static local data from before the Supabase migration and is no longer imported by any service. Don't add new data there; it's effectively dead code kept for reference.

**`src/App.jsx` is unused** — `src/main.jsx` renders `<RouterProvider router={router} />` directly (see `src/routes/router.jsx`), not `<App />`. `App.jsx` predates routing and composed sections into one long scrolling page.

### The chat widget ("Know more")

A floating widget mounted once in `MainLayout`, **after `<Footer />` and outside the `AnimatePresence` that wraps `<Outlet />`** — inside it, the widget would unmount on every route change and wipe a mid-conversation thread.

It follows the same layering as everything else: `ChatWidget` → `useChat` → `chatService` → `portfolioAPI.sendChat` → `portfolio/chat`. Frontend files live in `src/components/chat/` (`ChatWidget`, `ChatPanel`, `ChatMessage`, `ChatInput`, `SuggestedQuestions`), `src/hooks/useChat.js`, and `src/services/chatService.js`. `chatService.js` is an async generator yielding text deltas and is **the only frontend file that knows SSE exists**; `useChat` is the one hook that's imperative rather than fetch-on-mount, exposing `{ messages, send, stop, reset, streaming, error }`. The thread lives in React state only — nothing is persisted. `ChatWidget` funnels every close path (the X, Escape, the launcher toggle) through one `close()` that calls `reset()`, so closing the panel discards the conversation and reopening always starts fresh. No chat history by design.

Server side, `chat.ts` assembles context from two halves:

- **Narrative** — chunks of `knowledge/*.md`, ingested and embedded ahead of time (see below).
- **Live facts** — `getSkills` / `getExperience` / `getProjects` from `data.ts`, called directly rather than snapshotted. Edit a project row in Supabase and the next answer changes with no re-ingest.

**The knowledge base.** `knowledge/cv.md`, `knowledge/linkedin.md`, and `knowledge/faq.md` hold narrative the database can't — the story, the motivations, the recruiter FAQ. Markdown headings are chunk boundaries; sections over ~800 characters are split with ~100 characters of overlap; HTML comments are stripped before chunking (so `<!-- TODO -->` placeholders are never ingested). Chunks are embedded with `Supabase.ai.Session("gte-small")` (384 dimensions, in-process in the Edge Runtime — Groq has no embeddings endpoint) and stored in `knowledge_chunks` with an HNSW index. `npm run ingest` replaces a document's chunks wholesale, so re-running is idempotent. **Never duplicate a project or experience description into `knowledge/`** — Postgres stays the source of truth for those, and duplication is how the bot ends up contradicting the site.

**Retrieval is built but dormant.** While the corpus is under ~8k estimated tokens (`RETRIEVAL_TOKEN_THRESHOLD` in `chat.ts`), the whole knowledge base is injected: perfect recall, one Groq call, and — decisively — a byte-stable prompt prefix that Groq's cache can hit for 50% off input. Top-k retrieval would forfeit that on every request and breaks synthesis questions ("what's the through-line in his work?"), which is most of what recruiters ask. Past the threshold, `matchChunks` takes over automatically via the `match_knowledge_chunks` Postgres function. Because of caching, **never put anything per-request (a timestamp, reshuffled chunks) above the question in the prompt.**

**Guardrails**, all in v1: a scope-locked no-fabrication system prompt; 500 chars per message and 8 turns of history enforced server-side as well as in the UI; `max_completion_tokens: 600`; per-IP rate limits of 15/hour and 60/day via the `bump_chat_rate_limit` Postgres function; and `chat_logs` for every exchange, disclosed in the widget footer. Client IPs are salted-SHA-256'd with `IP_HASH_SALT` and **never stored raw**. `chat_rate_limits` and `chat_logs` are service-role-only (RLS on, no anon policy), so `chat.ts` builds a second service-role client for those writes while every read stays on the anon client `index.ts` passes in.

Reading `chat_logs` monthly and feeding real questions back into `knowledge/faq.md` is the intended maintenance loop — at this corpus size, answer quality is set by what the documents say, not by how they're fetched.

**Database objects** live in `supabase/migrations/20260808000000_ai_chatbot.sql`: the `vector` extension, `knowledge_documents`, `knowledge_chunks`, `match_knowledge_chunks`, `chat_rate_limits`, `chat_logs`, `bump_chat_rate_limit`, and the RLS policies.

### Routing & layout

- Routes are centralized in `src/routes/router.jsx` (`createBrowserRouter`): `/` (Me), `/experience`, `/skills`, `/projects`, `*` (404 → `NotFound`).
- `src/layouts/MainLayout.jsx` wraps every route with the shared `Navbar` + `<Outlet />` + `Footer`, plus `<ChatWidget />` outside the route transition.
- `vercel.json` rewrites all paths to `/index.html` so client-side routes survive a hard refresh/deploy.

### Styling & theming

- Design tokens are CSS variables defined in `src/index.css` (`--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-accent-warm`, `--color-accent-green`, `--color-accent-active`, `--color-accent-inactive`, plus `--grid-dot` and `--bg-image`), wired into Tailwind via `@tailwindcss/vite`. Components use semantic Tailwind classes (e.g. `bg-surface`, `text-accent`) rather than raw hex values — reference the tokens, don't hardcode colors.
- Current theme is a single **dark navy and gold** palette (no dark/light toggle by design).
- Typography: **Rajdhani** (`font-display`, headings), **Inter** (`font-body`), **IBM Plex Mono** (`font-mono` — tags, dates, section eyebrows, and machine output like chat answers; used to visually mark "metadata" vs. prose).
- Icons: **lucide-react** is the default (SVG, inherits `currentColor`); `simple-icons` / `src/components/ui/BrandIcons.jsx` fill gaps for brand logos Lucide doesn't have. Never use icon fonts or raster icon sets.
- Motion: **Framer Motion**, with shared variants/transitions centralized in `src/lib/motionVariants.js` so animation timing/easing stays consistent across pages rather than ad hoc per component. Route transitions are handled via `AnimatePresence` around `<Outlet />` in `MainLayout`. Respect `prefers-reduced-motion` (via Framer's `useReducedMotion()`).

### Path aliases

`@/` maps to `src/` — configured in both `vite.config.js` (for the bundler) and `jsconfig.json` (for editor tooling). Keep both in sync if the alias ever changes.

### Environment variables

Defined in `.env` (gitignored; copy from `.env.example`):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — used by `src/lib/supabaseClient.js`
- `VITE_SUPABASE_SECRET_KEY` — server-side/Edge Function use only, never referenced from `src/`
- `VITE_API_BASE_URL` — leftover from the pre-Supabase static-data plan; currently unused
- `INGEST_SECRET` — **unprefixed on purpose**: read by `scripts/ingest.mjs` on your machine, never bundled. Must match the Edge Function secret of the same name.

Anything prefixed `VITE_` is inlined into the client bundle at build time and readable by every visitor. The Groq key must never live there — see the Edge Function secrets above.

## Reference docs

`documentations/SPEC.md` and `documentations/DESIGN_REVAMP.md` are historical planning docs (the original static-data architecture plan and a later theme/navigation revamp spec). Most of what they proposed has since been implemented and superseded by the Supabase-backed architecture described above — treat them as historical context, not a current source of truth, when they conflict with the code.
