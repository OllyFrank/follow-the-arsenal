import { createClient } from "@supabase/supabase-js";
import { ACCOUNTS_ENABLED } from "./featureFlags";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Real credentials are only required once accounts are switched on — while
// the feature is flagged off (e.g. in production, pre-launch), useAuth.ts
// never calls Supabase at all, so this client is never actually used and a
// placeholder is enough to satisfy the import.
if (ACCOUNTS_ENABLED && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — check your .env.local file.",
  );
}

export const supabase = createClient(
  ACCOUNTS_ENABLED ? supabaseUrl : "https://placeholder.supabase.co",
  ACCOUNTS_ENABLED ? supabaseAnonKey : "placeholder-anon-key",
);
