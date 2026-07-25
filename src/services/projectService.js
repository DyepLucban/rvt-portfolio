import { portfolioAPI } from "@/lib/supabaseClient";

export async function getProjects() {
  const { data, error } = await portfolioAPI.getProjects();

  console.log('======>', data)

  if (error) throw error;
  
  return data;
}
