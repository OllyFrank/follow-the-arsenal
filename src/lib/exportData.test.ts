import { describe, expect, it } from "vitest";
import { buildExportPayload, toCsv } from "./exportData";
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

describe("toCsv", () => {
  it("writes a header row from the first row's keys, then one row per entry", () => {
    const csv = toCsv([
      { matchId: "M0001", date: "2020-01-01" },
      { matchId: "M0002", date: "2020-01-08" },
    ]);

    expect(csv).toBe("matchId,date\nM0001,2020-01-01\nM0002,2020-01-08");
  });

  it("is an empty string for no rows, rather than just a stray header", () => {
    expect(toCsv([])).toBe("");
  });

  it("quotes fields containing a comma, quote, or newline", () => {
    const csv = toCsv([{ venue: "Stamford Bridge, London", note: 'Said "hello"' }]);

    expect(csv).toBe('venue,note\n"Stamford Bridge, London","Said ""hello"""');
  });

  it("writes null as an empty field, e.g. an ongoing address's end date", () => {
    expect(toCsv([{ toDate: null }])).toBe("toDate\n");
  });
});
