import { describe, expect, it } from "vitest";
import type { Fixture } from "../types";
import {
  formatDateLong,
  formatDistance,
  formatFixtureScoreLine,
  googleSearchUrl,
} from "./format";

function makeFixture(overrides: Partial<Fixture> = {}): Fixture {
  return {
    matchId: "M0001",
    date: "2014-05-17",
    season: "2013/14",
    competition: "FA Cup",
    stage: "Final",
    homeTeam: "Arsenal",
    awayTeam: "Hull City",
    opponent: "Hull City",
    venueType: "N",
    groundId: "G001",
    venue: "Wembley Stadium",
    arsenalGoals: 3,
    opponentGoals: 2,
    result: "W",
    penaltyShootOut: null,
    behindClosedDoors: false,
    countsInRecord: true,
    notes: null,
    ...overrides,
  };
}

describe("formatDateLong", () => {
  it("formats an ISO date as '<day> <Month> <year>'", () => {
    expect(formatDateLong("2014-05-17")).toBe("17 May 2014");
  });

  it("does not zero-pad the day", () => {
    expect(formatDateLong("2014-05-01")).toBe("1 May 2014");
  });
});

describe("formatFixtureScoreLine", () => {
  it("orients the score home-away when Arsenal is the home team", () => {
    const fixture = makeFixture({ homeTeam: "Arsenal", awayTeam: "Hull City", arsenalGoals: 3, opponentGoals: 2 });
    expect(formatFixtureScoreLine(fixture)).toBe("3-2");
  });

  it("orients the score home-away when Arsenal is the away team", () => {
    const fixture = makeFixture({
      homeTeam: "Hull City",
      awayTeam: "Arsenal",
      arsenalGoals: 3,
      opponentGoals: 2,
    });
    expect(formatFixtureScoreLine(fixture)).toBe("2-3");
  });
});

describe("googleSearchUrl", () => {
  it("builds a query from teams, date, and score", () => {
    const fixture = makeFixture({ homeTeam: "Arsenal", awayTeam: "Chelsea", arsenalGoals: 3, opponentGoals: 2, date: "2014-05-17" });
    const url = new URL(googleSearchUrl(fixture));
    expect(url.hostname).toBe("www.google.com");
    expect(url.searchParams.get("q")).toBe("Arsenal v Chelsea 17 May 2014 3-2");
  });
});

describe("formatDistance", () => {
  it("converts km to mi", () => {
    expect(formatDistance(100, "mi")).toBe("62 mi");
  });

  it("leaves km as km", () => {
    expect(formatDistance(100, "km")).toBe("100 km");
  });
});
