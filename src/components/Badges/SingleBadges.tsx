import { useState } from "react";
import type { OldAndNewBadge, PremierLeagueBadge } from "../../lib/badges";
import { tierColor } from "../../lib/badgeTierColor";
import { fixtureLabel, formatDateLong, googleSearchUrl } from "../../lib/format";
import { BadgeIcon } from "./BadgeIcons";

// Premier League and Old & New aren't tiered ladders — each is a single
// "visit everything in a fixed set" badge — so they get their own small
// card bodies instead of BadgeCard's tier-ladder progress bar.

export function PremierLeagueCard({ badge }: { badge: PremierLeagueBadge }) {
  const [expanded, setExpanded] = useState(false);
  const color = tierColor(badge.unlocked ? 0 : null, true);
  const pct = (badge.visitedCount / badge.totalCount) * 100;

  return (
    <div
      className={`badge-card badge-tier-${color}`}
      role="button"
      tabIndex={0}
      onClick={() => setExpanded((e) => !e)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setExpanded((v) => !v);
      }}
      aria-expanded={expanded}
    >
      <div className="badge-card-top">
        <BadgeIcon id="premierLeague" />
        <div className="badge-card-info">
          <div className="badge-card-name">The Premier League</div>
          <div className="badge-card-status">{badge.unlocked ? "Earned" : "Locked"}</div>
        </div>
      </div>

      {badge.earningMatch && (
        <a
          className="badge-card-earned"
          href={googleSearchUrl(badge.earningMatch)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {fixtureLabel(badge.earningMatch)}
        </a>
      )}

      <div className="badge-progress-track">
        <div className="badge-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="badge-progress-label">
        {badge.visitedCount} of {badge.totalCount} grounds
      </div>

      {expanded && (
        <div className="badge-detail" onClick={(e) => e.stopPropagation()}>
          <p className="badge-detail-rule">
            Has visited the current home ground of every club in this season's Premier League, at any
            point in their history.
          </p>
          <ul className="badge-detail-tiers">
            {badge.missingClubs.map((club) => (
              <li key={club.club} className="badge-detail-tier-locked">
                <span>{club.ground}</span>
                <span>{club.note ?? "Not visited yet"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function OldAndNewCard({ badge }: { badge: OldAndNewBadge }) {
  const [expanded, setExpanded] = useState(false);
  const color = tierColor(badge.unlocked ? 0 : null, true);
  const attendedCount = badge.matches.filter((m) => m.attended).length;

  return (
    <div
      className={`badge-card badge-tier-${color}`}
      role="button"
      tabIndex={0}
      onClick={() => setExpanded((e) => !e)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setExpanded((v) => !v);
      }}
      aria-expanded={expanded}
    >
      <div className="badge-card-top">
        <BadgeIcon id="oldAndNew" />
        <div className="badge-card-info">
          <div className="badge-card-name">Old &amp; New</div>
          <div className="badge-card-status">{badge.unlocked ? "Earned" : "Locked"}</div>
        </div>
      </div>

      {badge.earningMatch && (
        <a
          className="badge-card-earned"
          href={googleSearchUrl(badge.earningMatch)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {fixtureLabel(badge.earningMatch)}
        </a>
      )}

      <div className="badge-progress-track">
        <div className="badge-progress-fill" style={{ width: `${(attendedCount / 2) * 100}%` }} />
      </div>
      <div className="badge-progress-label">{attendedCount} of 2 matches</div>

      {expanded && (
        <div className="badge-detail" onClick={(e) => e.stopPropagation()}>
          <p className="badge-detail-rule">
            Attended both the last match at Highbury and the first competitive match at the Emirates.
          </p>
          <ul className="badge-detail-tiers">
            {badge.matches.map((m) => (
              <li
                key={m.label}
                className={m.attended ? "badge-detail-tier-reached" : "badge-detail-tier-locked"}
              >
                <span>{m.label}</span>
                <span>{m.attended && m.fixture ? formatDateLong(m.fixture.date) : "Locked"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
