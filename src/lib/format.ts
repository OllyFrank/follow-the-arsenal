import type { Fixture } from "../types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDateLong(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "<Month> <year>", e.g. "August 2025" — for grouping fixtures by calendar month. */
export function formatMonthYear(isoDate: string): string {
  const [y, m] = isoDate.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "27 Nov 2007" — the badge logbook's compact date format. */
export function formatDateShort(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return `${d} ${SHORT_MONTHS[m - 1]} ${y}`;
}

export function fixtureLabel(fixture: Fixture): string {
  return `${fixture.homeTeam} v ${fixture.awayTeam}, ${formatDateLong(fixture.date)}`;
}

/** Score oriented as "home team's goals - away team's goals". */
export function formatFixtureScoreLine(fixture: Fixture): string {
  const homeGoals = fixture.homeTeam === "Arsenal" ? fixture.arsenalGoals : fixture.opponentGoals;
  const awayGoals = fixture.awayTeam === "Arsenal" ? fixture.arsenalGoals : fixture.opponentGoals;
  return `${homeGoals}-${awayGoals}`;
}

/** "Sevilla 3-1 Arsenal" — home team first, as in the fixture list, for the
 * badge logbook's match lines. */
export function matchScoreLine(fixture: Fixture): string {
  return `${fixture.homeTeam} ${formatFixtureScoreLine(fixture)} ${fixture.awayTeam}`;
}

/** "matches" -> "match" when the count is 1 — design-handoff/BADGES.md:
 * "Use the singular unit when it is 1 ('1 season to go')." */
export function singularize(unit: string): string {
  return unit.endsWith("s") ? unit.slice(0, -1) : unit;
}

export function googleSearchUrl(fixture: Fixture): string {
  const query = `${fixture.homeTeam} v ${fixture.awayTeam} ${formatDateLong(fixture.date)} ${formatFixtureScoreLine(fixture)}`;
  const url = new URL("https://www.google.com/search");
  url.searchParams.set("q", query);
  return url.toString();
}

export function formatDistance(km: number, unit: "mi" | "km"): string {
  const value = unit === "mi" ? km * 0.621371 : km;
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${unit}`;
}

const ORDINAL_WORDS = [
  "zeroth", "first", "second", "third", "fourth", "fifth",
  "sixth", "seventh", "eighth", "ninth", "tenth",
];

/** "second", "third", ... "tenth", then falls back to "11th", "12th", etc. */
export function ordinal(n: number): string {
  if (n >= 0 && n < ORDINAL_WORDS.length) return ORDINAL_WORDS[n];
  const suffix =
    n % 10 === 1 && n % 100 !== 11 ? "st" :
    n % 10 === 2 && n % 100 !== 12 ? "nd" :
    n % 10 === 3 && n % 100 !== 13 ? "rd" : "th";
  return `${n}${suffix}`;
}
