# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A personal portfolio site (React 19 + Vite + Tailwind CSS 4) with four routed pages (Me, Experience, Skills, Projects) backed by a Supabase Postgres database via a single Edge Function.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build (outputs to `dist/`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint (flat config in `eslint.config.js`)

There is no test suite configured in this repo.

### Supabase Edge Function

The `portfolio` Edge Function lives in `supabase/functions/portfolio/index.ts` (Deno). To work on it locally, use the Supabase CLI (already a devDependency, invoke via `npx supabase ...`):

- `npx supabase functions serve portfolio` — run the function locally
- `npx supabase functions deploy portfolio` — deploy changes

## Architecture

### Data flow: Component → Hook → Service → Supabase Edge Function → Postgres

Every data-backed page follows the same layered pattern; **never let a component call Supabase or fetch directly**:

1. `src/services/*Service.js` — the only files that know about Supabase. Each calls `portfolioAPI.<method>()` from `src/lib/supabaseClient.js` and returns plain data (throws on error).
2. `src/hooks/use*.js` — call the service inside `useEffect`, and expose `{ data, loading, error }` to components.
3. `src/pages/*.jsx` — thin route-level wrappers that render the corresponding `src/sections/<Name>/<Name>.jsx` component, which uses the hook.

`src/lib/supabaseClient.js` defines one shared Supabase client and a single `portfolioAPI` object with one method per resource (`getSkills`, `getExperiences`, `getProjects`). Each method calls `supabase.functions.invoke("portfolio/<resource>")` — a single Deno Edge Function (`supabase/functions/portfolio/index.ts`) fields all three routes (`skills`, `experiences`, `projects`) by inspecting the URL path segment (see the `ROUTES` map at the bottom of that file), queries the corresponding table, and shapes the JSON response server-side (e.g. skills are grouped by category with a fixed `CATEGORY_ORDER`). Add a new resource by adding a handler + `ROUTES` entry in the Edge Function, then a matching method on `portfolioAPI`.

**`src/data/*.js` is legacy** — it held static local data from before the Supabase migration and is no longer imported by any service. Don't add new data there; it's effectively dead code kept for reference.

**`src/App.jsx` is unused** — `src/main.jsx` renders `<RouterProvider router={router} />` directly (see `src/routes/router.jsx`), not `<App />`. `App.jsx` predates routing and composed sections into one long scrolling page.

### Routing & layout

- Routes are centralized in `src/routes/router.jsx` (`createBrowserRouter`): `/` (Me), `/experience`, `/skills`, `/projects`, `*` (404 → `NotFound`).
- `src/layouts/MainLayout.jsx` wraps every route with the shared `Navbar` + `<Outlet />` + `Footer`.
- `vercel.json` rewrites all paths to `/index.html` so client-side routes survive a hard refresh/deploy.

### Styling & theming

- Design tokens are CSS variables defined in `src/index.css` (`--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-accent-warm`, plus `--gradient-hero`), wired into Tailwind via `@tailwindcss/vite`. Components use semantic Tailwind classes (e.g. `bg-surface`, `text-accent`) rather than raw hex values — reference the tokens, don't hardcode colors.
- Current theme is a single light palette (no dark mode / theme toggle by design).
- Typography: **Space Grotesk** (display/headings), **Inter** (body), **JetBrains Mono** (tags, dates, section eyebrows — used to visually mark "metadata" vs. prose).
- Icons: **lucide-react** is the default (SVG, inherits `currentColor`); `simple-icons` / `src/components/ui/BrandIcons.jsx` fill gaps for brand logos Lucide doesn't have. Never use icon fonts or raster icon sets.
- Motion: **Framer Motion**, with shared variants/transitions centralized in `src/lib/motionVariants.js` so animation timing/easing stays consistent across pages rather than ad hoc per component. Route transitions are handled via `AnimatePresence` around `<Outlet />` in `MainLayout`. Respect `prefers-reduced-motion` (via Framer's `useReducedMotion()`).

### Path aliases

`@/` maps to `src/` — configured in both `vite.config.js` (for the bundler) and `jsconfig.json` (for editor tooling). Keep both in sync if the alias ever changes.

### Environment variables

Defined in `.env` (gitignored; copy from `.env.example`):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — used by `src/lib/supabaseClient.js`
- `VITE_SUPABASE_SECRET_KEY` — server-side/Edge Function use only, never referenced from `src/`
- `VITE_API_BASE_URL` — leftover from the pre-Supabase static-data plan; currently unused

## Reference docs

`documentations/SPEC.md` and `documentations/DESIGN_REVAMP.md` are historical planning docs (the original static-data architecture plan and a later theme/navigation revamp spec). Most of what they proposed has since been implemented and superseded by the Supabase-backed architecture described above — treat them as historical context, not a current source of truth, when they conflict with the code.
