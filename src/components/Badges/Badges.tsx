import { useMemo } from "react";
import type { Fixture, Ground } from "../../types";
import { computeBadges, countEarnedBadges } from "../../lib/badges";
import { BadgeCard } from "./BadgeCard";
import { PremierLeagueCard, OldAndNewCard } from "./SingleBadges";
import { SeasonSweepSection } from "./SeasonSweepSection";
import { UnlockGridSection } from "./UnlockGridSection";
import { WitnessToHistorySection } from "./WitnessToHistorySection";

interface Props {
  fixtures: Fixture[];
  grounds: Ground[];
  attendedMatchIds: Set<string>;
}

export function Badges({ fixtures, grounds, attendedMatchIds }: Props) {
  const groundCountryById = useMemo(() => new Map(grounds.map((g) => [g.groundId, g.country])), [grounds]);

  const badges = useMemo(
    () => computeBadges(fixtures, groundCountryById, attendedMatchIds),
    [fixtures, groundCountryById, attendedMatchIds],
  );

  const earnedCount = countEarnedBadges(badges);

  return (
    <div>
      <div className="stats-title-row">
        <h1 className="page-heading">Badges</h1>
        <div className="badges-earned-chip">
          <span className="badges-earned-value">{earnedCount}</span>
          <span className="badges-earned-label">badge{earnedCount === 1 ? "" : "s"}</span>
        </div>
      </div>

      <section className="badges-section">
        <h2 className="page-subheading">Attendance</h2>
        <div className="badges-grid">
          <BadgeCard
            id="loyalSupporter"
            name="Loyal Supporter"
            unitLabel="matches"
            rule="Matches attended, including the voided one."
            progress={badges.attendance.loyalSupporter}
          />
          <BadgeCard
            id="goalsGalore"
            name="Goals Galore"
            unitLabel="goals"
            rule="Arsenal goals seen in attended matches that count in the record. Shoot-out goals don't count."
            progress={badges.attendance.goalsGalore}
          />
          <BadgeCard
            id="longevity"
            name="Longevity"
            unitLabel="seasons"
            rule="Seasons with at least one match attended."
            progress={badges.attendance.longevity}
          />
          <BadgeCard
            id="homeComforts"
            name="Home Comforts"
            unitLabel="seasons"
            rule="Seasons where you attended every attendable home league game (Premier League or League Division One)."
            progress={badges.attendance.homeComforts}
          />
          <BadgeCard
            id="awayTraveller"
            name="Away Traveller"
            unitLabel="seasons"
            rule="Seasons with 10 or more away games attended, in any competition (neutral venues don't count)."
            progress={badges.attendance.awayTraveller}
          />
          <SeasonSweepSection sweeps={badges.attendance.seasonSweep} />
        </div>
      </section>

      <section className="badges-section">
        <h2 className="page-subheading">Grounds</h2>
        <div className="badges-grid">
          <BadgeCard
            id="groundHopper"
            name="Ground Hopper"
            unitLabel="grounds"
            rule="Distinct grounds visited."
            progress={badges.grounds.groundHopper}
          />
          <PremierLeagueCard badge={badges.grounds.premierLeague} />
          <BadgeCard
            id="ghostGrounds"
            name="Ghost Grounds"
            unitLabel="ghost grounds"
            rule="Grounds no longer used by their club, mostly demolished."
            progress={badges.grounds.ghostGrounds}
          />
          <OldAndNewCard badge={badges.grounds.oldAndNew} />
        </div>
      </section>

      <section className="badges-section">
        <h2 className="page-subheading">Europe &amp; Countries</h2>
        <div className="badges-grid">
          <BadgeCard
            id="europeanTours"
            name="European Tours"
            unitLabel="matches"
            rule="European matches played abroad, attended."
            progress={badges.europe.europeanTours}
          />
          <UnlockGridSection
            id="passportStamps"
            name="Passport Stamps"
            rule="One stamp per country where you've attended a European match abroad."
            items={badges.europe.passportStamps}
            labelFor={(item) => item.country}
            variant="passport"
          />
          <UnlockGridSection
            id="cathedralsOfFootball"
            name="Cathedrals of Football"
            rule="One badge per legendary stadium visited, in any competition."
            items={badges.europe.cathedralsOfFootball}
            labelFor={(item) => item.ground}
            variant="cathedral"
          />
        </div>
      </section>

      <section className="badges-section">
        <h2 className="page-subheading">Witness to History</h2>
        <WitnessToHistorySection entries={badges.witnessToHistory} />
      </section>
    </div>
  );
}
