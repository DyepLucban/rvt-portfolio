import { createClient } from "@supabase/supabase-js";

// Single shared client — every service imports this instead of calling
// createClient again, so there's one connection/config per app instance.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

// Skills API
export const skillsAPI = {
  browse: () => supabase.from('skills').select('*')
}