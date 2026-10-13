import { describe, expect, it } from "vitest";
import { tierColor } from "./badgeTierColor";
import { computeBadges } from "./badges";
import fixturesData from "../data/fixtures.json";
import groundsData from "../data/grounds.json";
import type { Fixture, Ground } from "../types";

describe("tierColor", () => {
  it("is locked when there's no tier index", () => {
    expect(tierColor(null, false)).toBe("locked");
  });

  it("is legendary for the top tier regardless of its index", () => {
    expect(tierColor(0, true)).toBe("legendary");
    expect(tierColor(6, true)).toBe("legendary");
  });

  it("steps through the eight-material ladder by tier index", () => {
    expect(tierColor(0, false)).toBe("bronze");
    expect(tierColor(1, false)).toBe("silver");
    expect(tierColor(2, false)).toBe("gold");
    expect(tierColor(3, false)).toBe("platinum");
    expect(tierColor(4, false)).toBe("ruby");
    expect(tierColor(5, false)).toBe("onyx");
    expect(tierColor(6, false)).toBe("diamond");
  });
});

describe("tierColor against real badge ladders", () => {
  const fixtures = fixturesData as Fixture[];
  const grounds = groundsData as Ground[];
  const groundCountryById = new Map(grounds.map((g) => [g.groundId, g.country]));
  const attendableMatchIds = fixtures.filter((f) => !f.behindClosedDoors).map((f) => f.matchId);
  const badges = computeBadges(fixtures, groundCountryById, new Set(attendableMatchIds));

  it("Ghost Grounds (4 tiers) runs Bronze, Silver, Gold, then Legendary", () => {
    const colors = badges.grounds.ghostGrounds.allTiers.map((t, i) =>
      tierColor(i, !!t.legendary),
    );
    expect(colors).toEqual(["bronze", "silver", "gold", "legendary"]);
  });

  it("Goals Galore (8 tiers) uses every material in the ladder", () => {
    const colors = badges.attendance.goalsGalore.allTiers.map((t, i) =>
      tierColor(i, !!t.legendary),
    );
    expect(colors).toEqual([
      "bronze",
      "silver",
      "gold",
      "platinum",
      "ruby",
      "onyx",
      "diamond",
      "legendary",
    ]);
  });

  it("no two tiers of the same badge ever share a material", () => {
    for (const badge of [
      badges.attendance.loyalSupporter,
      badges.attendance.goalsGalore,
      badges.attendance.longevity,
      badges.attendance.homeComforts,
      badges.attendance.awayTraveller,
      badges.grounds.groundHopper,
      badges.grounds.ghostGrounds,
      badges.europe.europeanTours,
    ]) {
      const colors = badge.allTiers.map((t, i) => tierColor(i, !!t.legendary));
      expect(new Set(colors).size).toBe(colors.length);
    }
  });
});
