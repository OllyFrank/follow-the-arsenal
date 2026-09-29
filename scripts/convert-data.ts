// One-off converter: We_All_Follow_The_Arsenal_Data_Final.xlsx -> src/data/{fixtures,grounds}.json
// Run with: npm run convert-data
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE_XLSX = path.join(ROOT, "We_All_Follow_The_Arsenal_Data_Final.xlsx");
const OUT_DIR = path.join(ROOT, "src", "data");

const EXPECTED_FIXTURE_COUNT = 2101;
const EXPECTED_GROUND_COUNT = 180;

// Deliberately NOT using XLSX's `cellDates` option: it converts the date
// serial to a JS Date via the local timezone offset, which shifts the
// stored date by a day whenever the host's local time (BST vs GMT, for
// this UK data) differs from the offset implied by Excel's date system.
// `SSF.parse_date_code` reads the y/m/d straight off the serial, with no
// timezone involved.
function toIsoDate(value: unknown): string {
  if (typeof value !== "number") {
    throw new Error(`Expected a date serial number, got: ${String(value)}`);
  }
  const parsed = XLSX.SSF.parse_date_code(value);
  const y = parsed.y;
  const m = String(parsed.m).padStart(2, "0");
  const d = String(parsed.d).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeBlank(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str.length === 0 ? null : str;
}

function main() {
  const buf = readFileSync(SOURCE_XLSX);
  const workbook = XLSX.read(buf, { type: "buffer" });

  const fixturesSheet = workbook.Sheets["Fixtures"];
  const groundsSheet = workbook.Sheets["Grounds"];
  if (!fixturesSheet) throw new Error("Fixtures sheet not found");
  if (!groundsSheet) throw new Error("Grounds sheet not found");

  const fixtureRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(fixturesSheet, {
    defval: null,
  });
  const groundRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(groundsSheet, {
    defval: null,
  });

  const fixtures = fixtureRows.map((row) => ({
    matchId: String(row["Match ID"]),
    date: toIsoDate(row["Date"]),
    season: String(row["Season"]),
    competition: String(row["Competition"]),
    stage: String(row["Stage"]),
    homeTeam: String(row["Home team"]),
    awayTeam: String(row["Away team"]),
    opponent: String(row["Opponent"]),
    venueType: String(row["H/A/N"]),
    groundId: String(row["Ground ID"]),
    venue: String(row["Venue"]),
    arsenalGoals: Number(row["Arsenal goals"]),
    opponentGoals: Number(row["Opponent goals"]),
    result: String(row["Result"]),
    penaltyShootOut: normalizeBlank(row["Penalty shoot-out"]),
    behindClosedDoors: normalizeBlank(row["Behind closed doors"]) === "Y",
    countsInRecord: normalizeBlank(row["Counts in record"]) !== "N",
    notes: normalizeBlank(row["Notes"]),
  }));

  const grounds = groundRows.map((row) => ({
    groundId: String(row["Ground ID"]),
    ground: String(row["Ground"]),
    alsoKnownAs: normalizeBlank(row["Also known as (source spellings)"]),
    usedBy: normalizeBlank(row["Used by (in this data)"]),
    country: String(row["Country"]),
    latitude: Number(row["Latitude"]),
    longitude: Number(row["Longitude"]),
    confidence: String(row["Confidence"]),
  }));

  if (fixtures.length !== EXPECTED_FIXTURE_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_FIXTURE_COUNT} fixtures, got ${fixtures.length}`,
    );
  }
  if (grounds.length !== EXPECTED_GROUND_COUNT) {
    throw new Error(`Expected ${EXPECTED_GROUND_COUNT} grounds, got ${grounds.length}`);
  }

  const missingGroundIds = new Set(fixtures.map((f) => f.groundId));
  const knownGroundIds = new Set(grounds.map((g) => g.groundId));
  for (const id of missingGroundIds) {
    if (!knownGroundIds.has(id)) {
      throw new Error(`Fixture references unknown Ground ID: ${id}`);
    }
  }

  writeFileSync(path.join(OUT_DIR, "fixtures.json"), JSON.stringify(fixtures, null, 2));
  writeFileSync(path.join(OUT_DIR, "grounds.json"), JSON.stringify(grounds, null, 2));

  console.log(`Wrote ${fixtures.length} fixtures and ${grounds.length} grounds to ${OUT_DIR}`);
}

main();
