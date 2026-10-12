import type { Fixture } from "../../types";
import type { CathedralReference } from "../../lib/badgeReference";
import { formatDateShort, matchScoreLine } from "../../lib/format";
import { EmptyStadiumIcon, StadiumArt } from "./StadiumArt";
import { STADIUM_ART_BY_GROUND } from "../../lib/badgeCardConfig";

interface Props {
  item: CathedralReference;
  country: string;
  earningMatch: Fixture | null;
  onOpenDetail: () => void;
}

export function StadiumCard({ item, country, earningMatch, onOpenDetail }: Props) {
  const collected = earningMatch !== null;

  return (
    <button
      type="button"
      className={`badge-card stadium-card${collected ? " stadium-card-collected" : " badge-tier-locked"}`}
      onClick={onOpenDetail}
      aria-label={`${item.ground}, ${collected ? `first visit ${formatDateShort(earningMatch.date)}` : "not yet visited"}`}
    >
      <div className="badge-card-inner stadium-card-inner">
        <div className="stadium-art-panel">
          {collected ? <StadiumArt art={STADIUM_ART_BY_GROUND[item.groundId]} /> : <EmptyStadiumIcon />}
        </div>
        <div className="stadium-name-block">
          <div className={`stadium-name${collected ? "" : " stadium-name-locked"}`}>{item.ground}</div>
          <div className="stadium-place">
            {item.city} &middot; {country}
          </div>
        </div>
        <div className="badge-reached-block stadium-reached">
          <div className="badge-reached-label">{collected ? "First visit" : "Not yet visited"}</div>
          {collected && earningMatch && (
            <>
              <div className={`badge-reached-match${collected ? "" : " stadium-name-locked"}`}>
                {matchScoreLine(earningMatch)}
              </div>
              <div className="badge-reached-date">{formatDateShort(earningMatch.date)}</div>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
