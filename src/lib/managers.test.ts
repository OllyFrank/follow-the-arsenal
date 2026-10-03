import { describe, expect, it } from "vitest";
import { managerForDate } from "./managers";

const managers = [
  { manager: "George Graham", from: "1986-05-14" },
  { manager: "Bruce Rioch", from: "1995-06-08" },
  { manager: "Arsène Wenger", from: "1996-10-01" },
  { manager: "Mikel Arteta", from: "2019-12-22" },
];

describe("managerForDate", () => {
  it("returns the manager whose reign covers the date", () => {
    expect(managerForDate("1990-01-01", managers)).toBe("George Graham");
    expect(managerForDate("1996-10-01", managers)).toBe("Arsène Wenger");
    expect(managerForDate("2025-01-01", managers)).toBe("Mikel Arteta");
  });

  it("uses the manager in place right up to the day before a handover", () => {
    expect(managerForDate("1996-09-30", managers)).toBe("Bruce Rioch");
  });

  it("returns null for a date before the earliest entry", () => {
    expect(managerForDate("1980-01-01", managers)).toBeNull();
  });

  it("doesn't depend on input order", () => {
    const shuffled = [...managers].reverse();
    expect(managerForDate("2000-01-01", shuffled)).toBe("Arsène Wenger");
  });
});
