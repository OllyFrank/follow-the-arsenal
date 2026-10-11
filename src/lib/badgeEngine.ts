import type { Fixture } from "../types";

// Generic, badge-shape-agnostic building blocks shared by every badge in
// badges.ts. None of this knows what a "ground" or a "season" is — each
// concrete badge in badges.ts turns its own rule into one of these shapes.

export interface BadgeTierDef {
  label: string;
  threshold: number;
  legendary?: boolean;
}

export interface BadgeProgress {
  tierIndex: number | null;
  tierLabel: string | null;
  legendary: boolean;
  earningMatch: Fixture | null;
  current: number;
  nextThreshold: number | null;
  nextLabel: string | null;
  locked: boolean;
}

function finishTiers(
  tiers: BadgeTierDef[],
  current: number,
  crossedAt: Map<number, Fixture>,
): BadgeProgress {
  let tierIndex: number | null = null;
  for (let i = 0; i < tiers.length; i++) {
    if (current >= tiers[i].threshold) tierIndex = i;
  }
  const reached = tierIndex === null ? null : tiers[tierIndex];
  const next = tierIndex === null ? (tiers[0] ?? null) : (tiers[tierIndex + 1] ?? null);
  return {
    tierIndex,
    tierLabel: reached?.label ?? null,
    legendary: reached?.legendary ?? false,
    earningMatch: reached ? (crossedAt.get(reached.threshold) ?? null) : null,
    current,
    nextThreshold: next?.threshold ?? null,
    nextLabel: next?.label ?? null,
    locked: tierIndex === null,
  };
}

/** A running count (e.g. goals, matches) crossed against a tier ladder. The
 * "earning match" for a tier is the chronologically first event at which the
 * running total reached that tier's threshold — matching
 * BADGES_PLAN.md: "the match where the user crossed the tier's threshold." */
export function computeCumulativeBadge(
  events: { fixture: Fixture; weight: number }[],
  tiers: BadgeTierDef[],
): BadgeProgress {
  let current = 0;
  const crossedAt = new Map<number, Fixture>();
  for (const { fixture, weight } of events) {
    current += weight;
    for (const tier of tiers) {
      if (!crossedAt.has(tier.threshold) && current >= tier.threshold) {
        crossedAt.set(tier.threshold, fixture);
      }
    }
  }
  return finishTiers(tiers, current, crossedAt);
}

/** Like computeCumulativeBadge, but counts the first appearance of each
 * distinct key (e.g. a ground ID or a season) rather than a weighted sum. */
export function computeDistinctBadge(
  events: { fixture: Fixture; key: string }[],
  tiers: BadgeTierDef[],
): BadgeProgress {
  const seen = new Set<string>();
  const weighted: { fixture: Fixture; weight: number }[] = [];
  for (const { fixture, key } of events) {
    if (seen.has(key)) continue;
    seen.add(key);
    weighted.push({ fixture, weight: 1 });
  }
  return computeCumulativeBadge(weighted, tiers);
}

export interface UnlockItem<T> {
  key: string;
  item: T;
  unlocked: boolean;
  earningMatch: Fixture | null;
}

/** One badge per item in a fixed reference list (e.g. one per country, one
 * per stadium): each is unlocked by the chronologically first qualifying
 * attended match with that key. Items absent from `events` stay locked. */
export function computeUnlockList<T>(
  keys: { key: string; item: T }[],
  events: { fixture: Fixture; key: string }[],
): UnlockItem<T>[] {
  const firstMatchByKey = new Map<string, Fixture>();
  for (const { fixture, key } of events) {
    if (!firstMatchByKey.has(key)) firstMatchByKey.set(key, fixture);
  }
  return keys.map(({ key, item }) => ({
    key,
    item,
    unlocked: firstMatchByKey.has(key),
    earningMatch: firstMatchByKey.get(key) ?? null,
  }));
}
