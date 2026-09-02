# RVT Portfolio

A personal portfolio web app built with React and Vite. It showcases Me, Projects, Experience, and Skills pages, backed by a Supabase Postgres database through a single Deno Edge Function, plus a grounded AI chat widget that answers questions about Jeffrey from his CV and the live site content.

## Tech Stack

**Frontend**
- React 19
- React Router 7
- Vite 8 (build tool / dev server) with `@vitejs/plugin-react`

**Styling & Animation**
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- Framer Motion
- lucide-react, simple-icons (icons)

**Backend / Data**
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Supabase Edge Functions (CLI-managed, see `supabase/functions/`)
- Postgres + pgvector for the chatbot's knowledge base
- Groq (`openai/gpt-oss-120b`) for streamed chat completions

**Tooling**
- ESLint 10

## Getting Started

### Prerequisites
- Node.js >= 20
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd rvt-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then fill in the values in `.env`:
   - `VITE_API_BASE_URL` — base URL for a future API (leave blank while running on static local data)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_SECRET_KEY`
   - `INGEST_SECRET` — shared secret for the knowledge-base ingest endpoint (no `VITE_` prefix: anything prefixed `VITE_` is inlined into the browser bundle)

4. Start the dev server:
   ```bash
   npm run dev
   ```

### Other Scripts

- `npm run build` — build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint
- `npm run ingest` — push `knowledge/*.md` into the chatbot's knowledge base

## AI chat widget

The floating "Know more" widget answers from two sources at once: narrative documents in `knowledge/` (chunked and embedded into Postgres with pgvector), and the live contents of the site's own database, read fresh on every question.

### One-time setup

1. Run `supabase/migrations/20260808000000_ai_chatbot.sql` against the project — `npx supabase db push`, or paste it into the Supabase dashboard SQL editor. It enables `vector` and creates the knowledge, rate-limit, and log tables.

2. Set the Edge Function secrets (these live on Supabase's servers, never in `.env`):

   ```bash
   npx supabase secrets set GROQ_API_KEY=gsk_...
   npx supabase secrets set INGEST_SECRET=$(openssl rand -hex 32)
   npx supabase secrets set IP_HASH_SALT=$(openssl rand -hex 32)
   ```

   Put the same `INGEST_SECRET` in your local `.env` so `npm run ingest` can authenticate.

3. Deploy: `npx supabase functions deploy portfolio`

### Filling in the knowledge base

Edit the markdown in `knowledge/` (see `knowledge/README.md` for how to write it — headings are chunk boundaries, HTML comments are stripped), then:

```bash
npm run ingest            # all files
npm run ingest -- faq     # just knowledge/faq.md
```

Re-running is idempotent: a document's chunks are replaced, never appended.

`knowledge/faq.md` matters most. Read what visitors actually asked and feed it back in:

```sql
select question, created_at from chat_logs order by created_at desc limit 50;
```

### Para kay Rene! 
### ![alt text](image.png)

## TEST CHANGES FOR WEBHOOK v4
