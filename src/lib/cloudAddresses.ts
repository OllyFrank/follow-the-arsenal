import type { HomeAddress } from "../types";
import { supabase } from "./supabaseClient";

interface AddressRow {
  id: string;
  postcode: string;
  label: string | null;
  lat: number;
  lng: number;
  from_date: string;
  to_date: string | null;
}

// Coordinates are rounded to 3 decimal places (~100m) before they ever leave
// the device, per docs/ACCOUNTS_PLAN.md — plenty for distance totals, and it
// reduces the precision held about where someone lives.
function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function fromRow(row: AddressRow): HomeAddress {
  return {
    id: row.id,
    label: row.label ?? "",
    query: row.postcode,
    latitude: row.lat,
    longitude: row.lng,
    fromDate: row.from_date,
    toDate: row.to_date,
  };
}

function toRow(userId: string, address: HomeAddress): AddressRow & { user_id: string } {
  return {
    id: address.id,
    user_id: userId,
    postcode: address.query,
    label: address.label || null,
    lat: round3(address.latitude),
    lng: round3(address.longitude),
    from_date: address.fromDate,
    to_date: address.toDate,
  };
}

export async function fetchAddresses(): Promise<HomeAddress[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("id, postcode, label, lat, lng, from_date, to_date")
    .order("from_date", { ascending: true });
  if (error) throw error;
  return data.map(fromRow);
}

// Mirrors storage.ts's saveHomeAddresses: the app always hands over the full,
// current list, so syncing it means upserting everything present and
// deleting anything that's no longer there.
export async function saveAddresses(userId: string, addresses: HomeAddress[]): Promise<void> {
  const rows = addresses.map((a) => toRow(userId, a));
  if (rows.length > 0) {
    const { error: upsertError } = await supabase.from("addresses").upsert(rows);
    if (upsertError) throw upsertError;
  }

  const keepIds = addresses.map((a) => a.id);
  let deleteQuery = supabase.from("addresses").delete().eq("user_id", userId);
  deleteQuery = keepIds.length > 0 ? deleteQuery.not("id", "in", `(${keepIds.join(",")})`) : deleteQuery;
  const { error: deleteError } = await deleteQuery;
  if (deleteError) throw deleteError;
}
