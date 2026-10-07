import { supabase } from "./supabaseClient";

// 24h re-auth requirement from docs/ACCOUNTS_PLAN.md step 4: protects
// against someone using an unattended, already-signed-in device.
const REAUTH_WINDOW_MS = 24 * 60 * 60 * 1000;

export function needsReauth(lastSignInAt: string | undefined): boolean {
  if (!lastSignInAt) return true;
  return Date.now() - new Date(lastSignInAt).getTime() > REAUTH_WINDOW_MS;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke("delete-account");
  if (error) throw error;
}
