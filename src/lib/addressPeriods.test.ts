import { describe, expect, it } from "vitest";
import { findPeriodIssues } from "./addressPeriods";
import { makeAddress } from "./test-fixtures";

describe("findPeriodIssues", () => {
  it("reports no issue for a single address", () => {
    expect(findPeriodIssues([makeAddress()])).toEqual([]);
  });

  it("reports no issue for contiguous periods (next starts the day after the last ends)", () => {
    const a = makeAddress({ id: "a", fromDate: "2000-01-01", toDate: "2010-06-30" });
    const b = makeAddress({ id: "b", fromDate: "2010-07-01", toDate: "2020-01-01" });
    expect(findPeriodIssues([a, b])).toEqual([]);
  });

  it("flags a genuine gap with the correct day count", () => {
    const a = makeAddress({ id: "a", fromDate: "2000-01-01", toDate: "2010-01-01" });
    const b = makeAddress({ id: "b", fromDate: "2010-01-11", toDate: "2020-01-01" });
    const issues = findPeriodIssues([a, b]);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ type: "gap", days: 9 });
  });

  it("flags a same-day handover as an overlap (both dates are inclusive)", () => {
    const a = makeAddress({ id: "a", fromDate: "2000-01-01", toDate: "2010-01-01" });
    const b = makeAddress({ id: "b", fromDate: "2010-01-01", toDate: "2020-01-01" });
    const issues = findPeriodIssues([a, b]);
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("overlap");
  });

  it("flags an open-ended period followed by another period as an overlap", () => {
    const a = makeAddress({ id: "a", fromDate: "2000-01-01", toDate: null });
    const b = makeAddress({ id: "b", fromDate: "2010-01-01", toDate: "2020-01-01" });
    const issues = findPeriodIssues([a, b]);
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("overlap");
  });

  it("flags overlapping date ranges", () => {
    const a = makeAddress({ id: "a", fromDate: "2000-01-01", toDate: "2010-06-01" });
    const b = makeAddress({ id: "b", fromDate: "2010-01-01", toDate: "2020-01-01" });
    const issues = findPeriodIssues([a, b]);
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("overlap");
  });
});
