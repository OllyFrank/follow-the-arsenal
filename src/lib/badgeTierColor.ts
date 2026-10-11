// Tier colours step up from bronze through silver, gold and platinum, and
// the top tier of every tiered badge uses a special "Legendary" style
// (BADGES_PLAN.md). The ladder lengths differ per badge (3 tiers for Ghost
// Grounds, 7 for Loyal Supporter), so position is mapped proportionally
// across the non-legendary tiers rather than hard-coded per badge.
const RUNGS = ["bronze", "silver", "gold", "platinum"] as const;
export type TierColor = (typeof RUNGS)[number] | "legendary" | "locked";

export function tierColor(
  tierIndex: number | null,
  totalTiers: number,
  legendary: boolean,
): TierColor {
  if (tierIndex === null) return "locked";
  if (legendary) return "legendary";
  const nonLegendaryCount = Math.max(1, totalTiers - 1);
  if (nonLegendaryCount <= 1) return RUNGS[0];
  const ratio = tierIndex / (nonLegendaryCount - 1);
  const idx = Math.min(RUNGS.length - 1, Math.round(ratio * (RUNGS.length - 1)));
  return RUNGS[idx];
}
