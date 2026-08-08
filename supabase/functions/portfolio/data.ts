import type { Client } from "./types.ts";

// The three read handlers behind /portfolio/{skills,experiences,projects}.
// Extracted out of index.ts so chat.ts can call them directly for its "live
// facts" context — the bot answers from the same rows the pages render, with
// no snapshot to keep in sync.

export async function getSkills(supabase: Client) {
  const CATEGORY_ORDER = ["Backend", "Web", "Tools", "Game Development", "Practices"];
  const { data, error } = await supabase.from("skills").select("category, name");
  if (error) throw error;

  const byCategory = new Map<string, string[]>();
  for (const { category, name } of data) {
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push(name);
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

export async function getExperience(supabase: Client) {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("id", { ascending: false });

  if (error) throw error;

  return data.map((row: any) => ({
    id: row.id,
    role: row.role,
    company: row.company_name,
    location: row.location,
    start: row.start_date,
    end: row.end_date,
    description: row.description,
    tags: Array.isArray(row.tech_stack)
      ? row.tech_stack
      : JSON.parse(row.tech_stack ?? "[]"),
  }));
}

export async function getProjects(supabase: Client) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    // `{ descending: true }` is not a PostgREST option and was silently
    // ignored, leaving the default ascending order.
    .order("id", { ascending: false });

  if (error) throw error;

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: JSON.parse(row.description ?? "[]"),
    github_url: row.github_url,
    snapshot_url: row.snapshot_url,
    live_url: row.live_url,
    tags: JSON.parse(row.tech_stack ?? "[]"),
  }));
}
