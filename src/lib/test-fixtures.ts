import type { Fixture, Ground, HomeAddress } from "../types";

// Shared builders for the test suite. Each returns a valid, complete object
// with sensible defaults — pass `overrides` to set only the fields a given
// test actually cares about.

let nextFixtureId = 1;

export function makeFixture(overrides: Partial<Fixture> = {}): Fixture {
  return {
    matchId: `M${String(nextFixtureId++).padStart(4, "0")}`,
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

export function makeGround(overrides: Partial<Ground> = {}): Ground {
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

export function makeAddress(overrides: Partial<HomeAddress> = {}): HomeAddress {
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
