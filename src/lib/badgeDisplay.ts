// Presentation-only derived data for the Badges logbook UI — ordering and
// styling decisions that design-handoff/BADGES.md calls for, layered on top
// of badges.ts/badgeEngine.ts rather than inside them, since none of this
// changes what's earned or when, only how the earned set is displayed.
import type { Fixture } from "../types";
import type { UnlockItem } from "./badgeEngine";
import type { GreatestMatchTier, WitnessEntry } from "./badges";

const TIER_RANK: Record<GreatestMatchTier, number> = { gold: 0, silver: 1, bronze: 2 };

export interface AttendedWitnessEntry extends WitnessEntry {
  fixture: Fixture;
}

/** Only matches the user attended, ordered by tier (gold, then silver, then
 * bronze) and by date within each tier — design-handoff/BADGES.md Page 4. */
export function witnessToHistoryEntries(entries: WitnessEntry[]): AttendedWitnessEntry[] {
  return entries
    .filter((e): e is AttendedWitnessEntry => e.unlocked && e.fixture !== null)
    .sort((a, b) => {
      const tierDiff = TIER_RANK[a.greatestMatch.tier] - TIER_RANK[b.greatestMatch.tier];
      if (tierDiff !== 0) return tierDiff;
      return a.greatestMatch.date.localeCompare(b.greatestMatch.date);
    });
}

export interface CollectedStamp<T> {
  item: T;
  earningMatch: Fixture;
  /** 1-indexed collection order — drives the ink/shape/angle cycles below. */
  position: number;
}

/** Only collected items, in the order first collected — design-handoff/
 * BADGES.md Page 3: "one stamp per collected country only, in the order
 * they were collected (date of first European match there)." */
export function collectedInOrder<T>(items: UnlockItem<T>[]): CollectedStamp<T>[] {
  return items
    .filter(
      (i): i is UnlockItem<T> & { earningMatch: Fixture } => i.unlocked && i.earningMatch !== null,
    )
    .sort((a, b) => a.earningMatch.date.localeCompare(b.earningMatch.date))
    .map((i, index) => ({ item: i.item, earningMatch: i.earningMatch, position: index + 1 }));
}

const STAMP_INKS = ["#b3121b", "#1f4f8f", "#2e6b3f", "#6b3a8f", "#8a5a14"] as const;
const STAMP_SHAPES = ["rectangle", "circle", "oval"] as const;
const STAMP_ANGLES = [-4, 5, -3, 3, -6, 2, -2, 4, -5, 6] as const;

export type StampShape = (typeof STAMP_SHAPES)[number];

export interface StampStyle {
  ink: string;
  shape: StampShape;
  angleDeg: number;
}

/** Stamp number n (1 = first collected) takes its ink, shape and angle from
 * three fixed cycles, so neighbouring stamps never repeat — design-handoff/
 * BADGES.md Page 3 "Choosing each stamp's look". A country name longer than
 * 11 characters forces a rectangle instead of a circle, since a circle
 * can't hold it. If unticking a match shifts an earlier stamp out, later
 * stamps shift along the cycle too — that's accepted in the brief. */
export function stampStyle(position: number, countryName: string): StampStyle {
  const ink = STAMP_INKS[(position - 1) % STAMP_INKS.length];
  let shape = STAMP_SHAPES[(position - 1) % STAMP_SHAPES.length];
  if (shape === "circle" && countryName.length > 11) shape = "rectangle";
  const angleDeg = STAMP_ANGLES[(position - 1) % STAMP_ANGLES.length];
  return { ink, shape, angleDeg };
}
