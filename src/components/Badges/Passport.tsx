import { useState } from "react";
import type { Fixture } from "../../types";
import type { UnlockItem } from "../../lib/badgeEngine";
import { collectedInOrder, stampStyle } from "../../lib/badgeDisplay";
import { formatDateShort } from "../../lib/format";

const STAMPS_PER_PAGE = 12;

function PassportGlobe() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" width="66" height="66" fill="none" stroke="#e9c877" strokeWidth={2}>
      <circle cx="32" cy="32" r="22" />
      <ellipse cx="32" cy="32" rx="9" ry="22" />
      <path d="M10 32H54M14 21H50M14 43H50" />
      <ellipse cx="32" cy="32" rx="30" ry="9" transform="rotate(-24 32 32)" strokeDasharray="1 5" strokeLinecap="round" />
    </svg>
  );
}

export function PassportCover({ countryCount }: { countryCount: number }) {
  return (
    <div className="passport-cover">
      <div className="passport-cover-title">
        Gooners&apos;
        <br />
        passport
      </div>
      <PassportGlobe />
      <div className="passport-cover-tagline">Over land and sea</div>
      <div className="passport-cover-count">
        <div className="passport-cover-count-value">{countryCount}</div>
        <div className="passport-cover-count-label">
          {countryCount === 1 ? "country" : "countries"} stamped
        </div>
      </div>
    </div>
  );
}

interface PassportStampsProps {
  countries: UnlockItem<{ country: string }>[];
  onOpenDetail: (country: string, earningMatch: Fixture) => void;
}

export function PassportStamps({ countries, onOpenDetail }: PassportStampsProps) {
  const stamps = collectedInOrder(countries);
  const pageCount = Math.max(1, Math.ceil(stamps.length / STAMPS_PER_PAGE));
  const [page, setPage] = useState(() => pageCount - 1); // opens on the last page

  if (stamps.length === 0) {
    return (
      <div className="passport-page">
        <div className="passport-page-head">
          <div>Visas &middot; Entries</div>
        </div>
        <div className="empty-state">No stamps yet. Your first European away day abroad gets you one.</div>
      </div>
    );
  }

  return (
    <div className="passport-page">
      <div className="passport-page-head">
        <div>Visas &middot; Entries</div>
        {pageCount > 1 && (
          <div className="passport-desktop-only">
            Page {page + 1} of {pageCount}
          </div>
        )}
      </div>
      <div className="passport-stamp-grid">
        {stamps.map((stamp) => {
          const style = stampStyle(stamp.position, stamp.item.country);
          const stampPage = Math.floor((stamp.position - 1) / STAMPS_PER_PAGE);
          return (
            <button
              type="button"
              key={stamp.item.country}
              data-page={stampPage}
              className={`passport-stamp passport-stamp-${style.shape}${stampPage === page ? " passport-stamp-current" : ""}`}
              style={{
                borderColor: style.ink,
                color: style.ink,
                transform: `rotate(${style.angleDeg}deg)`,
              }}
              onClick={() => onOpenDetail(stamp.item.country, stamp.earningMatch)}
            >
              <div className="passport-stamp-country">{stamp.item.country}</div>
              <div className="passport-stamp-date">{formatDateShort(stamp.earningMatch.date).toUpperCase()}</div>
              <div className="passport-stamp-opp">v {stamp.earningMatch.opponent}</div>
            </button>
          );
        })}
      </div>
      {pageCount > 1 && (
        <div className="passport-page-controls passport-desktop-only">
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
            Previous
          </button>
          <div className="passport-page-dots">
            {Array.from({ length: pageCount }).map((_, i) => (
              <span key={i} className={i === page ? "passport-page-dot-active" : undefined} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
