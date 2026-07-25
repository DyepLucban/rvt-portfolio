import { skillsAPI } from "@/lib/supabaseClient";

const CATEGORY_ORDER = ["Backend", "Web", "Tools", "Game Development", "Practices"];

export async function getSkills() {
  const { data, error } = await skillsAPI.browse();
  console.log('===>', data)
  if (error) throw error;

  const byCategory = new Map();
  for (const { category, name } of data) {
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push(name);
  }

  const known = CATEGORY_ORDER.filter((category) => byCategory.has(category));
  const unknown = [...byCategory.keys()].filter(
    (category) => !CATEGORY_ORDER.includes(category)
  );

  return [...known, ...unknown].map((category, index) => ({
    id: index + 1,
    category,
    items: byCategory.get(category),
  }));
}
