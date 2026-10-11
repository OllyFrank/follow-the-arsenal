import type { SeasonSweepResult } from "../../lib/badges";
import { fixtureLabel, googleSearchUrl } from "../../lib/format";
import { BadgeIcon } from "./BadgeIcons";

// The prestige badge: one card per swept season, not a tier ladder, so it
// gets its own small section rather than a single BadgeCard.
export function SeasonSweepSection({ sweeps }: { sweeps: SeasonSweepResult[] }) {
  return (
    <div className="badge-card badge-tier-legendary season-sweep-card">
      <div className="badge-card-top">
        <BadgeIcon id="seasonSweep" />
        <div className="badge-card-info">
          <div className="badge-card-name">Season Sweep</div>
          <div className="badge-card-status">
            {sweeps.length === 0 ? "Locked" : `${sweeps.length} swept`}
          </div>
        </div>
      </div>
      <p className="badge-detail-rule">
        Every attendable match in a season, attended. The prestige badge — one per season completed.
      </p>
      {sweeps.length === 0 ? (
        <div className="empty-state">No seasons swept yet.</div>
      ) : (
        <ul className="season-sweep-list">
          {sweeps.map((s) => (
            <li key={s.season}>
              <span className="season-sweep-season">Season Sweep {s.season}</span>
              <a
                className="season-sweep-link"
                href={googleSearchUrl(s.earningMatch)}
                target="_blank"
                rel="noreferrer"
              >
                {fixtureLabel(s.earningMatch)}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
