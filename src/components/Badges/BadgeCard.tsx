import type { TieredBadgeConfig } from "../../lib/badgeCardConfig";
import type { BadgeProgress } from "../../lib/badgeEngine";
import { tierColor } from "../../lib/badgeTierColor";
import { formatDateShort, matchScoreLine } from "../../lib/format";
import { BadgeIcon } from "./BadgeIcons";

interface Props {
  config: TieredBadgeConfig;
  progress: BadgeProgress;
  onOpenDetail: () => void;
}

function singularize(unit: string): string {
  return unit.endsWith("s") ? unit.slice(0, -1) : unit;
}

export function BadgeCard({ config, progress, onOpenDetail }: Props) {
  const { name, set, icon, unit, countdownUnit, rule } = config;
  const material = tierColor(progress.tierIndex, progress.legendary);
  const locked = progress.locked;
  const milestone = String(progress.current);
  const toGo = progress.nextThreshold === null ? null : progress.nextThreshold - progress.current;

  const accessibleName = locked
    ? `${name}, not yet earned, ${toGo} ${toGo === 1 ? singularize(countdownUnit) : countdownUnit} to the first badge`
    : `${name}, ${progress.tierLabel}, ${milestone} ${unit}${
        toGo === null ? "" : `, ${toGo} to the next badge`
      }`;

  return (
    <button
      type="button"
      className={`badge-card badge-tier-${material}`}
      onClick={onOpenDetail}
      aria-label={accessibleName}
    >
      <div className="badge-card-inner">
        <div className="badge-card-toprow">
          <span className="badge-chip">{locked ? "Not yet" : progress.tierLabel}</span>
          <span className="badge-set">{set}</span>
        </div>
        <div className="badge-emblem-wrap">
          <div className="badge-emblem-ring">
            <div className="badge-emblem-disc">
              <BadgeIcon icon={icon} />
            </div>
          </div>
        </div>
        <div className="badge-name-block">
          <div className="badge-name">{name}</div>
          <div className={`badge-milestone${milestone.length > 6 ? " badge-milestone-long" : ""}`}>
            {milestone}
          </div>
          <div className="badge-unit">{unit}</div>
        </div>
        <div className="badge-reached-block">
          {locked ? (
            <>
              <div className="badge-reached-label">Not yet earned</div>
              <div className="badge-reached-match">{rule}</div>
            </>
          ) : (
            progress.earningMatch && (
              <>
                <div className="badge-reached-label">Reached at</div>
                <div className="badge-reached-match">{matchScoreLine(progress.earningMatch)}</div>
                <div className="badge-reached-date">{formatDateShort(progress.earningMatch.date)}</div>
              </>
            )
          )}
        </div>
        <div className="badge-footer">
          {toGo === null ? (
            <div className="badge-footer-top">Top of the ladder</div>
          ) : (
            <>
              <div className="badge-footer-number">{toGo}</div>
              <div className="badge-footer-text">
                <div>{toGo === 1 ? singularize(countdownUnit) : countdownUnit} to go</div>
                <div className="badge-footer-next">Next: {progress.nextLabel}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
