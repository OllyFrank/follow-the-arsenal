import { supabase } from "./supabaseClient";

export async function fetchAttendance(): Promise<string[]> {
  // RLS already scopes this to the signed-in user, so no explicit filter.
  const { data, error } = await supabase.from("attendance").select("match_id");
  if (error) throw error;
  return data.map((row) => row.match_id);
}

export async function addAttendance(userId: string, matchId: string): Promise<void> {
  const { error } = await supabase
    .from("attendance")
    .upsert({ user_id: userId, match_id: matchId }, { onConflict: "user_id,match_id" });
  if (error) throw error;
}

export async function removeAttendance(userId: string, matchId: string): Promise<void> {
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("user_id", userId)
    .eq("match_id", matchId);
  if (error) throw error;
}

export async function bulkAddAttendance(userId: string, matchIds: string[]): Promise<void> {
  if (matchIds.length === 0) return;
  const rows = matchIds.map((matchId) => ({ user_id: userId, match_id: matchId }));
  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "user_id,match_id" });
  if (error) throw error;
}

export async function bulkRemoveAttendance(userId: string, matchIds: string[]): Promise<void> {
  if (matchIds.length === 0) return;
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("user_id", userId)
    .in("match_id", matchIds);
  if (error) throw error;
}
