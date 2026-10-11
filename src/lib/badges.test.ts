import { describe, expect, it } from "vitest";
import { computeBadges, countEarnedBadges, countEarnedBySection } from "./badges";
import { badgeReference } from "./badgeReference";
import fixturesData from "../data/fixtures.json";
import groundsData from "../data/grounds.json";
import type { Fixture, Ground } from "../types";

// These tests run against the real fixture/ground data, per
// docs/BADGES_PLAN.md's "Tests (automated, against the real fixture data)".

const fixtures = fixturesData as Fixture[];
const grounds = groundsData as Ground[];
const groundCountryById = new Map(grounds.map((g) => [g.groundId, g.country]));

const attendableMatchIds = fixtures.filter((f) => !f.behindClosedDoors).map((f) => f.matchId);

describe("nothing ticked", () => {
  const badges = computeBadges(fixtures, groundCountryById, new Set());

  it("earns zero badges", () => {
    expect(countEarnedBadges(badges)).toBe(0);
    expect(countEarnedBySection(badges)).toEqual({
      attendance: 0,
      grounds: 0,
      europe: 0,
      history: 0,
    });
  });

  it("leaves every tiered badge locked at zero progress", () => {
    expect(badges.attendance.loyalSupporter.locked).toBe(true);
    expect(badges.attendance.loyalSupporter.current).toBe(0);
    expect(badges.attendance.goalsGalore.locked).toBe(true);
    expect(badges.attendance.longevity.locked).toBe(true);
    expect(badges.attendance.homeComforts.locked).toBe(true);
    expect(badges.attendance.awayTraveller.locked).toBe(true);
    expect(badges.grounds.groundHopper.locked).toBe(true);
    expect(badges.europe.europeanTours.locked).toBe(true);
  });

  it("awards no season sweeps", () => {
    expect(badges.attendance.seasonSweep).toEqual([]);
  });

  it("leaves every per-item badge locked", () => {
    expect(badges.grounds.premierLeague.unlocked).toBe(false);
    expect(badges.grounds.premierLeague.visitedCount).toBe(0);
    expect(badges.grounds.oldAndNew.unlocked).toBe(false);
    expect(badges.europe.passportStamps.every((p) => !p.unlocked)).toBe(true);
    expect(badges.europe.cathedralsOfFootball.every((c) => !c.unlocked)).toBe(true);
    expect(badges.witnessToHistory.every((w) => !w.unlocked)).toBe(true);
  });
});

describe("every attendable match ticked", () => {
  const badges = computeBadges(fixtures, groundCountryById, new Set(attendableMatchIds));

  it("earns 8 tiered badges + 37 season sweeps + Old & New + 27 + 12 + 30 unlocks, but not The Premier League", () => {
    expect(countEarnedBadges(badges)).toBe(8 + 37 + 1 + 27 + 12 + 30);
    expect(countEarnedBySection(badges)).toEqual({
      attendance: 5 + 37,
      grounds: 2 + 1,
      europe: 1 + 27 + 12,
      history: 30,
    });
  });

  it("Loyal Supporter reaches 1,500 (legendary)", () => {
    expect(badges.attendance.loyalSupporter.tierLabel).toBe("1,500");
    expect(badges.attendance.loyalSupporter.legendary).toBe(true);
  });

  it("Goals Galore reaches 3,000 (legendary)", () => {
    expect(badges.attendance.goalsGalore.tierLabel).toBe("3,000");
    expect(badges.attendance.goalsGalore.legendary).toBe(true);
  });

  it("Longevity, Home Comforts and Away Traveller all reach 'Every season'", () => {
    expect(badges.attendance.longevity.tierLabel).toBe("Every season");
    expect(badges.attendance.homeComforts.tierLabel).toBe("Every season");
    expect(badges.attendance.awayTraveller.tierLabel).toBe("Every season");
  });

  it("Season Sweep is awarded for 37 seasons, not 2020/21", () => {
    const seasons = badges.attendance.seasonSweep.map((s) => s.season);
    expect(seasons).toHaveLength(37);
    expect(seasons).not.toContain("2020/21");
  });

  it("Season Sweep carries the attendable match count for each swept season", () => {
    const opener = badges.attendance.seasonSweep.find((s) => s.season === "1988/89");
    expect(opener?.attendableCount).toBe(45);
  });

  it("all 27 ghost grounds, 27 passport stamps and 12 cathedrals are earned", () => {
    expect(badges.grounds.ghostGrounds.tierLabel).toBe("10");
    expect(badges.grounds.ghostGrounds.current).toBe(27);
    expect(badges.europe.passportStamps).toHaveLength(27);
    expect(badges.europe.passportStamps.every((p) => p.unlocked)).toBe(true);
    expect(badges.europe.cathedralsOfFootball).toHaveLength(12);
    expect(badges.europe.cathedralsOfFootball.every((c) => c.unlocked)).toBe(true);
  });

  it("all 30 Witness to History matches are earned", () => {
    expect(badges.witnessToHistory).toHaveLength(30);
    expect(badges.witnessToHistory.every((w) => w.unlocked)).toBe(true);
  });

  it("The Premier League is still locked at 19 of 20, because of Coventry", () => {
    expect(badges.grounds.premierLeague.unlocked).toBe(false);
    expect(badges.grounds.premierLeague.visitedCount).toBe(19);
    expect(badges.grounds.premierLeague.totalCount).toBe(20);
    const coventry = badges.grounds.premierLeague.missingClubs.find((c) => c.club === "Coventry City");
    expect(coventry?.note).toBe("not yet in the fixture list");
  });

  it("Old & New is earned", () => {
    expect(badges.grounds.oldAndNew.unlocked).toBe(true);
  });
});

describe("behind closed doors", () => {
  it("a behind-closed-doors match defensively marked attended is still ignored by every badge", () => {
    const bcd = fixtures.find((f) => f.behindClosedDoors)!;
    const badges = computeBadges(fixtures, groundCountryById, new Set([bcd.matchId]));
    expect(badges.attendance.loyalSupporter.current).toBe(0);
    expect(badges.attendance.loyalSupporter.locked).toBe(true);
  });
});

describe("voided match", () => {
  const voided = fixtures.find((f) => !f.countsInRecord)!;

  it("counts for Loyal Supporter but not Goals Galore", () => {
    const badges = computeBadges(fixtures, groundCountryById, new Set([voided.matchId]));
    expect(badges.attendance.loyalSupporter.current).toBe(1);
    expect(badges.attendance.goalsGalore.current).toBe(0);
  });
});

describe("thresholds", () => {
  const attendableSorted = fixtures
    .filter((f) => !f.behindClosedDoors)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  it("49 matches attended is tier 1, not tier 50", () => {
    const first49 = attendableSorted.slice(0, 49).map((f) => f.matchId);
    const badges = computeBadges(fixtures, groundCountryById, new Set(first49));
    expect(badges.attendance.loyalSupporter.tierLabel).toBe("1");
    expect(badges.attendance.loyalSupporter.current).toBe(49);
  });

  it("50 matches attended reaches tier 50, earned on the 50th match", () => {
    const first50 = attendableSorted.slice(0, 50);
    const badges = computeBadges(
      fixtures,
      groundCountryById,
      new Set(first50.map((f) => f.matchId)),
    );
    expect(badges.attendance.loyalSupporter.tierLabel).toBe("50");
    expect(badges.attendance.loyalSupporter.earningMatch?.matchId).toBe(first50[49].matchId);
  });

  it("un-ticking the 50th match drops the tier back to 1, not to locked", () => {
    const first49 = attendableSorted.slice(0, 49).map((f) => f.matchId);
    const badges = computeBadges(fixtures, groundCountryById, new Set(first49));
    expect(badges.attendance.loyalSupporter.tierLabel).toBe("1");
    expect(badges.attendance.loyalSupporter.earningMatch?.matchId).toBe(attendableSorted[0].matchId);
  });
});

describe("Old & New", () => {
  it("needs both matches; one alone stays locked", () => {
    const onlyFirst = computeBadges(
      fixtures,
      groundCountryById,
      new Set([badgeReference.oldAndNew.lastAtHighbury]),
    );
    expect(onlyFirst.grounds.oldAndNew.unlocked).toBe(false);

    const both = computeBadges(
      fixtures,
      groundCountryById,
      new Set([badgeReference.oldAndNew.lastAtHighbury, badgeReference.oldAndNew.firstAtEmirates]),
    );
    expect(both.grounds.oldAndNew.unlocked).toBe(true);
    // The Emirates opener (19 Aug 2006) is later than the Highbury farewell
    // (7 May 2006), so it's the match that completes the pair.
    expect(both.grounds.oldAndNew.earningMatch?.matchId).toBe(badgeReference.oldAndNew.firstAtEmirates);
  });
});

describe("Home Comforts and Away Traveller", () => {
  it("a season with every attendable home league game ticked, and nothing else, earns Home Comforts tier 1", () => {
    const season2019_20 = fixtures.filter((f) => f.season === "2019/20");
    const leagueComps = new Set(badgeReference.leagueCompetitions);
    const requiredHome = season2019_20.filter(
      (f) => !f.behindClosedDoors && f.venueType === "H" && leagueComps.has(f.competition),
    );
    const badges = computeBadges(
      fixtures,
      groundCountryById,
      new Set(requiredHome.map((f) => f.matchId)),
    );
    expect(badges.attendance.homeComforts.tierLabel).toBe("1");
  });

  it("leaving one required home league game unticked keeps Home Comforts locked for that season", () => {
    const season2019_20 = fixtures.filter((f) => f.season === "2019/20");
    const leagueComps = new Set(badgeReference.leagueCompetitions);
    const requiredHome = season2019_20.filter(
      (f) => !f.behindClosedDoors && f.venueType === "H" && leagueComps.has(f.competition),
    );
    const missingOne = requiredHome.slice(1).map((f) => f.matchId);
    const badges = computeBadges(fixtures, groundCountryById, new Set(missingOne));
    expect(badges.attendance.homeComforts.locked).toBe(true);
  });

  it("10 attended away games in a season earns Away Traveller tier 1, the 10th being the earning match", () => {
    const awayIn1988_89 = fixtures
      .filter((f) => f.season === "1988/89" && !f.behindClosedDoors && f.venueType === "A")
      .sort((a, b) => a.date.localeCompare(b.date));
    const first10 = awayIn1988_89.slice(0, 10);
    const badges = computeBadges(
      fixtures,
      groundCountryById,
      new Set(first10.map((f) => f.matchId)),
    );
    expect(badges.attendance.awayTraveller.tierLabel).toBe("1");
    expect(badges.attendance.awayTraveller.earningMatch?.matchId).toBe(first10[9].matchId);
  });
});
