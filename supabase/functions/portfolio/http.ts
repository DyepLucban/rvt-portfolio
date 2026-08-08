// Shared HTTP bits. Lives in its own module (rather than index.ts) so the
// route handlers can import them without importing index.ts back — that would
// be a circular import, and index.ts is the file that calls Deno.serve.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-secret",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Supabase/PostgREST errors are plain objects (not `instanceof Error`), so
// check `.message` directly rather than relying on String(error), which
// stringifies a plain object to "[object Object]".
export function errorMessage(error: unknown) {
  return error && typeof error === "object" && "message" in error
    ? String((error as { message: unknown }).message)
    : String(error);
}
