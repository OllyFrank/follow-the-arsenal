import type { HomeAddress } from "../types";

export interface PeriodIssue {
  type: "gap" | "overlap";
  a: HomeAddress;
  b: HomeAddress;
  /** Gap length in days (only set for "gap"). */
  days?: number;
}

/** Checks a set of home-address periods for gaps or overlaps between them. */
export function findPeriodIssues(addresses: HomeAddress[]): PeriodIssue[] {
  const sorted = addresses.slice().sort((a, b) => a.fromDate.localeCompare(b.fromDate));
  const issues: PeriodIssue[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (prev.toDate === null) {
      // An open-ended period followed by another period is itself an overlap.
      issues.push({ type: "overlap", a: prev, b: cur });
      continue;
    }
    if (cur.fromDate > prev.toDate) {
      const days = daysBetween(prev.toDate, cur.fromDate) - 1;
      if (days > 0) issues.push({ type: "gap", a: prev, b: cur, days });
    } else if (cur.fromDate <= prev.toDate) {
      issues.push({ type: "overlap", a: prev, b: cur });
    }
  }

  return issues;
}

function daysBetween(isoA: string, isoB: string): number {
  const a = new Date(isoA + "T00:00:00Z").getTime();
  const b = new Date(isoB + "T00:00:00Z").getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}
