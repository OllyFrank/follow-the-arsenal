import { describe, expect, it } from "vitest";
import { needsReauth } from "./cloudAccount";

describe("needsReauth", () => {
  it("is false for a sign-in just now", () => {
    expect(needsReauth(new Date().toISOString())).toBe(false);
  });

  it("is false just under the 24h window", () => {
    const almost23h59m = new Date(Date.now() - (24 * 60 * 60 * 1000 - 60_000)).toISOString();
    expect(needsReauth(almost23h59m)).toBe(false);
  });

  it("is true just over the 24h window", () => {
    const justOver24h = new Date(Date.now() - (24 * 60 * 60 * 1000 + 60_000)).toISOString();
    expect(needsReauth(justOver24h)).toBe(true);
  });

  it("is true (fail closed) when there's no last-sign-in timestamp at all", () => {
    expect(needsReauth(undefined)).toBe(true);
  });
});
