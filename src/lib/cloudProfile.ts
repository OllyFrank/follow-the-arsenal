import type { ConsentStatus } from "./privacyNotice";
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

export async function fetchConsentStatus(): Promise<ConsentStatus> {
  const { data, error } = await supabase
    .from("profiles")
    .select("privacy_version_accepted, age_confirmed_13_plus")
    .single();
  if (error) throw error;
  return {
    privacyVersionAccepted: data.privacy_version_accepted,
    ageConfirmed13Plus: data.age_confirmed_13_plus,
  };
}

export async function acceptConsent(userId: string, version: number): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ privacy_version_accepted: version, age_confirmed_13_plus: true })
    .eq("id", userId);
  if (error) throw error;
}
