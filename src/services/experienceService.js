import { portfolioAPI } from "@/lib/supabaseClient";

export async function getExperiences() {
  const { data, error } = await portfolioAPI.getExperiences();

  if (error) throw error;
  
  return data;
}
