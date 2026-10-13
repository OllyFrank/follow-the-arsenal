import type { AttendedWitnessEntry } from "../../lib/badgeDisplay";
import type { GreatestMatchTier } from "../../lib/badges";

const TIERS: GreatestMatchTier[] = ["gold", "silver", "bronze"];

export function WitnessSummary({ entries }: { entries: AttendedWitnessEntry[] }) {
  return (
    <div className="witness-summary">
      {TIERS.map((tier) => {
        const count = entries.filter((e) => e.greatestMatch.tier === tier).length;
        return (
          <div key={tier} className={`witness-summary-chip witness-summary-chip-${tier}`}>
            <span className={`witness-summary-disc witness-summary-disc-${tier}`} />
            <span>
              {count} {tier}
            </span>
          </div>
        );
      })}
    </div>
  );
}
