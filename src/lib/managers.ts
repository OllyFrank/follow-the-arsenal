import type { Manager } from "../types";

/**
 * The manager in charge on a given date. Each entry's reign runs from its
 * `from` date until the next entry's `from` date (exclusive); the last
 * entry's reign is open-ended. Returns null if `date` is before the
 * earliest entry (shouldn't happen for any match in our fixture data).
 */
export function managerForDate(date: string, managers: Manager[]): string | null {
  const sorted = managers.slice().sort((a, b) => a.from.localeCompare(b.from));
  let current: Manager | null = null;
  for (const m of sorted) {
    if (m.from > date) break;
    current = m;
  }
  return current?.manager ?? null;
}
