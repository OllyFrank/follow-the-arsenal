import { useState } from "react";
import type { BadgeProgress } from "../../lib/badgeEngine";
import type { BadgeId } from "../../lib/badges";
import { tierColor } from "../../lib/badgeTierColor";
import { fixtureLabel, formatDateLong, googleSearchUrl } from "../../lib/format";
import { BadgeIcon } from "./BadgeIcons";

interface Props {
  id: BadgeId;
  name: string;
  rule: string;
  unitLabel: string;
  progress: BadgeProgress;
}

export function BadgeCard({ id, name, rule, unitLabel, progress }: Props) {
  const [expanded, setExpanded] = useState(false);
  const color = tierColor(progress.tierIndex, progress.legendary);
  const pct =
    progress.nextThreshold === null
      ? 100
      : Math.min(100, (progress.current / progress.nextThreshold) * 100);

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
        <BadgeIcon id={id} />
        <div className="badge-card-info">
          <div className="badge-card-name">{name}</div>
          <div className="badge-card-status">{progress.locked ? "Locked" : progress.tierLabel}</div>
        </div>
      </div>

      {progress.earningMatch && (
        <a
          className="badge-card-earned"
          href={googleSearchUrl(progress.earningMatch)}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {fixtureLabel(progress.earningMatch)}
        </a>
      )}

      <div className="badge-progress-track">
        <div className="badge-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="badge-progress-label">
        {progress.nextThreshold !== null
          ? `${progress.current} of ${progress.nextThreshold} ${unitLabel}`
          : `${progress.current} ${unitLabel} — top tier reached`}
      </div>

      {expanded && (
        <div className="badge-detail" onClick={(e) => e.stopPropagation()}>
          <p className="badge-detail-rule">{rule}</p>
          <ul className="badge-detail-tiers">
            {progress.allTiers.map((tier) => {
              const reached = progress.tiersReached.find((t) => t.threshold === tier.threshold);
              return (
                <li
                  key={tier.threshold}
                  className={reached ? "badge-detail-tier-reached" : "badge-detail-tier-locked"}
                >
                  <span>{tier.label}</span>
                  {reached ? (
                    <span>{formatDateLong(reached.earningMatch.date)}</span>
                  ) : (
                    <span>Locked</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
