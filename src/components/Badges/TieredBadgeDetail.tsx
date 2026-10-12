import type { TieredBadgeConfig } from "../../lib/badgeCardConfig";
import type { BadgeProgress } from "../../lib/badgeEngine";
import { tierColor, type TierColor } from "../../lib/badgeTierColor";
import { formatDateShort, matchScoreLine, singularize } from "../../lib/format";
import { BadgeCard } from "./BadgeCard";
import { BadgeIcon } from "./BadgeIcons";

const MATERIAL_LABEL: Record<TierColor, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  ruby: "Ruby",
  onyx: "Onyx",
  diamond: "Diamond",
  legendary: "Legendary",
  locked: "Not yet",
};

interface DetailRow {
  threshold: string;
  materialLabel: string;
  material: TierColor;
  reached: boolean;
  isCurrent: boolean;
  line1: string;
  line2: string;
}

function buildRows(config: TieredBadgeConfig, progress: BadgeProgress): DetailRow[] {
  return progress.allTiers.map((tier, index) => {
    const reachedEntry = progress.tiersReached.find((t) => t.threshold === tier.threshold);
    const material = tierColor(index, !!tier.legendary);
    const isLast = index === progress.allTiers.length - 1;
    let line1: string;
    let line2: string;
    if (reachedEntry) {
      line1 = matchScoreLine(reachedEntry.earningMatch);
      line2 = formatDateShort(reachedEntry.earningMatch.date);
    } else {
      const toGo = tier.threshold - progress.current;
      const unit = toGo === 1 ? singularize(config.countdownUnit) : config.countdownUnit;
      line1 = `${toGo} ${unit} to go`;
      line2 =
        progress.nextThreshold === tier.threshold
          ? "Your next badge"
          : isLast
            ? "Top of the ladder"
            : "Not reached yet";
    }
    return {
      threshold: tier.label,
      materialLabel: MATERIAL_LABEL[material],
      material,
      reached: !!reachedEntry,
      isCurrent: progress.tierIndex === index,
      line1,
      line2,
    };
  });
}

export function TieredBadgeDetail({ config, progress }: { config: TieredBadgeConfig; progress: BadgeProgress }) {
  const material = tierColor(progress.tierIndex, progress.legendary);
  const rows = buildRows(config, progress);
  const toGo = progress.nextThreshold === null ? null : progress.nextThreshold - progress.current;
  const nextTierIndex = (progress.tierIndex ?? -1) + 1;
  const nextTier = progress.allTiers[nextTierIndex];
  const nextMaterial = nextTier ? MATERIAL_LABEL[tierColor(nextTierIndex, !!nextTier.legendary)] : "";
  const currentTierThreshold = progress.tierIndex === null ? 0 : progress.allTiers[progress.tierIndex].threshold;

  return (
    <>
      <div className="badge-detail-left">
        <BadgeCard config={config} progress={progress} onOpenDetail={() => {}} interactive={false} />
        <div className="badge-detail-rule">{config.rule}</div>
      </div>
      <div className="badge-detail-right">
        <div className="badge-detail-header">
          <div className={`badge-detail-emblem badge-tier-${material}`}>
            <div className="badge-detail-emblem-disc">
              <BadgeIcon icon={config.icon} />
            </div>
          </div>
          <div className="badge-detail-titles">
            <div className="badge-detail-eyebrow">
              {config.set} &middot; {progress.locked ? "Not yet" : progress.tierLabel}
            </div>
            <h2 id="badge-detail-title" className="badge-detail-name">
              {config.name}
            </h2>
            <div className="badge-detail-count">
              {progress.current} {config.unit}
            </div>
          </div>
        </div>

        <div className="badge-detail-rule badge-detail-rule-mobile">{config.rule}</div>

        {toGo === null ? (
          <div className="badge-detail-banner badge-detail-banner-top">
            <div className="badge-detail-banner-top-text">Top of the ladder &mdash; {progress.tierLabel} reached.</div>
          </div>
        ) : (
          <div className="badge-detail-banner">
            <div className="badge-detail-banner-row">
              <div className="badge-detail-banner-number">{toGo}</div>
              <div className="badge-detail-banner-text">
                {toGo === 1 ? singularize(config.countdownUnit) : config.countdownUnit} until your{" "}
                <strong>{progress.nextLabel}</strong> badge ({nextMaterial})
              </div>
            </div>
            <div className="badge-detail-banner-track">
              <div
                className="badge-detail-banner-fill"
                style={{
                  // Non-null: this branch only renders when toGo !== null, i.e. nextThreshold is set.
                  width: `${((progress.current - currentTierThreshold) / (progress.nextThreshold! - currentTierThreshold)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="badge-detail-tiers-label">Every tier</div>
        <ol className="badge-detail-tiers">
          {rows.map((row) => (
            <li key={row.threshold} className="badge-detail-tier-row">
              <div
                className={`badge-detail-medal badge-tier-${row.material}${row.reached ? "" : " badge-detail-medal-unreached"}`}
              />
              <div className="badge-detail-tier-threshold">
                <div className={`badge-detail-tier-number${row.reached ? "" : " badge-detail-tier-number-unreached"}`}>
                  {row.threshold}
                </div>
                <div className="badge-detail-tier-material">{row.materialLabel}</div>
              </div>
              <div className="badge-detail-tier-lines">
                <div className={`badge-detail-tier-line1${row.reached ? " badge-detail-tier-line1-reached" : ""}`}>
                  {row.line1}
                </div>
                <div className="badge-detail-tier-line2">{row.line2}</div>
              </div>
              {row.isCurrent && <div className="badge-detail-your-badge">Your badge</div>}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
