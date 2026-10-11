import type { Fixture } from "../types";
import {
  attendedFixtures,
  computeBiggestMargin,
  computeLongestUnbeatenRun,
  computeLuckyCharmStats,
  countedFixtures,
  tally,
  type LuckyCharmStats,
  type MarginMatch,
  type Record,
  type UnbeatenRunStats,
} from "./stats";
import { badgeReference } from "./badgeReference";

export interface DerbyRecord extends Record {
  goalsFor: number;
  goalsAgainst: number;
}

export interface DerbySectionStats {
  attendedCount: number;
  record: DerbyRecord;
  biggestWin: MarginMatch | null;
  biggestLoss: MarginMatch | null;
  unbeatenRun: UnbeatenRunStats;
  luckyCharm: LuckyCharmStats;
}

export interface DerbyStats {
  northLondon: DerbySectionStats & { firstDerby: Fixture | null };
  london: DerbySectionStats;
}

function computeDerbyRecord(fixtures: Fixture[], attended: Set<string>): DerbyRecord {
  const seen = countedFixtures(attendedFixtures(fixtures, attended));
  const base = tally(seen);
  const goalsFor = seen.reduce((sum, f) => sum + f.arsenalGoals, 0);
  const goalsAgainst = seen.reduce((sum, f) => sum + f.opponentGoals, 0);
  return { ...base, goalsFor, goalsAgainst };
}

function firstAttended(fixtures: Fixture[], attended: Set<string>): Fixture | null {
  const seen = attendedFixtures(fixtures, attended)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  return seen[0] ?? null;
}

function computeSection(fixtures: Fixture[], attended: Set<string>): DerbySectionStats {
  return {
    attendedCount: attendedFixtures(fixtures, attended).length,
    record: computeDerbyRecord(fixtures, attended),
    biggestWin: computeBiggestMargin(fixtures, attended, "W"),
    biggestLoss: computeBiggestMargin(fixtures, attended, "L"),
    unbeatenRun: computeLongestUnbeatenRun(fixtures, attended),
    luckyCharm: computeLuckyCharmStats(fixtures, attended),
  };
}

export function computeDerbyStats(fixtures: Fixture[], attended: Set<string>): DerbyStats {
  const northLondonFixtures = fixtures.filter(
    (f) => f.opponent === badgeReference.northLondonDerbyOpponent,
  );
  const londonClubs = new Set(badgeReference.londonClubs);
  const londonFixtures = fixtures.filter((f) => londonClubs.has(f.opponent));

  return {
    northLondon: {
      ...computeSection(northLondonFixtures, attended),
      firstDerby: firstAttended(northLondonFixtures, attended),
    },
    london: computeSection(londonFixtures, attended),
  };
}
