import { portfolioAPI } from "@/lib/supabaseClient";

export async function getProjects() {
  const { data, error } = await portfolioAPI.getProjects();

  if (error) throw error;
  
  return data;
}
