import type { Fixture } from "../types";
import { attendedFixtures, countedFixtures, isAttendable } from "./stats";
import {
  computeCumulativeBadge,
  computeDistinctBadge,
  computeUnlockList,
  type BadgeProgress,
  type BadgeTierDef,
  type UnlockItem,
} from "./badgeEngine";
import { badgeReference, type GroundReference } from "./badgeReference";
import greatestMatchesData from "../data/greatest_matches.json";

const byDate = (a: Fixture, b: Fixture) => a.date.localeCompare(b.date);

function tiers(defs: { label: string; threshold: number; legendary?: boolean }[]): BadgeTierDef[] {
  return defs;
}

// ---- Attendance ----

export interface SeasonSweepResult {
  season: string;
  earningMatch: Fixture;
}

/** Every season with at least one attendable fixture: the shared "every
 * season" denominator (37 of 38 — only 2020/21 was entirely behind closed
 * doors) used by Longevity, Home Comforts and Away Traveller alike. */
function attendableSeasons(fixtures: Fixture[]): string[] {
  return [...new Set(fixtures.filter(isAttendable).map((f) => f.season))].sort();
}

function groupBySeason(fixtures: Fixture[]): Map<string, Fixture[]> {
  const map = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const list = map.get(f.season);
    if (list) list.push(f);
    else map.set(f.season, [f]);
  }
  return map;
}

function computeLoyalSupporter(fixtures: Fixture[], attended: Set<string>): BadgeProgress {
  const events = attendedFixtures(fixtures, attended)
    .slice()
    .sort(byDate)
    .map((fixture) => ({ fixture, weight: 1 }));
  return computeCumulativeBadge(
    events,
    tiers([
      { label: "1", threshold: 1 },
      { label: "50", threshold: 50 },
      { label: "100", threshold: 100 },
      { label: "250", threshold: 250 },
      { label: "500", threshold: 500 },
      { label: "1,000", threshold: 1000 },
      { label: "1,500", threshold: 1500, legendary: true },
    ]),
  );
}

function computeGoalsGalore(fixtures: Fixture[], attended: Set<string>): BadgeProgress {
  const events = countedFixtures(attendedFixtures(fixtures, attended))
    .slice()
    .sort(byDate)
    .map((fixture) => ({ fixture, weight: fixture.arsenalGoals }));
  return computeCumulativeBadge(
    events,
    tiers([
      { label: "1", threshold: 1 },
      { label: "50", threshold: 50 },
      { label: "100", threshold: 100 },
      { label: "250", threshold: 250 },
      { label: "500", threshold: 500 },
      { label: "1,000", threshold: 1000 },
      { label: "2,000", threshold: 2000 },
      { label: "3,000", threshold: 3000, legendary: true },
    ]),
  );
}

function computeLongevity(fixtures: Fixture[], attended: Set<string>): BadgeProgress {
  const everySeason = attendableSeasons(fixtures).length;
  const events = attendedFixtures(fixtures, attended)
    .slice()
    .sort(byDate)
    .map((fixture) => ({ fixture, key: fixture.season }));
  return computeDistinctBadge(
    events,
    tiers([
      { label: "5", threshold: 5 },
      { label: "10", threshold: 10 },
      { label: "15", threshold: 15 },
      { label: "25", threshold: 25 },
      { label: "Every season", threshold: everySeason, legendary: true },
    ]),
  );
}

/** Shared shape for Home Comforts and Away Traveller: a season "completes"
 * the moment its own requirement is satisfied, which happens at a specific,
 * computable match — not necessarily the season's first or last fixture.
 * `completionMatch` returns that match once `required` holds, so every
 * qualifying season can be placed in overall chronological order and fed
 * through the same cumulative tier ladder as a plain count badge. */
function computeSeasonRequirementBadge(
  fixtures: Fixture[],
  everySeasonTotal: number,
  tierDefs: { label: string; threshold: number }[],
  completionMatch: (seasonFixtures: Fixture[]) => Fixture | null,
): BadgeProgress {
  const bySeason = groupBySeason(fixtures);
  const completions: Fixture[] = [];
  for (const seasonFixtures of bySeason.values()) {
    const match = completionMatch(seasonFixtures);
    if (match) completions.push(match);
  }
  const events = completions.sort(byDate).map((fixture) => ({ fixture, weight: 1 }));
  return computeCumulativeBadge(
    events,
    tiers([...tierDefs, { label: "Every season", threshold: everySeasonTotal, legendary: true }]),
  );
}

function computeHomeComforts(fixtures: Fixture[], attended: Set<string>): BadgeProgress {
  const leagueComps = new Set(badgeReference.leagueCompetitions);
  return computeSeasonRequirementBadge(
    fixtures,
    attendableSeasons(fixtures).length,
    [
      { label: "1", threshold: 1 },
      { label: "3", threshold: 3 },
      { label: "5", threshold: 5 },
      { label: "10", threshold: 10 },
      { label: "20", threshold: 20 },
    ],
    (seasonFixtures) => {
      const required = seasonFixtures
        .filter((f) => isAttendable(f) && f.venueType === "H" && leagueComps.has(f.competition))
        .sort(byDate);
      if (required.length === 0) return null;
      const allAttended = required.every((f) => attended.has(f.matchId));
      return allAttended ? required[required.length - 1] : null;
    },
  );
}

function computeAwayTraveller(fixtures: Fixture[], attended: Set<string>): BadgeProgress {
  return computeSeasonRequirementBadge(
    fixtures,
    attendableSeasons(fixtures).length,
    [
      { label: "1", threshold: 1 },
      { label: "3", threshold: 3 },
      { label: "5", threshold: 5 },
      { label: "10", threshold: 10 },
      { label: "20", threshold: 20 },
    ],
    (seasonFixtures) => {
      const away = seasonFixtures
        .filter((f) => isAttendable(f) && f.venueType === "A")
        .sort(byDate);
      const attendedAway = away.filter((f) => attended.has(f.matchId));
      return attendedAway.length >= 10 ? attendedAway[9] : null;
    },
  );
}

function computeSeasonSweep(fixtures: Fixture[], attended: Set<string>): SeasonSweepResult[] {
  const bySeason = groupBySeason(fixtures);
  const results: SeasonSweepResult[] = [];
  for (const [season, seasonFixtures] of bySeason) {
    const required = seasonFixtures.filter(isAttendable).sort(byDate);
    if (required.length === 0) continue;
    const allAttended = required.every((f) => attended.has(f.matchId));
    if (allAttended) results.push({ season, earningMatch: required[required.length - 1] });
  }
  return results.sort((a, b) => a.season.localeCompare(b.season));
}

// ---- Grounds ----

function computeGroundHopper(fixtures: Fixture[], attended: Set<string>): BadgeProgress {
  const events = attendedFixtures(fixtures, attended)
    .slice()
    .sort(byDate)
    .map((fixture) => ({ fixture, key: fixture.groundId }));
  return computeDistinctBadge(
    events,
    tiers([
      { label: "5", threshold: 5 },
      { label: "10", threshold: 10 },
      { label: "25", threshold: 25 },
      { label: "50", threshold: 50 },
      { label: "80", threshold: 80, legendary: true },
    ]),
  );
}

export interface PremierLeagueClubStatus {
  club: string;
  ground: string;
  note: string | null;
  visited: boolean;
  earningMatch: Fixture | null;
}

export interface PremierLeagueBadge {
  unlocked: boolean;
  earningMatch: Fixture | null;
  visitedCount: number;
  totalCount: number;
  missingClubs: PremierLeagueClubStatus[];
}

function computePremierLeague(fixtures: Fixture[], attended: Set<string>): PremierLeagueBadge {
  const events = attendedFixtures(fixtures, attended)
    .slice()
    .sort(byDate)
    .map((fixture) => ({ fixture, key: fixture.groundId }));
  const firstVisitByGround = new Map<string, Fixture>();
  for (const { fixture, key } of events) {
    if (!firstVisitByGround.has(key)) firstVisitByGround.set(key, fixture);
  }

  const clubs = badgeReference.premierLeague.clubs;
  const statuses: PremierLeagueClubStatus[] = clubs.map((club) => {
    const earningMatch = club.groundId ? (firstVisitByGround.get(club.groundId) ?? null) : null;
    return {
      club: club.club,
      ground: club.ground,
      note: club.inData ? null : "not yet in the fixture list",
      visited: earningMatch !== null,
      earningMatch,
    };
  });

  const missingClubs = statuses.filter((s) => !s.visited);
  const unlocked = missingClubs.length === 0;
  const earningMatch = unlocked
    ? statuses.reduce<Fixture | null>((latest, s) => {
        if (!s.earningMatch) return latest;
        if (!latest || s.earningMatch.date > latest.date) return s.earningMatch;
        return latest;
      }, null)
    : null;

  return {
    unlocked,
    earningMatch,
    visitedCount: statuses.length - missingClubs.length,
    totalCount: statuses.length,
    missingClubs,
  };
}

function computeGhostGrounds(fixtures: Fixture[], attended: Set<string>): BadgeProgress {
  const ghostGroundIds = new Set(badgeReference.ghostGrounds.map((g) => g.groundId));
  const events = attendedFixtures(fixtures, attended)
    .filter((f) => ghostGroundIds.has(f.groundId))
    .slice()
    .sort(byDate)
    .map((fixture) => ({ fixture, key: fixture.groundId }));
  return computeDistinctBadge(
    events,
    tiers([
      { label: "1", threshold: 1 },
      { label: "5", threshold: 5 },
      { label: "10", threshold: 10, legendary: true },
    ]),
  );
}

export interface OldAndNewBadge {
  unlocked: boolean;
  earningMatch: Fixture | null;
  matches: { label: string; fixture: Fixture | null; attended: boolean }[];
}

function computeOldAndNew(fixtures: Fixture[], attended: Set<string>): OldAndNewBadge {
  const byId = new Map(fixtures.map((f) => [f.matchId, f]));
  const last = byId.get(badgeReference.oldAndNew.lastAtHighbury) ?? null;
  const first = byId.get(badgeReference.oldAndNew.firstAtEmirates) ?? null;
  const matches = [
    { label: "Last at Highbury", fixture: last, attended: !!last && attended.has(last.matchId) },
    { label: "First at Emirates", fixture: first, attended: !!first && attended.has(first.matchId) },
  ];
  const unlocked = matches.every((m) => m.attended);
  const earningMatch = unlocked
    ? matches.reduce<Fixture | null>((latest, m) => {
        if (!m.fixture) return latest;
        if (!latest || m.fixture.date > latest.date) return m.fixture;
        return latest;
      }, null)
    : null;
  return { unlocked, earningMatch, matches };
}

// ---- Europe & Countries ----

function isEuropeanAbroad(fixture: Fixture, europeanComps: Set<string>, groundCountryById: Map<string, string>): boolean {
  if (!europeanComps.has(fixture.competition)) return false;
  return groundCountryById.get(fixture.groundId) !== "England";
}

function computeEuropeanTours(
  fixtures: Fixture[],
  attended: Set<string>,
  groundCountryById: Map<string, string>,
): BadgeProgress {
  const europeanComps = new Set(badgeReference.europeanCompetitions);
  const events = attendedFixtures(fixtures, attended)
    .filter((f) => isEuropeanAbroad(f, europeanComps, groundCountryById))
    .slice()
    .sort(byDate)
    .map((fixture) => ({ fixture, weight: 1 }));
  return computeCumulativeBadge(
    events,
    tiers([
      { label: "1", threshold: 1 },
      { label: "3", threshold: 3 },
      { label: "5", threshold: 5 },
      { label: "10", threshold: 10 },
      { label: "25", threshold: 25 },
      { label: "50", threshold: 50 },
      { label: "75", threshold: 75 },
      { label: "100", threshold: 100, legendary: true },
    ]),
  );
}

function computePassportStamps(
  fixtures: Fixture[],
  attended: Set<string>,
  groundCountryById: Map<string, string>,
): UnlockItem<{ country: string }>[] {
  const europeanComps = new Set(badgeReference.europeanCompetitions);
  const abroadAttendable = fixtures.filter(
    (f) => isAttendable(f) && isEuropeanAbroad(f, europeanComps, groundCountryById),
  );
  // Derived from the data, not stored: any country with at least one
  // attendable European-abroad fixture is earnable, so a newly added
  // fixture makes its country appear automatically. Ireland's only such
  // match (Dundalk, 2020) was behind closed doors, so it's excluded here
  // the same way, with no special-casing needed.
  const countries = [...new Set(abroadAttendable.map((f) => groundCountryById.get(f.groundId)!))].sort();

  const events = abroadAttendable
    .filter((f) => attended.has(f.matchId))
    .slice()
    .sort(byDate)
    .map((fixture) => ({ fixture, key: groundCountryById.get(fixture.groundId)! }));

  return computeUnlockList(
    countries.map((country) => ({ key: country, item: { country } })),
    events,
  );
}

function computeCathedralsOfFootball(
  fixtures: Fixture[],
  attended: Set<string>,
): UnlockItem<GroundReference>[] {
  const cathedralIds = new Set(badgeReference.cathedralsOfFootball.map((g) => g.groundId));
  const events = attendedFixtures(fixtures, attended)
    .filter((f) => cathedralIds.has(f.groundId))
    .slice()
    .sort(byDate)
    .map((fixture) => ({ fixture, key: fixture.groundId }));
  return computeUnlockList(
    badgeReference.cathedralsOfFootball.map((g) => ({ key: g.groundId, item: g })),
    events,
  );
}

// ---- Witness to History ----

export type GreatestMatchTier = "gold" | "silver" | "bronze";

export interface GreatestMatch {
  number: number;
  matchId: string;
  date: string;
  opponent: string;
  match: string;
  era: string;
  why: string;
  tier: GreatestMatchTier;
}

export interface WitnessEntry {
  greatestMatch: GreatestMatch;
  fixture: Fixture | null;
  unlocked: boolean;
}

const greatestMatches = greatestMatchesData as GreatestMatch[];

function computeWitnessToHistory(fixtures: Fixture[], attended: Set<string>): WitnessEntry[] {
  const byId = new Map(fixtures.map((f) => [f.matchId, f]));
  return greatestMatches
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((greatestMatch) => {
      const fixture = byId.get(greatestMatch.matchId) ?? null;
      return {
        greatestMatch,
        fixture,
        unlocked: !!fixture && attended.has(fixture.matchId),
      };
    });
}

// ---- Aggregator ----

export type BadgeId =
  | "loyalSupporter"
  | "goalsGalore"
  | "longevity"
  | "homeComforts"
  | "awayTraveller"
  | "seasonSweep"
  | "groundHopper"
  | "premierLeague"
  | "ghostGrounds"
  | "oldAndNew"
  | "europeanTours"
  | "passportStamps"
  | "cathedralsOfFootball"
  | "witnessToHistory";

export interface BadgeResults {
  attendance: {
    loyalSupporter: BadgeProgress;
    goalsGalore: BadgeProgress;
    longevity: BadgeProgress;
    homeComforts: BadgeProgress;
    awayTraveller: BadgeProgress;
    seasonSweep: SeasonSweepResult[];
  };
  grounds: {
    groundHopper: BadgeProgress;
    premierLeague: PremierLeagueBadge;
    ghostGrounds: BadgeProgress;
    oldAndNew: OldAndNewBadge;
  };
  europe: {
    europeanTours: BadgeProgress;
    passportStamps: UnlockItem<{ country: string }>[];
    cathedralsOfFootball: UnlockItem<GroundReference>[];
  };
  witnessToHistory: WitnessEntry[];
}

export function computeBadges(
  fixtures: Fixture[],
  groundCountryById: Map<string, string>,
  attended: Set<string>,
): BadgeResults {
  return {
    attendance: {
      loyalSupporter: computeLoyalSupporter(fixtures, attended),
      goalsGalore: computeGoalsGalore(fixtures, attended),
      longevity: computeLongevity(fixtures, attended),
      homeComforts: computeHomeComforts(fixtures, attended),
      awayTraveller: computeAwayTraveller(fixtures, attended),
      seasonSweep: computeSeasonSweep(fixtures, attended),
    },
    grounds: {
      groundHopper: computeGroundHopper(fixtures, attended),
      premierLeague: computePremierLeague(fixtures, attended),
      ghostGrounds: computeGhostGrounds(fixtures, attended),
      oldAndNew: computeOldAndNew(fixtures, attended),
    },
    europe: {
      europeanTours: computeEuropeanTours(fixtures, attended, groundCountryById),
      passportStamps: computePassportStamps(fixtures, attended, groundCountryById),
      cathedralsOfFootball: computeCathedralsOfFootball(fixtures, attended),
    },
    witnessToHistory: computeWitnessToHistory(fixtures, attended),
  };
}

/** Total badges earned, for the Badges tab header ("23 badges"): one per
 * tiered badge reached (any tier, not per tier), plus one per swept season,
 * unlocked single badge, and unlocked per-item badge (country/stadium/
 * greatest match). */
export function countEarnedBadges(results: BadgeResults): number {
  const tiered = [
    results.attendance.loyalSupporter,
    results.attendance.goalsGalore,
    results.attendance.longevity,
    results.attendance.homeComforts,
    results.attendance.awayTraveller,
    results.grounds.groundHopper,
    results.grounds.ghostGrounds,
    results.europe.europeanTours,
  ];
  return (
    tiered.filter((b) => !b.locked).length +
    results.attendance.seasonSweep.length +
    (results.grounds.premierLeague.unlocked ? 1 : 0) +
    (results.grounds.oldAndNew.unlocked ? 1 : 0) +
    results.europe.passportStamps.filter((p) => p.unlocked).length +
    results.europe.cathedralsOfFootball.filter((c) => c.unlocked).length +
    results.witnessToHistory.filter((w) => w.unlocked).length
  );
}
