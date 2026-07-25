import { projects } from "@/data/projects";

// The abstraction layer between UI and data source. Returns Promises now so
// components never learn whether data came from a local array or the network.
//
// To go live later, this is the ONLY file you touch — e.g.:
//   const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/projects`);
//   if (!res.ok) throw new Error("Failed to fetch projects");
//   return res.json();

export async function getProjects() {
  return Promise.resolve(projects);
}

export async function getProjectBySlug(slug) {
  const found = projects.find((p) => p.slug === slug);
  return Promise.resolve(found ?? null);
}

// IF USING SUPABASE FOR FETCHING PROJECTS
// export async function getProjects() {
//   const { data, error } = await portfolioAPI.getProjects();

//   if (error) throw error;
//   return data;
// }