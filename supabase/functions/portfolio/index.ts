import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getSkills(supabase: ReturnType<typeof createClient>) {
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

async function getExperience(supabase: ReturnType<typeof createClient>) {
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

async function getProjects(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("id", { descending: true });

  if (error) throw error;

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: JSON.parse(row.description ?? []),
    snapshot_url: row.snapshot_url,
    live_url: row.live_url,
    tags: JSON.parse(row.tech_stack ?? "[]")
  }));
}

// Path segment after /portfolio/ -> handler.
const ROUTES: Record<string, (supabase: ReturnType<typeof createClient>) => Promise<unknown>> = {
  skills: getSkills,
  experiences: getExperience,
  projects: getProjects,
};

Deno.serve(async (req) => {
  // Browsers preflight cross-origin POSTs (which is what functions.invoke
  // sends) with an OPTIONS request — has to be answered before the real one.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { pathname } = new URL(req.url);
  const resource = pathname.split("/").filter(Boolean).pop() ?? "";

  const handler = ROUTES[resource];
  if (!handler) {
    return json(
      { error: `Unknown resource "${resource}". Available: ${Object.keys(ROUTES).join(", ")}` },
      404
    );
  }

  // SUPABASE_URL / SUPABASE_ANON_KEY are auto-injected into every Edge Function's environment.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  try {
    return json(await handler(supabase));
  } catch (error) {
    // Supabase/PostgREST errors are plain objects (not `instanceof Error`),
    // so check `.message` directly rather than relying on String(error),
    // which stringifies a plain object to "[object Object]".
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);
    return json({ error: message }, 500);
  }
});
