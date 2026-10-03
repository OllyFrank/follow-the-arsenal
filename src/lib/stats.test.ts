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
  it("counts matches missed in between, not calendar days, so the close season doesn't dominate", () => {
    const before = makeFixture({ date: "2020-01-01" });
    const missedA = makeFixture({ date: "2020-01-08" });
    const missedB = makeFixture({ date: "2020-01-15" });
    const after = makeFixture({ date: "2020-06-01" });
    const fixtures = [before, missedA, missedB, after];
    const attended = [before.matchId, after.matchId];
    const stats = computeStats(fixtures, [groundA], attended, [address]);

    expect(stats.longestGap.before?.matchId).toBe(before.matchId);
    expect(stats.longestGap.after?.matchId).toBe(after.matchId);
    expect(stats.longestGap.matchesMissed).toBe(2);
  });

  it("includes voided matches in the gap but still counts them as a match missed if unattended", () => {
    const before = makeFixture({ date: "2020-01-01" });
    const voided = makeFixture({ date: "2020-01-05", countsInRecord: false });
    const after = makeFixture({ date: "2020-06-01" });
    const fixtures = [before, voided, after];
    const attended = [before.matchId, after.matchId];
    const stats = computeStats(fixtures, [groundA], attended, [address]);

    expect(stats.longestGap.matchesMissed).toBe(1);
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

describe("best seasons", () => {
  it("picks the season with the most matches attended, wins seen, and goals seen independently", () => {
    const fixtures = [
      // 2018/19: 2 attended matches, 1 win, 3 Arsenal goals
      makeFixture({ season: "2018/19", date: "2018-08-11", result: "W", arsenalGoals: 2, opponentGoals: 0 }),
      makeFixture({ season: "2018/19", date: "2018-08-18", result: "L", arsenalGoals: 1, opponentGoals: 2 }),
      // 2019/20: 3 attended matches, 1 win, 1 Arsenal goal (fewer goals, but more matches/wins is still 1, so wins tie-break on first-seen)
      makeFixture({ season: "2019/20", date: "2019-08-10", result: "W", arsenalGoals: 1, opponentGoals: 0 }),
      makeFixture({ season: "2019/20", date: "2019-08-17", result: "D", arsenalGoals: 0, opponentGoals: 0 }),
      makeFixture({ season: "2019/20", date: "2019-08-24", result: "D", arsenalGoals: 0, opponentGoals: 0 }),
      // 2020/21: 1 attended match, 0 wins, 5 Arsenal goals — the standout goals season
      makeFixture({ season: "2020/21", date: "2020-09-12", result: "D", arsenalGoals: 5, opponentGoals: 5 }),
    ];
    const attended = fixtures.map((f) => f.matchId);
    const stats = computeStats(fixtures, [groundA], attended, [address]);

    expect(stats.bestSeasons.attendance).toEqual({ season: "2019/20", value: 3 });
    expect(stats.bestSeasons.wins).toEqual({ season: "2018/19", value: 1 });
    expect(stats.bestSeasons.goals).toEqual({ season: "2020/21", value: 5 });
  });

  it("excludes voided matches from wins and goals but still counts them for attendance", () => {
    const voided = makeFixture({
      season: "2018/19",
      countsInRecord: false,
      result: "W",
      arsenalGoals: 5,
      opponentGoals: 0,
    });
    const normal = makeFixture({ season: "2019/20", result: "L", arsenalGoals: 0, opponentGoals: 1 });
    const fixtures = [voided, normal];
    const attended = fixtures.map((f) => f.matchId);
    const stats = computeStats(fixtures, [groundA], attended, [address]);

    expect(stats.bestSeasons.attendance).toEqual({ season: "2018/19", value: 1 });
    expect(stats.bestSeasons.wins).toBeNull();
    expect(stats.bestSeasons.goals).toEqual({ season: "2019/20", value: 0 });
  });

  it("is null across the board with no attended matches", () => {
    const stats = computeStats([makeFixture()], [groundA], [], [address]);

    expect(stats.bestSeasons).toEqual({ attendance: null, wins: null, goals: null });
  });
});

describe("monthly attendance", () => {
  it("counts attended matches per calendar month, in season order (Aug to May), with zero for unseen months", () => {
    const fixtures = [
      makeFixture({ date: "2019-08-11" }),
      makeFixture({ date: "2019-08-18" }),
      makeFixture({ date: "2019-12-26" }),
      makeFixture({ date: "2020-01-01" }), // not attended
    ];
    const attended = [fixtures[0].matchId, fixtures[1].matchId, fixtures[2].matchId];
    const stats = computeStats(fixtures, [groundA], attended, [address]);

    expect(stats.monthlyAttendance.map((m) => m.month)).toEqual([
      "08", "09", "10", "11", "12", "01", "02", "03", "04", "05",
    ]);
    expect(stats.monthlyAttendance.find((m) => m.month === "08")).toEqual({
      month: "08",
      label: "Aug",
      count: 2,
    });
    expect(stats.monthlyAttendance.find((m) => m.month === "12")?.count).toBe(1);
    expect(stats.monthlyAttendance.find((m) => m.month === "01")?.count).toBe(0);
  });

  it("appends June/July only when the scope actually has fixtures in them", () => {
    const withoutSummer = [makeFixture({ date: "2019-08-11" })];
    const noSummer = computeStats(withoutSummer, [groundA], [], [address]);
    expect(noSummer.monthlyAttendance.map((m) => m.month)).toEqual([
      "08", "09", "10", "11", "12", "01", "02", "03", "04", "05",
    ]);

    const withSummer = [
      makeFixture({ date: "2020-06-17" }),
      makeFixture({ date: "2020-07-01" }),
    ];
    const attended = withSummer.map((f) => f.matchId);
    const summerStats = computeStats(withSummer, [groundA], attended, [address]);
    expect(summerStats.monthlyAttendance.map((m) => m.month)).toEqual([
      "08", "09", "10", "11", "12", "01", "02", "03", "04", "05", "06", "07",
    ]);
    expect(summerStats.monthlyAttendance.find((m) => m.month === "06")?.count).toBe(1);
    expect(summerStats.monthlyAttendance.find((m) => m.month === "07")?.count).toBe(1);
  });

  it("counts an attended voided match, like other plain attendance stats", () => {
    const voided = makeFixture({ date: "2019-08-11", countsInRecord: false });
    const stats = computeStats([voided], [groundA], [voided.matchId], [address]);
    expect(stats.monthlyAttendance.find((m) => m.month === "08")?.count).toBe(1);
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
