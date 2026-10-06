import { describe, expect, it } from "vitest";
import { addressesConflict, matchIdsToUpload } from "./guestMigration";
import { makeAddress } from "./test-fixtures";

describe("matchIdsToUpload", () => {
  it("only includes guest matches the account doesn't already have", () => {
    const guest = new Set(["M0001", "M0002", "M0003"]);
    const cloud = new Set(["M0002"]);

    expect(matchIdsToUpload(guest, cloud)).toEqual(["M0001", "M0003"]);
  });

  it("is empty when the account already has every guest match", () => {
    const guest = new Set(["M0001"]);
    const cloud = new Set(["M0001", "M0002"]);

    expect(matchIdsToUpload(guest, cloud)).toEqual([]);
  });

  it("is the full guest set when the account has none of it", () => {
    const guest = new Set(["M0001", "M0002"]);
    const cloud = new Set<string>();

    expect(matchIdsToUpload(guest, cloud)).toEqual(["M0001", "M0002"]);
  });
});

describe("addressesConflict", () => {
  it("is false when the account has no addresses, regardless of the guest set", () => {
    expect(addressesConflict([makeAddress()], [])).toBe(false);
  });

  it("is false when the guest has no addresses to offer", () => {
    expect(addressesConflict([], [makeAddress()])).toBe(false);
  });

  it("is true only when both sides have at least one address", () => {
    expect(addressesConflict([makeAddress()], [makeAddress()])).toBe(true);
  });
});
