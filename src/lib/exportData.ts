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

// docs/ACCOUNTS_PLAN.md step 5: a JSON export the user can build entirely
// from their own already-loaded data, with no server round-trip.
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

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
