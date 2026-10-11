// Simple, consistent stroke icons for the Badges tab — same style as
// shared/NavIcons.tsx (24x24, 2px stroke, round caps), just a bigger,
// dedicated set so each badge reads at a glance. No club crests or kit
// designs, per CLAUDE.md.
import type { BadgeId } from "../../lib/badges";

const commonProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  className: "badge-icon-svg",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function LoyalSupporterIcon() {
  return (
    <svg {...commonProps}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function GoalsGaloreIcon() {
  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7l3.5 2.5-1.3 4.1H9.8L8.5 9.5 12 7z" />
    </svg>
  );
}

function LongevityIcon() {
  return (
    <svg {...commonProps}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

function HomeComfortsIcon() {
  return (
    <svg {...commonProps}>
      <path d="M4 11l8-7 8 7M6 10v10h12V10" />
    </svg>
  );
}

function AwayTravellerIcon() {
  return (
    <svg {...commonProps}>
      <path d="M3 16l18-6-7 7 1-4-4-1z" />
      <path d="M11 17l-2 4" />
    </svg>
  );
}

function SeasonSweepIcon() {
  return (
    <svg {...commonProps}>
      <path d="M5 4v16M5 4l13 2.5L5 10" />
      <circle cx="18" cy="19" r="2" />
    </svg>
  );
}

function GroundHopperIcon() {
  return (
    <svg {...commonProps}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <path d="M9 9.5h6M9.5 7l1 5M14.5 7l-1 5" />
    </svg>
  );
}

function PremierLeagueIcon() {
  return (
    <svg {...commonProps}>
      <path d="M4 7l3 2 5-5 5 5 3-2-1.5 10h-13L4 7z" />
      <path d="M8 20h8" />
    </svg>
  );
}

function GhostGroundsIcon() {
  return (
    <svg {...commonProps}>
      <path d="M6 20V11a6 6 0 0 1 12 0v9l-2.5-2-2 2-1.5-1.5-1.5 1.5-2-2L6 20z" />
      <circle cx="10" cy="10" r=".8" fill="currentColor" stroke="none" />
      <circle cx="14" cy="10" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function OldAndNewIcon() {
  return (
    <svg {...commonProps}>
      <path d="M4 7h9M9 3l4 4-4 4" />
      <path d="M20 17H11M15 13l-4 4 4 4" />
    </svg>
  );
}

function EuropeanToursIcon() {
  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function PassportStampsIcon() {
  return (
    <svg {...commonProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M8 17h8" />
    </svg>
  );
}

function CathedralsIcon() {
  return (
    <svg {...commonProps}>
      <path d="M4 21V9l8-6 8 6v12" />
      <path d="M4 21h16M9 21v-6h6v6" />
    </svg>
  );
}

function WitnessToHistoryIcon() {
  return (
    <svg {...commonProps}>
      <path d="M12 2l2.6 6.6L21 9.3l-5 4.7 1.3 7-5.3-3.6L6.7 21 8 14 3 9.3l6.4-.7L12 2z" />
    </svg>
  );
}

const ICONS: Record<BadgeId, () => React.JSX.Element> = {
  loyalSupporter: LoyalSupporterIcon,
  goalsGalore: GoalsGaloreIcon,
  longevity: LongevityIcon,
  homeComforts: HomeComfortsIcon,
  awayTraveller: AwayTravellerIcon,
  seasonSweep: SeasonSweepIcon,
  groundHopper: GroundHopperIcon,
  premierLeague: PremierLeagueIcon,
  ghostGrounds: GhostGroundsIcon,
  oldAndNew: OldAndNewIcon,
  europeanTours: EuropeanToursIcon,
  passportStamps: PassportStampsIcon,
  cathedralsOfFootball: CathedralsIcon,
  witnessToHistory: WitnessToHistoryIcon,
};

export function BadgeIcon({ id }: { id: BadgeId }) {
  const Icon = ICONS[id];
  return (
    <span className="badge-icon">
      <Icon />
    </span>
  );
}
