# RVT Portfolio

A personal portfolio web app built with React and Vite. It showcases Me, Projects, Experience, and Skills pages, currently backed by static local data but architected so it can plug into a real API/Supabase backend later with minimal refactoring.

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

4. Start the dev server:
   ```bash
   npm run dev
   ```

### Other Scripts

- `npm run build` — build for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

# Para kay Rene! 
# ![alt text](image.png)
