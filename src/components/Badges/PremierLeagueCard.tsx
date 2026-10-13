import type { PremierLeagueBadge } from "../../lib/badges";
import { formatDateShort, matchScoreLine } from "../../lib/format";

function PinIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

export function PremierLeagueCard({
  badge,
  season,
  onOpenDetail,
}: {
  badge: PremierLeagueBadge;
  season: string;
  onOpenDetail: () => void;
}) {
  if (!badge.unlocked) {
    const toGo = badge.totalCount - badge.visitedCount;
    const pct = (badge.visitedCount / badge.totalCount) * 100;
    return (
      <button
        type="button"
        className="badge-card-empty badge-space double-width"
        onClick={onOpenDetail}
        aria-label={`The Premier League: ${badge.visitedCount} of ${badge.totalCount} grounds, ${toGo} to go`}
      >
        <div className="badge-space-head">
          <div className="badge-space-icon">
            <PinIcon />
          </div>
          <div className="badge-space-titles">
            <div className="badge-space-title">The Premier League</div>
            <div className="badge-space-subtitle">Space for a badge</div>
          </div>
        </div>
        <p className="badge-space-desc">
          Visit the home ground of every club in the {season} Premier League to collect it.
        </p>
        <div className="premier-league-progress">
          <div className="premier-league-progress-head">
            <div className="premier-league-progress-count">
              {badge.visitedCount} of {badge.totalCount} grounds
            </div>
            <div className="premier-league-progress-togo">{toGo} to go</div>
          </div>
          <div className="premier-league-progress-track">
            <div className="premier-league-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="premier-league-pills">
          {badge.missingClubs.map((club) => (
            <span key={club.club} className="premier-league-pill">
              {club.club}
            </span>
          ))}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="badge-card badge-complete-set double-width"
      onClick={onOpenDetail}
      aria-label={`The Premier League, complete set, collected ${badge.earningMatch ? formatDateShort(badge.earningMatch.date) : ""}`}
    >
      <div className="badge-card-inner">
        <div className="badge-card-toprow">
          <span className="badge-chip badge-complete-chip">Complete set</span>
          <span className="badge-set">Grounds</span>
        </div>
        <div className="badge-complete-title">The Premier League</div>
        <div className="premier-league-season">{season}</div>
        {badge.earningMatch && (
          <div className="badge-reached-block premier-league-reached">
            <div className="badge-reached-label">Collected at</div>
            <div className="badge-reached-match">{matchScoreLine(badge.earningMatch)}</div>
            <div className="badge-reached-date">{formatDateShort(badge.earningMatch.date)}</div>
          </div>
        )}
        <div className="badge-complete-footer">
          Collected {badge.earningMatch ? formatDateShort(badge.earningMatch.date) : ""}
        </div>
      </div>
    </button>
  );
}
