import { skills } from "@/data/skills";

// Static now, async-shaped for a future API. Only this file changes to go live.
export async function getSkills() {
  return Promise.resolve(skills);
}
