import type { SeasonSweepResult } from "../../lib/badges";
import { matchScoreLine, formatDateShort } from "../../lib/format";
import { BadgeNameText } from "./BadgeNameText";

function SweptPennant() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 64" width="96" height="52">
      <path d="M12 6V60" stroke="#f6dc8e" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 8H110L14 52Z" fill="#ffffff" stroke="#f6dc8e" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 8H110" stroke="#063672" strokeWidth="5" />
      <text x="22" y="30" fontSize="13" fill="#db0007" fontFamily="'Archivo Black', 'Arial Black', Impact, sans-serif">
        SWEPT
      </text>
    </svg>
  );
}

export function SeasonSweepCard({ sweep, onOpenDetail }: { sweep: SeasonSweepResult; onOpenDetail: () => void }) {
  return (
    <button
      type="button"
      className="badge-card season-sweep-card"
      onClick={onOpenDetail}
      aria-label={`Ever Present, ${sweep.season}, completed at ${matchScoreLine(sweep.earningMatch)}`}
    >
      <div className="badge-card-inner season-sweep-inner">
        <div className="badge-card-toprow">
          <span className="badge-chip season-sweep-chip">Prestige</span>
          <span className="badge-set">Attendance</span>
        </div>
        <div className="season-sweep-pennant">
          <SweptPennant />
        </div>
        <div className="badge-name-block">
          <div className="badge-name">
            <BadgeNameText name="Ever Present" />
          </div>
          <div className="badge-milestone season-sweep-season">{sweep.season}</div>
          <div className="season-sweep-count">All {sweep.attendableCount} matches</div>
        </div>
        <div className="badge-reached-block season-sweep-reached">
          <div className="badge-reached-label">Completed at</div>
          <div className="badge-reached-match">{matchScoreLine(sweep.earningMatch)}</div>
          <div className="badge-reached-date">{formatDateShort(sweep.earningMatch.date)}</div>
        </div>
        <div className="badge-footer season-sweep-footer">One per season swept</div>
      </div>
    </button>
  );
}

export function SeasonSweepEmptySlot() {
  return (
    <div className="badge-card badge-tier-locked" aria-hidden="false">
      <div className="badge-card-inner">
        <div className="badge-card-toprow">
          <span className="badge-chip">Not yet</span>
          <span className="badge-set">Attendance</span>
        </div>
        <div className="badge-emblem-wrap">
          <div className="badge-emblem-ring">
            <div className="badge-emblem-disc">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h14M4 10h10M4 14h7" />
                <path d="M19 13l1.8 1.8L19 16.6M19 9.4l1.8 1.8-1.8 1.8" />
              </svg>
            </div>
          </div>
        </div>
        <div className="badge-name-block">
          <div className="badge-name">
            <BadgeNameText name="Ever Present" />
          </div>
        </div>
        <div className="badge-reached-block">
          <div className="badge-reached-label">Not yet earned</div>
          <div className="badge-reached-match">Attend every match of a season.</div>
        </div>
      </div>
    </div>
  );
}
