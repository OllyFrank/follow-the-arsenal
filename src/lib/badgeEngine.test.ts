import { describe, expect, it } from "vitest";
import { computeCumulativeBadge, computeDistinctBadge, computeUnlockList } from "./badgeEngine";
import { makeFixture } from "./test-fixtures";

const TIERS = [
  { label: "1", threshold: 1 },
  { label: "2", threshold: 2 },
  { label: "3", threshold: 3, legendary: true },
];

describe("computeCumulativeBadge", () => {
  it("is locked with zero progress when nothing happened", () => {
    const badge = computeCumulativeBadge([], TIERS);
    expect(badge.locked).toBe(true);
    expect(badge.tierIndex).toBeNull();
    expect(badge.earningMatch).toBeNull();
    expect(badge.current).toBe(0);
    expect(badge.nextThreshold).toBe(1);
  });

  it("records the event where the running total first reached each threshold", () => {
    const a = makeFixture({ date: "2020-01-01" });
    const b = makeFixture({ date: "2020-01-08" });
    const c = makeFixture({ date: "2020-01-15" });
    const badge = computeCumulativeBadge(
      [
        { fixture: a, weight: 1 },
        { fixture: b, weight: 1 },
        { fixture: c, weight: 1 },
      ],
      TIERS,
    );
    expect(badge.tierIndex).toBe(2);
    expect(badge.tierLabel).toBe("3");
    expect(badge.legendary).toBe(true);
    expect(badge.earningMatch?.matchId).toBe(c.matchId);
    expect(badge.tiersReached.map((t) => [t.label, t.earningMatch.matchId])).toEqual([
      ["1", a.matchId],
      ["2", b.matchId],
      ["3", c.matchId],
    ]);
  });

  it("drops a tier and reassigns the earning match to the next qualifying event when the top one is removed", () => {
    const a = makeFixture({ date: "2020-01-01" });
    const b = makeFixture({ date: "2020-01-08" });
    const withThree = computeCumulativeBadge(
      [
        { fixture: a, weight: 1 },
        { fixture: b, weight: 1 },
      ],
      TIERS,
    );
    // Simulates un-ticking: the event for `b` is dropped entirely.
    const afterUntick = computeCumulativeBadge([{ fixture: a, weight: 1 }], TIERS);

    expect(withThree.tierIndex).toBe(1);
    expect(withThree.earningMatch?.matchId).toBe(b.matchId);
    expect(afterUntick.tierIndex).toBe(0);
    expect(afterUntick.tierLabel).toBe("1");
    expect(afterUntick.earningMatch?.matchId).toBe(a.matchId);
  });

  it("a single event that jumps several thresholds at once still earns every tier up to it", () => {
    const big = makeFixture({ date: "2020-01-01" });
    const badge = computeCumulativeBadge([{ fixture: big, weight: 5 }], TIERS);
    expect(badge.tierIndex).toBe(2);
    expect(badge.earningMatch?.matchId).toBe(big.matchId);
    expect(badge.current).toBe(5);
  });
});

describe("computeDistinctBadge", () => {
  it("only counts the first appearance of each key", () => {
    const a = makeFixture({ date: "2020-01-01", groundId: "G001" });
    const b = makeFixture({ date: "2020-01-08", groundId: "G001" });
    const c = makeFixture({ date: "2020-01-15", groundId: "G002" });
    const badge = computeDistinctBadge(
      [
        { fixture: a, key: a.groundId },
        { fixture: b, key: b.groundId },
        { fixture: c, key: c.groundId },
      ],
      [
        { label: "1", threshold: 1 },
        { label: "2", threshold: 2 },
      ],
    );
    expect(badge.current).toBe(2);
    expect(badge.tierLabel).toBe("2");
    expect(badge.earningMatch?.matchId).toBe(c.matchId);
  });
});

describe("computeUnlockList", () => {
  it("unlocks only the keys with a qualifying event, keeping the rest locked", () => {
    const spain = makeFixture({ date: "2020-01-01" });
    const result = computeUnlockList(
      [
        { key: "Spain", item: { country: "Spain" } },
        { key: "Italy", item: { country: "Italy" } },
      ],
      [{ fixture: spain, key: "Spain" }],
    );
    const byKey = Object.fromEntries(result.map((r) => [r.key, r]));
    expect(byKey.Spain.unlocked).toBe(true);
    expect(byKey.Spain.earningMatch?.matchId).toBe(spain.matchId);
    expect(byKey.Italy.unlocked).toBe(false);
    expect(byKey.Italy.earningMatch).toBeNull();
  });

  it("earns on the chronologically first qualifying event for a key, not the last", () => {
    const earlier = makeFixture({ date: "2000-01-01" });
    const later = makeFixture({ date: "2010-01-01" });
    const result = computeUnlockList(
      [{ key: "G001", item: { groundId: "G001" } }],
      [
        { fixture: earlier, key: "G001" },
        { fixture: later, key: "G001" },
      ],
    );
    expect(result[0].earningMatch?.matchId).toBe(earlier.matchId);
  });
});
