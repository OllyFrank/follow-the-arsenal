import { useMemo } from "react";
import type { Fixture, Ground } from "../../types";
import { computeBadges } from "../../lib/badges";
import { TIERED_BADGES } from "../../lib/badgeCardConfig";
import { BadgeCard } from "./BadgeCard";

interface Props {
  fixtures: Fixture[];
  grounds: Ground[];
  attendedMatchIds: Set<string>;
}

// Placeholder shell while the logbook page/tab layout (design-handoff/
// BADGES.md) is being built out task by task. Renders every tiered card so
// each stage of the rebuild can be checked in the browser as it lands.
export function Badges({ fixtures, grounds, attendedMatchIds }: Props) {
  const groundCountryById = useMemo(() => new Map(grounds.map((g) => [g.groundId, g.country])), [grounds]);

  const badges = useMemo(
    () => computeBadges(fixtures, groundCountryById, attendedMatchIds),
    [fixtures, groundCountryById, attendedMatchIds],
  );

  const progressFor = {
    loyalSupporter: badges.attendance.loyalSupporter,
    goalsGalore: badges.attendance.goalsGalore,
    longevity: badges.attendance.longevity,
    homeComforts: badges.attendance.homeComforts,
    awayTraveller: badges.attendance.awayTraveller,
    groundHopper: badges.grounds.groundHopper,
    ghostGrounds: badges.grounds.ghostGrounds,
    europeanTours: badges.europe.europeanTours,
  };

  return (
    <div>
      <h1 className="page-heading">Badges</h1>
      <div className="badge-grid">
        {TIERED_BADGES.map((config) => (
          <BadgeCard
            key={config.id}
            config={config}
            progress={progressFor[config.id]}
            onOpenDetail={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
