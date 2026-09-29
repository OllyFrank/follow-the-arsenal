import { describe, expect, it } from "vitest";
import type { Fixture, Ground, HomeAddress } from "../types";
import { computeDistances, findHomeAddressForDate, haversineKm } from "./distance";

function makeFixture(overrides: Partial<Fixture> = {}): Fixture {
  return {
    matchId: "M0001",
    date: "2020-01-01",
    season: "2019/20",
    competition: "Premier League",
    stage: "Premier League",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    opponent: "Chelsea",
    venueType: "H",
    groundId: "G001",
    venue: "Emirates Stadium",
    arsenalGoals: 1,
    opponentGoals: 0,
    result: "W",
    penaltyShootOut: null,
    behindClosedDoors: false,
    countsInRecord: true,
    notes: null,
    ...overrides,
  };
}

function makeGround(overrides: Partial<Ground> = {}): Ground {
  return {
    groundId: "G001",
    ground: "Emirates Stadium",
    alsoKnownAs: null,
    usedBy: "Arsenal",
    country: "England",
    latitude: 51.5549,
    longitude: -0.1084,
    confidence: "High",
    ...overrides,
  };
}

function makeAddress(overrides: Partial<HomeAddress> = {}): HomeAddress {
  return {
    id: "addr-1",
    label: "Home",
    query: "N5 1BU",
    latitude: 51.5556,
    longitude: -0.1063,
    fromDate: "2000-01-01",
    toDate: null,
    ...overrides,
  };
}

describe("haversineKm", () => {
  it("returns 0 for identical points", () => {
    expect(haversineKm(51.5, -0.1, 51.5, -0.1)).toBeCloseTo(0, 6);
  });

  it("matches the exact quarter-circumference distance along the equator", () => {
    // 90 degrees of longitude at the equator = a quarter of Earth's circumference,
    // using this module's own EARTH_RADIUS_KM (6371), independent of the haversine
    // formula's trig: distance = radius * (pi / 2).
    const expected = 6371 * (Math.PI / 2);
    expect(haversineKm(0, 0, 0, 90)).toBeCloseTo(expected, 4);
  });

  it("matches the exact quarter-circumference distance pole to equator", () => {
    const expected = 6371 * (Math.PI / 2);
    expect(haversineKm(0, 0, 90, 0)).toBeCloseTo(expected, 4);
  });
});

describe("findHomeAddressForDate", () => {
  const bounded = makeAddress({ id: "bounded", fromDate: "2010-01-01", toDate: "2015-12-31" });
  const openEnded = makeAddress({ id: "open", fromDate: "2016-01-01", toDate: null });

  it("finds a bounded period that covers the date", () => {
    expect(findHomeAddressForDate([bounded], "2012-06-15")?.id).toBe("bounded");
  });

  it("returns null for a date before the period starts", () => {
    expect(findHomeAddressForDate([bounded], "2009-12-31")).toBeNull();
  });

  it("returns null for a date after a bounded period ends", () => {
    expect(findHomeAddressForDate([bounded], "2016-01-01")).toBeNull();
  });

  it("finds an open-ended period for any date on or after its start", () => {
    expect(findHomeAddressForDate([openEnded], "2030-01-01")?.id).toBe("open");
  });
});

describe("computeDistances", () => {
  const ground = makeGround();
  const groundsById = new Map([[ground.groundId, ground]]);
  const address = makeAddress();

  it("includes an attended match and doubles the one-way distance for the return trip", () => {
    const fixture = makeFixture({ matchId: "M0001" });
    const { matches } = computeDistances(
      [fixture],
      groundsById,
      new Set(["M0001"]),
      [address],
    );
    expect(matches).toHaveLength(1);
    const oneWay = haversineKm(address.latitude, address.longitude, ground.latitude, ground.longitude);
    expect(matches[0].distanceKm).toBeCloseTo(oneWay * 2, 6);
  });

  it("excludes a behind-closed-doors match even if marked attended", () => {
    const fixture = makeFixture({ matchId: "M0001", behindClosedDoors: true });
    const { matches, unresolvedFixtures } = computeDistances(
      [fixture],
      groundsById,
      new Set(["M0001"]),
      [address],
    );
    expect(matches).toHaveLength(0);
    expect(unresolvedFixtures).toHaveLength(0);
  });

  it("puts a match with no covering address period into unresolvedFixtures", () => {
    const fixture = makeFixture({ matchId: "M0001", date: "1990-01-01" });
    const { matches, unresolvedFixtures } = computeDistances(
      [fixture],
      groundsById,
      new Set(["M0001"]),
      [address], // address starts 2000-01-01, doesn't cover 1990
    );
    expect(matches).toHaveLength(0);
    expect(unresolvedFixtures).toEqual([fixture]);
  });

  it("still includes a voided (countsInRecord: false) match", () => {
    const fixture = makeFixture({ matchId: "M0001", countsInRecord: false });
    const { matches } = computeDistances(
      [fixture],
      groundsById,
      new Set(["M0001"]),
      [address],
    );
    expect(matches).toHaveLength(1);
  });
});
