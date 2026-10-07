import { describe, expect, it } from "vitest";
import { buildExportPayload } from "./exportData";
import { makeAddress, makeFixture } from "./test-fixtures";

describe("buildExportPayload", () => {
  it("includes only attended matches, with just the readable fields", () => {
    const attended = makeFixture({ matchId: "M0001", date: "2020-01-01" });
    const missed = makeFixture({ matchId: "M0002", date: "2020-01-08" });
    const address = makeAddress();

    const payload = buildExportPayload(
      "olly@example.com",
      "mi",
      [address],
      new Set(["M0001"]),
      [attended, missed],
    );

    expect(payload.profile).toEqual({ email: "olly@example.com", units: "mi" });
    expect(payload.addresses).toEqual([address]);
    expect(payload.attendedMatches).toEqual([
      {
        matchId: "M0001",
        date: "2020-01-01",
        homeTeam: attended.homeTeam,
        awayTeam: attended.awayTeam,
        venue: attended.venue,
      },
    ]);
  });

  it("is empty for attended matches and addresses when there are none", () => {
    const payload = buildExportPayload("olly@example.com", "km", [], new Set(), [makeFixture()]);

    expect(payload.addresses).toEqual([]);
    expect(payload.attendedMatches).toEqual([]);
  });
});
