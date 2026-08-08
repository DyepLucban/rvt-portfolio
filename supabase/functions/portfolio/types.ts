import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// One shared alias for the untyped client. `ReturnType<typeof createClient>`
// resolves its schema generics to `never`, which makes .rpc() uncallable —
// spelling the generics out as `any` keeps the client usable without
// generating a full Database type for three tables.
export type Client = SupabaseClient<any, any, any>;
