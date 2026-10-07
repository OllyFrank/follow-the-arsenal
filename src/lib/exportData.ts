import type { Fixture, HomeAddress } from "../types";

export interface ExportedMatch {
  matchId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
}

export interface ExportPayload {
  exportedAt: string;
  profile: { email: string; units: "mi" | "km" };
  addresses: HomeAddress[];
  attendedMatches: ExportedMatch[];
}

// docs/ACCOUNTS_PLAN.md step 5: an export the user can build entirely from
// their own already-loaded data, with no server round-trip.
export function buildExportPayload(
  email: string,
  units: "mi" | "km",
  addresses: HomeAddress[],
  attendedMatchIds: Set<string>,
  fixtures: Fixture[],
): ExportPayload {
  const attendedMatches = fixtures
    .filter((f) => attendedMatchIds.has(f.matchId))
    .map((f) => ({
      matchId: f.matchId,
      date: f.date,
      homeTeam: f.homeTeam,
      awayTeam: f.awayTeam,
      venue: f.venue,
    }));

  return {
    exportedAt: new Date().toISOString(),
    profile: { email, units },
    addresses,
    attendedMatches,
  };
}

type CsvRow = Record<string, string | number | null>;

function escapeCsvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

// CSV over JSON for this export: it opens directly in Excel/Sheets with no
// fuss, which is what most people actually want from "download my data".
export function toCsv(rows: CsvRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvField(String(row[h] ?? ""))).join(","));
  }
  return lines.join("\n");
}

export function downloadCsv(filename: string, rows: CsvRow[]): void {
  const blob = new Blob([toCsv(rows)], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Profile, addresses and attended matches don't share columns, so a single
// CSV can't hold all three — three small, flat files instead.
export function downloadExportCsvs(payload: ExportPayload): void {
  downloadCsv("arsenal-profile.csv", [payload.profile]);
  downloadCsv(
    "arsenal-addresses.csv",
    payload.addresses.map((a) => ({
      label: a.label,
      postcode: a.query,
      latitude: a.latitude,
      longitude: a.longitude,
      fromDate: a.fromDate,
      toDate: a.toDate,
    })),
  );
  downloadCsv("arsenal-attended-matches.csv", payload.attendedMatches);
}
