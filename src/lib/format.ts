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

/** Score oriented as "home team's goals - away team's goals". */
export function formatFixtureScoreLine(fixture: Fixture): string {
  const homeGoals = fixture.homeTeam === "Arsenal" ? fixture.arsenalGoals : fixture.opponentGoals;
  const awayGoals = fixture.awayTeam === "Arsenal" ? fixture.arsenalGoals : fixture.opponentGoals;
  return `${homeGoals}-${awayGoals}`;
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
