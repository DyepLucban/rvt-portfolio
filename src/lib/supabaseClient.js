import { createClient } from "@supabase/supabase-js";

// Single shared client — every service imports this instead of calling
// createClient again, so there's one connection/config per app instance.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// One Edge Function ("portfolio"), routed by path per resource — clean
// /functions/v1/portfolio/<resource> URLs, shaping done server-side. Add a
// method here (matching a route in supabase/functions/portfolio/index.ts)
// whenever a new resource comes online.
export const portfolioAPI = {
  getSkills: () => supabase.functions.invoke("portfolio/skills"),
  getExperiences: () => supabase.functions.invoke("portfolio/experiences"),
  getProjects: () => supabase.functions.invoke("portfolio/projects"),
};