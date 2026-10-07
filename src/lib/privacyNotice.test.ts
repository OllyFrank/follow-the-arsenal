import { describe, expect, it } from "vitest";
import { needsConsent, PRIVACY_NOTICE_VERSION } from "./privacyNotice";

describe("needsConsent", () => {
  it("is false once both the current version is accepted and age is confirmed", () => {
    expect(
      needsConsent({ privacyVersionAccepted: PRIVACY_NOTICE_VERSION, ageConfirmed13Plus: true }),
    ).toBe(false);
  });

  it("is true for a fresh profile that has never accepted anything", () => {
    expect(needsConsent({ privacyVersionAccepted: null, ageConfirmed13Plus: false })).toBe(true);
  });

  it("is true again when the accepted version is older than the current one", () => {
    expect(
      needsConsent({
        privacyVersionAccepted: PRIVACY_NOTICE_VERSION - 1,
        ageConfirmed13Plus: true,
      }),
    ).toBe(true);
  });

  it("is true if age was never confirmed, even with the current version accepted", () => {
    expect(
      needsConsent({ privacyVersionAccepted: PRIVACY_NOTICE_VERSION, ageConfirmed13Plus: false }),
    ).toBe(true);
  });
});
