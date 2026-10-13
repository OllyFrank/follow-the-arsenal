import type { OldAndNewBadge } from "../../lib/badges";
import { formatDateShort, matchScoreLine } from "../../lib/format";
import { EmiratesArt, HighburyArt } from "./GroundArt";

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function SwapIcon() {
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
      <path d="M4 7h11M11 3l4 4-4 4" />
      <path d="M20 17H9M13 13l-4 4 4 4" />
    </svg>
  );
}

export function OldAndNewCard({
  badge,
  onOpenDetail,
}: {
  badge: OldAndNewBadge;
  onOpenDetail: () => void;
}) {
  if (!badge.unlocked) {
    return (
      <button
        type="button"
        className="badge-card-empty badge-space double-width"
        onClick={onOpenDetail}
        aria-label="Old & New: see the two matches needed"
      >
        <div className="badge-space-head">
          <div className="badge-space-icon">
            <SwapIcon />
          </div>
          <div className="badge-space-titles">
            <div className="badge-space-title">Old &amp; New</div>
            <div className="badge-space-subtitle">Space for a badge</div>
          </div>
        </div>
        <p className="badge-space-desc">
          Attended both the last match at Highbury and the first competitive match at the Emirates.
        </p>
        <ul className="old-and-new-checklist">
          {badge.matches.map((m) => (
            <li key={m.label} className={m.attended ? "checked" : undefined}>
              <span className="old-and-new-check" aria-hidden="true">
                {m.attended ? "✓" : ""}
              </span>
              <span>
                {m.label}
                {m.fixture && <span className="old-and-new-check-detail"> — {matchScoreLine(m.fixture)}</span>}
              </span>
            </li>
          ))}
        </ul>
      </button>
    );
  }

  const first = badge.matches[0];
  const second = badge.matches[1];

  return (
    <button
      type="button"
      className="badge-card badge-complete-set double-width"
      onClick={onOpenDetail}
      aria-label={`Old & New, complete set, collected ${badge.earningMatch ? formatDateShort(badge.earningMatch.date) : ""}`}
    >
      <div className="badge-card-inner">
        <div className="badge-card-toprow">
          <span className="badge-chip badge-complete-chip">Complete set</span>
          <span className="badge-set">Grounds</span>
        </div>
        <div className="badge-complete-title">Old &amp; New</div>
        <div className="old-and-new-halves">
          <div className="old-and-new-half">
            <div className="old-and-new-art">
              <HighburyArt />
            </div>
            <div className="badge-reached-label">Last at Highbury</div>
            {first.fixture && (
              <>
                <div className="old-and-new-match">{matchScoreLine(first.fixture)}</div>
                <div className="old-and-new-date">{formatDateShort(first.fixture.date)}</div>
              </>
            )}
          </div>
          <div className="old-and-new-arrow">
            <ArrowIcon />
          </div>
          <div className="old-and-new-half">
            <div className="old-and-new-art">
              <EmiratesArt />
            </div>
            <div className="badge-reached-label">First at the Emirates</div>
            {second.fixture && (
              <>
                <div className="old-and-new-match">{matchScoreLine(second.fixture)}</div>
                <div className="old-and-new-date">{formatDateShort(second.fixture.date)}</div>
              </>
            )}
          </div>
        </div>
        <div className="badge-complete-footer">
          Collected {badge.earningMatch ? formatDateShort(badge.earningMatch.date) : ""}
        </div>
      </div>
    </button>
  );
}
