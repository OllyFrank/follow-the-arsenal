import { supabase } from "./supabaseClient";

export async function fetchUnits(): Promise<"mi" | "km"> {
  const { data, error } = await supabase.from("profiles").select("units").single();
  if (error) throw error;
  return data.units as "mi" | "km";
}

export async function updateUnits(userId: string, units: "mi" | "km"): Promise<void> {
  const { error } = await supabase.from("profiles").update({ units }).eq("id", userId);
  if (error) throw error;
}
