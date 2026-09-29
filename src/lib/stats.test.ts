import { describe, expect, it } from "vitest";
import { computeStats } from "./stats";
import { makeAddress, makeFixture, makeGround } from "./test-fixtures";

const groundA = makeGround({ groundId: "G001", ground: "Emirates Stadium" });
const groundB = makeGround({ groundId: "G002", ground: "Old Trafford", latitude: 53.4631, longitude: -2.2913 });
const address = makeAddress();

describe("record", () => {
  it("splits home/away correctly and counts neutral matches in overall only", () => {
    const fixtures = [
      makeFixture({ venueType: "H", result: "W" }),
      makeFixture({ venueType: "A", result: "L" }),
      makeFixture({ venueType: "N", result: "D" }),
    ];
    const attended = fixtures.map((f) => f.matchId);
    const stats = computeStats(fixtures, [groundA], attended, [address]);

    expect(stats.record.overall).toMatchObject({ played: 3, wins: 1, draws: 1, losses: 1 });
    expect(stats.record.home).toMatchObject({ played: 1, wins: 1, draws: 0, losses: 0 });
    expect(stats.record.away).toMatchObject({ played: 1, wins: 0, draws: 0, losses: 1 });
  });
});

describe("voided (countsInRecord: false) matches", () => {
  it("are excluded from record, goals, biggest win/loss, highest-scoring, and unbeaten run", () => {
    const voided = makeFixture({
      countsInRecord: false,
      result: "W",
      arsenalGoals: 5,
      opponentGoals: 0,
    });
    const stats = computeStats([voided], [groundA], [voided.matchId], [address]);

    expect(stats.record.overall.played).toBe(0);
    expect(stats.goalsSeen).toEqual({ total: 0, arsenal: 0 });
    expect(stats.biggestWin).toBeNull();
    expect(stats.biggestLoss).toBeNull();
    expect(stats.highestScoring).toBeNull();
    expect(stats.longestUnbeatenRun.length).toBe(0);
  });

  it("still counts toward grounds visited", () => {
    const voided = makeFixture({ countsInRecord: false, groundId: groundA.groundId });
    const stats = computeStats([voided], [groundA], [voided.matchId], [address]);

    expect(stats.grounds.totalVisited).toBe(1);
    expect(stats.grounds.rankedByVisits).toEqual([{ ground: groundA, visits: 1 }]);
  });
});

describe("lucky charm", () => {
  it("compares win% attended vs missed, excluding behind-closed-doors matches from both", () => {
    const attendedWin = makeFixture({ result: "W" });
    const missedLoss = makeFixture({ result: "L" });
    const bcd = makeFixture({ behindClosedDoors: true, result: "W" });

    // bcd is (incorrectly, defensively) marked attended here to prove it's still excluded.
    const stats = computeStats(
      [attendedWin, missedLoss, bcd],
      [groundA],
      [attendedWin.matchId, bcd.matchId],
      [address],
    );

    expect(stats.luckyCharm.attended).toMatchObject({ played: 1, wins: 1 });
    expect(stats.luckyCharm.missed).toMatchObject({ played: 1, losses: 1 });
  });
});

describe("biggest win/loss", () => {
  it("breaks an equal-margin tie by picking the match with more goals scored", () => {
    const smaller = makeFixture({ result: "W", arsenalGoals: 2, opponentGoals: 0 }); // margin 2
    const bigger = makeFixture({ result: "W", arsenalGoals: 3, opponentGoals: 1 }); // margin 2, more scored
    const attended = [smaller.matchId, bigger.matchId];
    const stats = computeStats([smaller, bigger], [groundA], attended, [address]);

    expect(stats.biggestWin?.fixture.matchId).toBe(bigger.matchId);
    expect(stats.biggestWin?.margin).toBe(2);
  });

  it("does the same for biggest loss", () => {
    const smaller = makeFixture({ result: "L", arsenalGoals: 0, opponentGoals: 2 }); // margin 2
    const bigger = makeFixture({ result: "L", arsenalGoals: 1, opponentGoals: 3 }); // margin 2, more scored
    const attended = [smaller.matchId, bigger.matchId];
    const stats = computeStats([smaller, bigger], [groundA], attended, [address]);

    expect(stats.biggestLoss?.fixture.matchId).toBe(bigger.matchId);
  });
});

describe("highest-scoring match", () => {
  it("breaks a total-goals tie by picking the match with more goals scored", () => {
    const a = makeFixture({ arsenalGoals: 2, opponentGoals: 2 }); // total 4
    const b = makeFixture({ arsenalGoals: 3, opponentGoals: 1 }); // total 4, more scored
    const attended = [a.matchId, b.matchId];
    const stats = computeStats([a, b], [groundA], attended, [address]);

    expect(stats.highestScoring?.fixture.matchId).toBe(b.matchId);
    expect(stats.highestScoring?.totalGoals).toBe(4);
  });
});

describe("longest unbeaten run", () => {
  it("resets on a loss and finds the longest run of consecutive attended non-losses", () => {
    const fixtures = [
      makeFixture({ date: "2020-01-01", result: "W" }),
      makeFixture({ date: "2020-01-08", result: "W" }),
      makeFixture({ date: "2020-01-15", result: "L" }),
      makeFixture({ date: "2020-01-22", result: "W" }),
      makeFixture({ date: "2020-01-29", result: "D" }),
      makeFixture({ date: "2020-02-05", result: "D" }),
    ];
    const attended = fixtures.map((f) => f.matchId);
    const stats = computeStats(fixtures, [groundA], attended, [address]);

    expect(stats.longestUnbeatenRun.length).toBe(3);
    expect(stats.longestUnbeatenRun.start?.date).toBe("2020-01-22");
    expect(stats.longestUnbeatenRun.end?.date).toBe("2020-02-05");
  });
});

describe("longest gap", () => {
  it("finds the largest gap in days between attended matches, including voided ones", () => {
    const before = makeFixture({ date: "2020-01-01" });
    const voided = makeFixture({ date: "2020-01-05", countsInRecord: false });
    const after = makeFixture({ date: "2020-06-01" });
    const fixtures = [before, voided, after];
    const attended = fixtures.map((f) => f.matchId);
    const stats = computeStats(fixtures, [groundA], attended, [address]);

    expect(stats.longestGap.before?.matchId).toBe(voided.matchId);
    expect(stats.longestGap.after?.matchId).toBe(after.matchId);
    expect(stats.longestGap.days).toBe(148); // 2020-01-05 -> 2020-06-01
  });
});

describe("finals", () => {
  // Real Stage values are competition-prefixed, e.g. "FA Cup Final",
  // "UEFA CL Final", "FA Cup Final Replay" — never the bare "Final".
  it("counts straight wins, penalty-shootout wins, excludes shields and voided finals", () => {
    const straightWin = makeFixture({ stage: "FA Cup Final", competition: "FA Cup", result: "W" });
    const penaltyWin = makeFixture({
      stage: "League Cup Final",
      competition: "League Cup",
      result: "D",
      penaltyShootOut: "Won 4-3",
    });
    const loss = makeFixture({ stage: "FA Cup Final Replay", competition: "FA Cup", result: "L" });
    const shield = makeFixture({
      stage: "FA Community Shield",
      competition: "FA Community Shield",
      result: "W",
    });
    const voidedFinal = makeFixture({
      stage: "FA Cup Final",
      competition: "FA Cup",
      result: "W",
      countsInRecord: false,
    });

    const fixtures = [straightWin, penaltyWin, loss, shield, voidedFinal];
    const attended = fixtures.map((f) => f.matchId);
    const stats = computeStats(fixtures, [groundA], attended, [address]);

    expect(stats.finals.attended).toBe(3); // straightWin, penaltyWin, loss (shield and voided excluded)
    expect(stats.finals.wins).toBe(2); // straightWin, penaltyWin
  });

  it("does not mistake a semi-final or quarter-final for a final", () => {
    const semiFinal = makeFixture({ stage: "FA Cup Semi Finals", competition: "FA Cup", result: "W" });
    const semiFinalLeg = makeFixture({
      stage: "League Cup Semi Finals 1st Leg",
      competition: "League Cup",
      result: "W",
    });
    const quarterFinal = makeFixture({
      stage: "FA Cup Quarter Finals Replay",
      competition: "FA Cup",
      result: "W",
    });

    const fixtures = [semiFinal, semiFinalLeg, quarterFinal];
    const attended = fixtures.map((f) => f.matchId);
    const stats = computeStats(fixtures, [groundA], attended, [address]);

    expect(stats.finals.attended).toBe(0);
  });
});

describe("distance and grounds aggregation", () => {
  it("groups distance by season, sorts it, and picks the actual furthest trip", () => {
    const near = makeFixture({ date: "2020-01-01", season: "2019/20", groundId: groundA.groundId });
    const far = makeFixture({ date: "2021-01-01", season: "2020/21", groundId: groundB.groundId });
    const fixtures = [near, far];
    const attended = fixtures.map((f) => f.matchId);
    const stats = computeStats(fixtures, [groundA, groundB], attended, [address]);

    expect(stats.distance.bySeasonKm.map((s) => s.season)).toEqual(["2019/20", "2020/21"]);
    expect(stats.distance.furthestTrip?.fixture.matchId).toBe(far.matchId);
  });

  it("ranks grounds by visit count", () => {
    const fixtures = [
      makeFixture({ groundId: groundA.groundId }),
      makeFixture({ groundId: groundA.groundId }),
      makeFixture({ groundId: groundB.groundId }),
    ];
    const attended = fixtures.map((f) => f.matchId);
    const stats = computeStats(fixtures, [groundA, groundB], attended, [address]);

    expect(stats.grounds.rankedByVisits[0]).toMatchObject({ ground: groundA, visits: 2 });
    expect(stats.grounds.rankedByVisits[1]).toMatchObject({ ground: groundB, visits: 1 });
  });
});
