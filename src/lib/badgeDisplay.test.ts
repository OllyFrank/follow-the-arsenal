import { describe, expect, it } from "vitest";
import { collectedInOrder, stampStyle, witnessToHistoryEntries } from "./badgeDisplay";
import { makeFixture } from "./test-fixtures";
import type { WitnessEntry, GreatestMatch } from "./badges";

function makeGreatestMatch(overrides: Partial<GreatestMatch> = {}): GreatestMatch {
  return {
    number: 1,
    matchId: "M0001",
    date: "2000-01-01",
    opponent: "Chelsea",
    match: "Arsenal 1-0 Chelsea",
    era: "Wenger",
    why: "A great day",
    tier: "bronze",
    ...overrides,
  };
}

describe("witnessToHistoryEntries", () => {
  it("drops locked entries and orders gold, then silver, then bronze", () => {
    const gold = makeGreatestMatch({ matchId: "M0001", tier: "gold", date: "2010-01-01" });
    const silverEarly = makeGreatestMatch({ matchId: "M0002", tier: "silver", date: "2000-01-01" });
    const silverLate = makeGreatestMatch({ matchId: "M0003", tier: "silver", date: "2005-01-01" });
    const bronze = makeGreatestMatch({ matchId: "M0004", tier: "bronze", date: "1990-01-01" });
    const lockedGold = makeGreatestMatch({ matchId: "M0005", tier: "gold", date: "1980-01-01" });

    const entries: WitnessEntry[] = [
      { greatestMatch: gold, fixture: makeFixture({ matchId: "M0001" }), unlocked: true },
      { greatestMatch: silverEarly, fixture: makeFixture({ matchId: "M0002" }), unlocked: true },
      { greatestMatch: silverLate, fixture: makeFixture({ matchId: "M0003" }), unlocked: true },
      { greatestMatch: bronze, fixture: makeFixture({ matchId: "M0004" }), unlocked: true },
      { greatestMatch: lockedGold, fixture: null, unlocked: false },
    ];

    const ordered = witnessToHistoryEntries(entries).map((e) => e.greatestMatch.matchId);
    expect(ordered).toEqual(["M0001", "M0002", "M0003", "M0004"]);
  });
});

describe("collectedInOrder", () => {
  it("only includes unlocked items, ordered by first-collection date, 1-indexed", () => {
    const later = makeFixture({ date: "2010-01-01" });
    const earlier = makeFixture({ date: "2000-01-01" });
    const items = [
      { key: "Spain", item: { country: "Spain" }, unlocked: true, earningMatch: later },
      { key: "Italy", item: { country: "Italy" }, unlocked: true, earningMatch: earlier },
      { key: "France", item: { country: "France" }, unlocked: false, earningMatch: null },
    ];

    const result = collectedInOrder(items);
    expect(result.map((r) => r.item.country)).toEqual(["Italy", "Spain"]);
    expect(result[0].position).toBe(1);
    expect(result[1].position).toBe(2);
  });
});

describe("stampStyle", () => {
  it("cycles ink every 5, shape every 3, angle every 10", () => {
    const first = stampStyle(1, "Spain");
    const sixth = stampStyle(6, "Spain"); // ink repeats (6 = 1 + 5)
    const fourth = stampStyle(4, "Oval"); // shape repeats (4 = 1 + 3)
    const eleventh = stampStyle(11, "Spain"); // angle repeats (11 = 1 + 10)

    expect(sixth.ink).toBe(first.ink);
    expect(fourth.shape).toBe(first.shape);
    expect(eleventh.angleDeg).toBe(first.angleDeg);
  });

  it("the 14th stamp is Violet, a circle, at 3 degrees — per the brief's worked example", () => {
    const style = stampStyle(14, "Spain");
    expect(style.ink).toBe("#6b3a8f");
    expect(style.shape).toBe("circle");
    expect(style.angleDeg).toBe(3);
  });

  it("forces a rectangle over a circle when the country name is too long", () => {
    // Position 2 would normally be a circle.
    const short = stampStyle(2, "Spain");
    const long = stampStyle(2, "Czech Republic");
    expect(short.shape).toBe("circle");
    expect(long.shape).toBe("rectangle");
  });
});
