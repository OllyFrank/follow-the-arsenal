import { describe, expect, it } from "vitest";
import { computeDerbyStats } from "./derbyStats";
import { makeFixture } from "./test-fixtures";

describe("north London derby", () => {
  it("only includes Tottenham Hotspur matches", () => {
    const spurs = makeFixture({ opponent: "Tottenham Hotspur", result: "W" });
    const other = makeFixture({ opponent: "Liverpool", result: "W" });
    const attended = [spurs.matchId, other.matchId];
    const stats = computeDerbyStats([spurs, other], new Set(attended));

    expect(stats.northLondon.attendedCount).toBe(1);
    expect(stats.northLondon.record.played).toBe(1);
  });

  it("reports goals for and against alongside W-D-L", () => {
    const win = makeFixture({
      opponent: "Tottenham Hotspur",
      result: "W",
      arsenalGoals: 5,
      opponentGoals: 2,
    });
    const stats = computeDerbyStats([win], new Set([win.matchId]));

    expect(stats.northLondon.record).toMatchObject({
      played: 1,
      wins: 1,
      goalsFor: 5,
      goalsAgainst: 2,
    });
  });

  it("finds the first attended derby by date, ignoring unattended ones", () => {
    const later = makeFixture({ opponent: "Tottenham Hotspur", date: "2010-01-01" });
    const earlier = makeFixture({ opponent: "Tottenham Hotspur", date: "2000-01-01" });
    const unattendedEarliest = makeFixture({
      opponent: "Tottenham Hotspur",
      date: "1990-01-01",
    });
    const stats = computeDerbyStats(
      [later, earlier, unattendedEarliest],
      new Set([later.matchId, earlier.matchId]),
    );

    expect(stats.northLondon.firstDerby?.matchId).toBe(earlier.matchId);
  });

  it("excludes behind-closed-doors matches from the record and leaves the lucky-charm miss column alone", () => {
    const bcd = makeFixture({ opponent: "Tottenham Hotspur", behindClosedDoors: true, result: "W" });
    const stats = computeDerbyStats([bcd], new Set());

    expect(stats.northLondon.record.played).toBe(0);
    expect(stats.northLondon.luckyCharm.missed.played).toBe(0);
  });

  it("is empty when no Tottenham fixtures are in scope (e.g. a single-season filter)", () => {
    const other = makeFixture({ opponent: "Liverpool" });
    const stats = computeDerbyStats([other], new Set([other.matchId]));

    expect(stats.northLondon.attendedCount).toBe(0);
    expect(stats.northLondon.firstDerby).toBeNull();
    expect(stats.northLondon.biggestWin).toBeNull();
  });
});

describe("london derby", () => {
  it("includes every londonClubs opponent, Tottenham included", () => {
    const spurs = makeFixture({ opponent: "Tottenham Hotspur", result: "W" });
    const chelsea = makeFixture({ opponent: "Chelsea", result: "D" });
    const nonLondon = makeFixture({ opponent: "Liverpool", result: "L" });
    const attended = [spurs.matchId, chelsea.matchId, nonLondon.matchId];
    const stats = computeDerbyStats([spurs, chelsea, nonLondon], new Set(attended));

    expect(stats.london.attendedCount).toBe(2);
    expect(stats.london.record.played).toBe(2);
  });

  it("never errors on londonClubs entries with zero fixtures in the data (Bromley, Barnet)", () => {
    const stats = computeDerbyStats([], new Set());
    expect(stats.london.attendedCount).toBe(0);
    expect(stats.london.record.played).toBe(0);
  });
});
