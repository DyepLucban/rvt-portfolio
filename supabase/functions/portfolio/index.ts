import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, errorMessage, json } from "./http.ts";
import type { Client } from "./types.ts";
import { getExperience, getProjects, getSkills } from "./data.ts";
import { handleChat } from "./chat.ts";
import { handleIngest } from "./knowledge.ts";

// Handlers get the request as a second argument (chat needs the POST body and
// the client IP) and may return a Response directly instead of a value to be
// JSON-wrapped (chat streams). The three read handlers just ignore both.
type Handler = (supabase: Client, req: Request) => Promise<unknown | Response>;

// Path segment after /portfolio/ -> handler.
const ROUTES: Record<string, Handler> = {
  skills: getSkills,
  experiences: getExperience,
  projects: getProjects,
  chat: handleChat,
  ingest: handleIngest,
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
    const result = await handler(supabase, req);
    return result instanceof Response ? result : json(result);
  } catch (error) {
    return json({ error: errorMessage(error) }, 500);
  }
});
