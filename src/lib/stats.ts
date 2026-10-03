import type { Fixture, Ground, HomeAddress, Manager, MatchResult } from "../types";
import {
  computeDistances,
  EARTH_CIRCUMFERENCE_KM,
  type MatchDistance,
} from "./distance";
import { managerForDate } from "./managers";

// Shared rule across every stat below: `Behind closed doors = Y` matches
// can never be attended (enforced in the UI, defended here too). Distance
// and grounds stats include `Counts in record = N` (the one voided match);
// every result- or score-based stat excludes it.

function isAttended(fixture: Fixture, attended: Set<string>): boolean {
  return attended.has(fixture.matchId) && !fixture.behindClosedDoors;
}

function attendedFixtures(fixtures: Fixture[], attended: Set<string>): Fixture[] {
  return fixtures.filter((f) => isAttended(f, attended));
}

function countedFixtures(fixtures: Fixture[]): Fixture[] {
  return fixtures.filter((f) => f.countsInRecord);
}

export interface Record {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  winPct: number;
}

function tally(fixtures: Fixture[]): Record {
  const wins = fixtures.filter((f) => f.result === "W").length;
  const draws = fixtures.filter((f) => f.result === "D").length;
  const losses = fixtures.filter((f) => f.result === "L").length;
  const played = fixtures.length;
  return { played, wins, draws, losses, winPct: played === 0 ? 0 : (wins / played) * 100 };
}

export interface DistanceStats {
  totalKm: number;
  bySeasonKm: { season: string; km: number }[];
  lapsOfEarth: number;
  furthestTrip: MatchDistance | null;
  unresolvedFixtures: Fixture[];
}

export interface GroundStats {
  totalVisited: number;
  visitedGroundIds: Set<string>;
  rankedByVisits: { ground: Ground; visits: number }[];
}

export interface OpponentStat {
  opponent: string;
  played: number;
  home: number;
  away: number;
  neutral: number;
}

export interface RecordStats {
  overall: Record;
  home: Record;
  away: Record;
}

export interface LuckyCharmStats {
  attended: Record;
  missed: Record;
}

export interface MarginMatch {
  fixture: Fixture;
  margin: number;
}

export interface TotalGoalsMatch {
  fixture: Fixture;
  totalGoals: number;
}

export interface UnbeatenRunStats {
  length: number;
  start: Fixture | null;
  end: Fixture | null;
}

export interface GapStats {
  matchesMissed: number;
  before: Fixture | null;
  after: Fixture | null;
}

export interface ManagerStat extends Record {
  manager: string;
}

export interface FinalsStats {
  attended: number;
  wins: number;
  winPct: number;
  matches: Fixture[];
}

export interface BestSeasonStat {
  season: string;
  value: number;
}

export interface BestSeasonsStats {
  attendance: BestSeasonStat | null;
  wins: BestSeasonStat | null;
  goals: BestSeasonStat | null;
}

export interface Stats {
  distance: DistanceStats;
  grounds: GroundStats;
  topOpponents: OpponentStat[];
  record: RecordStats;
  luckyCharm: LuckyCharmStats;
  biggestWin: MarginMatch | null;
  biggestLoss: MarginMatch | null;
  highestScoring: TotalGoalsMatch | null;
  goalsSeen: { total: number; arsenal: number };
  longestUnbeatenRun: UnbeatenRunStats;
  longestGap: GapStats;
  byCompetition: { competition: string; matches: number }[];
  finals: FinalsStats;
  byManager: ManagerStat[];
  bestSeasons: BestSeasonsStats;
}

function computeDistanceStats(
  fixtures: Fixture[],
  groundsById: Map<string, Ground>,
  attended: Set<string>,
  addresses: HomeAddress[],
): DistanceStats {
  const { matches, unresolvedFixtures } = computeDistances(
    fixtures,
    groundsById,
    attended,
    addresses,
  );

  const totalKm = matches.reduce((sum, m) => sum + m.distanceKm, 0);

  const bySeasonMap = new Map<string, number>();
  for (const m of matches) {
    bySeasonMap.set(m.fixture.season, (bySeasonMap.get(m.fixture.season) ?? 0) + m.distanceKm);
  }
  const bySeasonKm = [...bySeasonMap.entries()]
    .map(([season, km]) => ({ season, km }))
    .sort((a, b) => a.season.localeCompare(b.season));

  const furthestTrip =
    matches.length === 0
      ? null
      : matches.reduce((best, m) => (m.distanceKm > best.distanceKm ? m : best));

  return {
    totalKm,
    bySeasonKm,
    lapsOfEarth: totalKm / EARTH_CIRCUMFERENCE_KM,
    furthestTrip,
    unresolvedFixtures,
  };
}

function computeGroundStats(
  fixtures: Fixture[],
  groundsById: Map<string, Ground>,
  attended: Set<string>,
): GroundStats {
  const seen = attendedFixtures(fixtures, attended);
  const visitCounts = new Map<string, number>();
  for (const f of seen) {
    visitCounts.set(f.groundId, (visitCounts.get(f.groundId) ?? 0) + 1);
  }
  const rankedByVisits = [...visitCounts.entries()]
    .map(([groundId, visits]) => ({ ground: groundsById.get(groundId)!, visits }))
    .filter((entry) => entry.ground !== undefined)
    .sort((a, b) => b.visits - a.visits);

  return {
    totalVisited: visitCounts.size,
    visitedGroundIds: new Set(visitCounts.keys()),
    rankedByVisits,
  };
}

function computeTopOpponents(fixtures: Fixture[], attended: Set<string>): OpponentStat[] {
  const seen = attendedFixtures(fixtures, attended);
  const byOpponent = new Map<string, OpponentStat>();
  for (const f of seen) {
    const entry = byOpponent.get(f.opponent) ?? {
      opponent: f.opponent,
      played: 0,
      home: 0,
      away: 0,
      neutral: 0,
    };
    entry.played += 1;
    if (f.venueType === "H") entry.home += 1;
    else if (f.venueType === "A") entry.away += 1;
    else entry.neutral += 1;
    byOpponent.set(f.opponent, entry);
  }
  return [...byOpponent.values()].sort((a, b) => b.played - a.played);
}

function computeRecordStats(fixtures: Fixture[], attended: Set<string>): RecordStats {
  const seen = countedFixtures(attendedFixtures(fixtures, attended));
  return {
    overall: tally(seen),
    home: tally(seen.filter((f) => f.venueType === "H")),
    away: tally(seen.filter((f) => f.venueType === "A")),
  };
}

function computeLuckyCharmStats(fixtures: Fixture[], attended: Set<string>): LuckyCharmStats {
  const eligible = countedFixtures(fixtures.filter((f) => !f.behindClosedDoors));
  const attendedOnes = eligible.filter((f) => attended.has(f.matchId));
  const missedOnes = eligible.filter((f) => !attended.has(f.matchId));
  return { attended: tally(attendedOnes), missed: tally(missedOnes) };
}

function computeBiggestMargin(
  fixtures: Fixture[],
  attended: Set<string>,
  result: MatchResult,
): MarginMatch | null {
  const seen = countedFixtures(attendedFixtures(fixtures, attended)).filter(
    (f) => f.result === result,
  );
  if (seen.length === 0) return null;
  return seen
    .map((fixture) => ({
      fixture,
      margin:
        result === "W"
          ? fixture.arsenalGoals - fixture.opponentGoals
          : fixture.opponentGoals - fixture.arsenalGoals,
    }))
    .reduce((best, cur) => {
      if (cur.margin > best.margin) return cur;
      if (cur.margin === best.margin && cur.fixture.arsenalGoals > best.fixture.arsenalGoals) {
        return cur;
      }
      return best;
    });
}

function computeHighestScoring(fixtures: Fixture[], attended: Set<string>): TotalGoalsMatch | null {
  const seen = countedFixtures(attendedFixtures(fixtures, attended));
  if (seen.length === 0) return null;
  return seen
    .map((fixture) => ({ fixture, totalGoals: fixture.arsenalGoals + fixture.opponentGoals }))
    .reduce((best, cur) => {
      if (cur.totalGoals > best.totalGoals) return cur;
      if (cur.totalGoals === best.totalGoals && cur.fixture.arsenalGoals > best.fixture.arsenalGoals) {
        return cur;
      }
      return best;
    });
}

function computeGoalsSeen(fixtures: Fixture[], attended: Set<string>) {
  const seen = countedFixtures(attendedFixtures(fixtures, attended));
  return seen.reduce(
    (acc, f) => ({
      total: acc.total + f.arsenalGoals + f.opponentGoals,
      arsenal: acc.arsenal + f.arsenalGoals,
    }),
    { total: 0, arsenal: 0 },
  );
}

function computeLongestUnbeatenRun(fixtures: Fixture[], attended: Set<string>): UnbeatenRunStats {
  const seen = countedFixtures(attendedFixtures(fixtures, attended)).slice().sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  let best: UnbeatenRunStats = { length: 0, start: null, end: null };
  let runStart = 0;

  for (let i = 0; i < seen.length; i++) {
    if (seen[i].result === "L") {
      runStart = i + 1;
      continue;
    }
    const length = i - runStart + 1;
    if (length > best.length) {
      best = { length, start: seen[runStart], end: seen[i] };
    }
  }

  return best;
}

// Measured in matches missed rather than days: a calendar-day gap is
// dominated by the close season, which is always the "longest gap" for a
// regular matchgoer even though no fixtures were actually missed.
function computeLongestGap(fixtures: Fixture[], attended: Set<string>): GapStats {
  const sorted = fixtures.slice().sort((a, b) => a.date.localeCompare(b.date));
  const seen = sorted
    .map((fixture, index) => ({ fixture, index }))
    .filter(({ fixture }) => isAttended(fixture, attended));

  let best: GapStats = { matchesMissed: 0, before: null, after: null };
  for (let i = 1; i < seen.length; i++) {
    const matchesMissed = seen[i].index - seen[i - 1].index - 1;
    if (matchesMissed > best.matchesMissed) {
      best = { matchesMissed, before: seen[i - 1].fixture, after: seen[i].fixture };
    }
  }
  return best;
}

function computeByCompetition(fixtures: Fixture[], attended: Set<string>) {
  const seen = attendedFixtures(fixtures, attended);
  const counts = new Map<string, number>();
  for (const f of seen) {
    counts.set(f.competition, (counts.get(f.competition) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([competition, matches]) => ({ competition, matches }))
    .sort((a, b) => b.matches - a.matches);
}

function computeByManager(
  fixtures: Fixture[],
  attended: Set<string>,
  managers: Manager[],
): ManagerStat[] {
  const seen = countedFixtures(attendedFixtures(fixtures, attended));
  const byManager = new Map<string, Fixture[]>();
  for (const f of seen) {
    const manager = managerForDate(f.date, managers) ?? "Unknown";
    const list = byManager.get(manager);
    if (list) list.push(f);
    else byManager.set(manager, [f]);
  }
  return [...byManager.entries()]
    .map(([manager, fs]) => ({ manager, ...tally(fs) }))
    .sort((a, b) => b.played - a.played);
}

function bestSeasonBy(fixtures: Fixture[], valueOf: (f: Fixture) => number): BestSeasonStat | null {
  const bySeasonMap = new Map<string, number>();
  for (const f of fixtures) {
    bySeasonMap.set(f.season, (bySeasonMap.get(f.season) ?? 0) + valueOf(f));
  }
  let best: BestSeasonStat | null = null;
  for (const [season, value] of bySeasonMap) {
    if (!best || value > best.value) best = { season, value };
  }
  return best;
}

function computeBestSeasons(fixtures: Fixture[], attended: Set<string>): BestSeasonsStats {
  const seen = attendedFixtures(fixtures, attended);
  const counted = countedFixtures(seen);
  return {
    attendance: bestSeasonBy(seen, () => 1),
    wins: bestSeasonBy(counted.filter((f) => f.result === "W"), () => 1),
    goals: bestSeasonBy(counted, (f) => f.arsenalGoals),
  };
}

function isShield(fixture: Fixture): boolean {
  return /community shield|charity shield/i.test(fixture.competition);
}

// Real Stage values are competition-prefixed ("FA Cup Final", "UEFA CL Final",
// "FA Cup Final Replay"), never the bare "Final"/"Final Replay" — but never
// "Semi Finals"/"Quarter Finals" either, since those are plural with a
// following "1st/2nd Leg" or "Replay". Match on the singular "Final" as the
// stage's last word, optionally followed by "Replay".
function isFinalStage(stage: string): boolean {
  return /Final(?: Replay)?$/.test(stage);
}

function computeFinals(fixtures: Fixture[], attended: Set<string>): FinalsStats {
  const finals = attendedFixtures(fixtures, attended).filter(
    (f) => isFinalStage(f.stage) && !isShield(f) && f.countsInRecord,
  );
  const wins = finals.filter(
    (f) => f.result === "W" || (f.result === "D" && (f.penaltyShootOut ?? "").startsWith("Won")),
  ).length;
  return {
    attended: finals.length,
    wins,
    winPct: finals.length === 0 ? 0 : (wins / finals.length) * 100,
    matches: finals,
  };
}

export function computeStats(
  fixtures: Fixture[],
  grounds: Ground[],
  attendedMatchIds: string[],
  addresses: HomeAddress[],
  managers: Manager[] = [],
): Stats {
  const attended = new Set(attendedMatchIds);
  const groundsById = new Map(grounds.map((g) => [g.groundId, g]));

  return {
    distance: computeDistanceStats(fixtures, groundsById, attended, addresses),
    grounds: computeGroundStats(fixtures, groundsById, attended),
    topOpponents: computeTopOpponents(fixtures, attended),
    record: computeRecordStats(fixtures, attended),
    luckyCharm: computeLuckyCharmStats(fixtures, attended),
    biggestWin: computeBiggestMargin(fixtures, attended, "W"),
    biggestLoss: computeBiggestMargin(fixtures, attended, "L"),
    highestScoring: computeHighestScoring(fixtures, attended),
    goalsSeen: computeGoalsSeen(fixtures, attended),
    longestUnbeatenRun: computeLongestUnbeatenRun(fixtures, attended),
    longestGap: computeLongestGap(fixtures, attended),
    byCompetition: computeByCompetition(fixtures, attended),
    finals: computeFinals(fixtures, attended),
    byManager: computeByManager(fixtures, attended, managers),
    bestSeasons: computeBestSeasons(fixtures, attended),
  };
}
