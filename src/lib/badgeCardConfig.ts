import type { BadgeIconId } from "../components/Badges/BadgeIcons";

export type TieredBadgeId =
  | "loyalSupporter"
  | "goalsGalore"
  | "longevity"
  | "homeComforts"
  | "awayTraveller"
  | "groundHopper"
  | "ghostGrounds"
  | "europeanTours";

export interface TieredBadgeConfig {
  id: TieredBadgeId;
  name: string;
  set: "Attendance" | "Grounds" | "Europe";
  icon: BadgeIconId;
  /** Unit shown under the milestone figure on the card face. */
  unit: string;
  /** Unit used in the footer countdown and the detail dialog's banner —
   * shorter than `unit` for a couple of badges (design-handoff/BADGES.md
   * "Per-badge content"). */
  countdownUnit: string;
  /** Plain-language rule for the detail panel and the empty-slot caption —
   * deliberately leaves out engine edge cases (the voided match, shoot-out
   * goals, neutral venues) per the brief's instruction. */
  rule: string;
}

export const TIERED_BADGES: TieredBadgeConfig[] = [
  {
    id: "loyalSupporter",
    name: "Loyal Supporter",
    set: "Attendance",
    icon: "ticket",
    unit: "matches",
    countdownUnit: "matches",
    rule: "Every match you've ticked as attended.",
  },
  {
    id: "goalsGalore",
    name: "Goals Galore",
    set: "Attendance",
    icon: "ball",
    unit: "goals seen",
    countdownUnit: "goals",
    rule: "Arsenal goals scored in the matches you've attended.",
  },
  {
    id: "longevity",
    name: "Longevity",
    set: "Attendance",
    icon: "hourglass",
    unit: "seasons",
    countdownUnit: "seasons",
    rule: "Seasons where you've attended at least one match.",
  },
  {
    id: "homeComforts",
    name: "Home Comforts",
    set: "Attendance",
    icon: "home",
    unit: "full home seasons",
    countdownUnit: "seasons",
    rule: "Seasons where you've attended every home league game.",
  },
  {
    id: "awayTraveller",
    name: "Away Traveller",
    set: "Attendance",
    icon: "coach",
    unit: "seasons of 10+ aways",
    countdownUnit: "seasons",
    rule: "Seasons where you've attended 10 or more away games.",
  },
  {
    id: "groundHopper",
    name: "Ground Hopper",
    set: "Grounds",
    icon: "stadium",
    unit: "grounds",
    countdownUnit: "grounds",
    rule: "Different grounds you've visited.",
  },
  {
    id: "ghostGrounds",
    name: "Ghost Grounds",
    set: "Grounds",
    icon: "ghost",
    unit: "lost grounds",
    countdownUnit: "grounds",
    rule: "Grounds you've visited that are no longer used by their club.",
  },
  {
    id: "europeanTours",
    name: "European Tours",
    set: "Europe",
    icon: "plane",
    unit: "matches abroad",
    countdownUnit: "matches",
    rule: "European matches abroad that you've attended.",
  },
];
