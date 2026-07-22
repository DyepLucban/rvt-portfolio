import { experience } from "@/data/experience";

// Static now, async-shaped for a future API. Only this file changes to go live.
export async function getExperience() {
  return Promise.resolve(experience);
}
