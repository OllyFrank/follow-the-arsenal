import type { AttendedWitnessEntry } from "../../lib/badgeDisplay";
import type { GreatestMatchTier } from "../../lib/badges";
import { formatDateShort, googleSearchUrl } from "../../lib/format";

const TIER_LABEL: Record<GreatestMatchTier, string> = { gold: "Gold", silver: "Silver", bronze: "Bronze" };

function MedalIcon({ tier }: { tier: GreatestMatchTier }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" width="34" height="34">
      <path d="M10 2h5l3 9h-5zM22 2h-5l-3 9h5z" fill="#ffffff" opacity="0.85" />
      <circle cx="16" cy="20" r="10" className={`witness-medal-metal witness-medal-metal-${tier}`} stroke="#ffffff" strokeWidth="1.5" />
      <path
        d="M16 14.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z"
        className={`witness-medal-star witness-medal-star-${tier}`}
      />
    </svg>
  );
}

export function WitnessTicket({ entry }: { entry: AttendedWitnessEntry }) {
  const { greatestMatch, fixture } = entry;
  return (
    <a
      className={`witness-ticket witness-ticket-${greatestMatch.tier}`}
      href={googleSearchUrl(fixture)}
      target="_blank"
      rel="noreferrer"
    >
      <div className={`witness-ticket-shine witness-ticket-shine-${greatestMatch.tier}`} />
      <div className={`witness-ticket-stub witness-ticket-stub-${greatestMatch.tier}`}>
        <MedalIcon tier={greatestMatch.tier} />
        <div className="witness-ticket-tier-label">{TIER_LABEL[greatestMatch.tier]}</div>
      </div>
      <div className="witness-ticket-body">
        <div className="witness-ticket-meta">
          {formatDateShort(greatestMatch.date)} &middot; {fixture.competition}
        </div>
        <div className="witness-ticket-match">{greatestMatch.match}</div>
        <div className="witness-ticket-why">{greatestMatch.why}</div>
        <div className="witness-ticket-venue">{fixture.venue}</div>
      </div>
    </a>
  );
}
