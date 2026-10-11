import { useMemo } from "react";
import type { Fixture, Ground } from "../../types";
import { computeBadges, countEarnedBadges, countEarnedBySection } from "../../lib/badges";
import { TIERED_BADGES } from "../../lib/badgeCardConfig";
import { useLogbookPage } from "../../hooks/useLogbookPage";
import { BadgeCard } from "./BadgeCard";
import { LogbookJumpLinks, LogbookTabs } from "./LogbookNav";
import { LogbookPage } from "./LogbookPage";

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

  const total = countEarnedBadges(badges);
  const bySection = countEarnedBySection(badges);
  const activePage = useLogbookPage();

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

  const cardFor = (id: keyof typeof progressFor) => {
    const config = TIERED_BADGES.find((c) => c.id === id)!;
    return <BadgeCard key={id} config={config} progress={progressFor[id]} onOpenDetail={() => {}} />;
  };

  const counts = {
    att: bySection.attendance,
    grd: bySection.grounds,
    eur: bySection.europe,
    his: bySection.history,
  };

  return (
    <div>
      <div className="badges-header">
        <div className="badges-header-titles">
          <div className="badges-eyebrow">Your logbook</div>
          <h1 className="badges-h1">Badges</h1>
        </div>
        <div className="badges-header-right">
          <div className="badges-collected">
            <div className="badges-collected-value">{total}</div>
            <div className="badges-collected-label">collected</div>
          </div>
          <LogbookJumpLinks counts={counts} />
        </div>
      </div>

      <LogbookTabs activePage={activePage} counts={counts} />

      <div className="badges-pages">
        <LogbookPage
          id="att"
          pageNumber={1}
          heading="Attendance"
          description="Your milestone in each set, the match you reached it at, and how many to go until the next one."
          count={bySection.attendance}
          active={activePage === "att"}
        >
          <div className="badge-grid">
            {cardFor("loyalSupporter")}
            {cardFor("goalsGalore")}
            {cardFor("longevity")}
            {cardFor("homeComforts")}
            {cardFor("awayTraveller")}
          </div>
        </LogbookPage>

        <LogbookPage
          id="grd"
          pageNumber={2}
          heading="Grounds"
          description="Every ground you've stood in. The Premier League and Old & New only go in the book once the set is complete."
          count={bySection.grounds}
          active={activePage === "grd"}
        >
          <div className="badge-grid">
            {cardFor("groundHopper")}
            {cardFor("ghostGrounds")}
          </div>
        </LogbookPage>

        <LogbookPage
          id="eur"
          pageNumber={3}
          heading="Europe & countries"
          description="Away days abroad: a stamp for every country, a card for every great ground."
          count={bySection.europe}
          active={activePage === "eur"}
        >
          <div className="badge-grid">{cardFor("europeanTours")}</div>
        </LogbookPage>

        <LogbookPage
          id="his"
          pageNumber={4}
          heading="Witness to history"
          description="The greatest Arsenal matches you were there for, with a ticket stub for each."
          count={bySection.history}
          active={activePage === "his"}
        >
          <div className="badge-grid" />
        </LogbookPage>
      </div>
    </div>
  );
}
