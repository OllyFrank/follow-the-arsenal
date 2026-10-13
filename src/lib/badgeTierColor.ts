// Fixed eight-step tier material ladder (design-handoff/BADGES.md "Tier
// colour scale"). A badge's tier at index i (0 = its first tier) uses
// ladder step i; its top tier always uses Legendary, however long the
// ladder runs — a 3-tier badge like Ghost Grounds only ever reaches Bronze,
// Silver, Legendary, while an 8-tier badge like Goals Galore uses every
// material. No two tiers of the same badge ever share a material.
const LADDER = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "ruby",
  "onyx",
  "diamond",
] as const;

export type TierColor = (typeof LADDER)[number] | "legendary" | "locked";

export function tierColor(tierIndex: number | null, legendary: boolean): TierColor {
  if (tierIndex === null) return "locked";
  if (legendary) return "legendary";
  return LADDER[Math.min(tierIndex, LADDER.length - 1)];
}
