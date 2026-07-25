import { portfolioAPI } from "@/lib/supabaseClient";

// Grouping by category now happens inside the `portfolio` Edge Function's
// /skills route (supabase/functions/portfolio/index.ts), so this just
// passes the already-shaped { id, category, items[] }[] through.
export async function getSkills() {
  const { data, error } = await portfolioAPI.getSkills();

  if (error) throw error;
  return data;
}
