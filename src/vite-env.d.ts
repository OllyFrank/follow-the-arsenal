/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** "true" to enable the accounts feature; anything else (including unset) disables it. */
  readonly VITE_ACCOUNTS_ENABLED: string;
}
