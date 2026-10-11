import type { GreatestMatchTier, WitnessEntry } from "../../lib/badges";
import { formatDateLong, googleSearchUrl } from "../../lib/format";

const TIERS: GreatestMatchTier[] = ["gold", "silver", "bronze"];
const TIER_LABEL: Record<GreatestMatchTier, string> = { gold: "Gold", silver: "Silver", bronze: "Bronze" };

function summaryFor(entries: WitnessEntry[], tier: GreatestMatchTier): string {
  const inTier = entries.filter((e) => e.greatestMatch.tier === tier);
  const earned = inTier.filter((e) => e.unlocked).length;
  return `${TIER_LABEL[tier]} ${earned}/${inTier.length}`;
}

export function WitnessToHistorySection({ entries }: { entries: WitnessEntry[] }) {
  return (
    <section>
      <div className="witness-summary">{TIERS.map((t) => summaryFor(entries, t)).join(" · ")}</div>
      <div className="witness-grid">
        {entries.map((entry) => {
          const { greatestMatch, fixture, unlocked } = entry;
          const content = (
            <>
              <div className={`witness-ticket-tier witness-ticket-tier-${greatestMatch.tier}`}>
                {TIER_LABEL[greatestMatch.tier]}
              </div>
              <div className="witness-ticket-match">{greatestMatch.match}</div>
              <div className="witness-ticket-date">{formatDateLong(greatestMatch.date)}</div>
              <div className="witness-ticket-why">{greatestMatch.why}</div>
            </>
          );
          const tierClass = `witness-ticket-${greatestMatch.tier}`;
          return unlocked && fixture ? (
            <a
              key={greatestMatch.matchId}
              className={`witness-ticket witness-ticket-earned ${tierClass}`}
              href={googleSearchUrl(fixture)}
              target="_blank"
              rel="noreferrer"
            >
              {content}
            </a>
          ) : (
            <div key={greatestMatch.matchId} className={`witness-ticket witness-ticket-locked ${tierClass}`}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
