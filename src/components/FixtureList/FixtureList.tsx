import { useMemo, useState } from "react";
import type { Fixture, Ground } from "../../types";
import { formatDateLong, formatFixtureScoreLine, googleSearchUrl } from "../../lib/format";

interface Props {
  fixtures: Fixture[];
  groundsById: Map<string, Ground>;
  attendedMatchIds: Set<string>;
  onToggleAttendance: (matchId: string, attended: boolean) => void;
  onBulkSetAttendance: (matchIds: string[], attended: boolean) => void;
}

function resultLabel(fixture: Fixture): string {
  if (fixture.result === "W") return "W";
  if (fixture.result === "D") return "D";
  return "L";
}

function venueLabel(venueType: Fixture["venueType"]): string {
  if (venueType === "H") return "Home";
  if (venueType === "A") return "Away";
  return "Neutral";
}

export function FixtureList({
  fixtures,
  groundsById,
  attendedMatchIds,
  onToggleAttendance,
  onBulkSetAttendance,
}: Props) {
  const seasons = useMemo(() => {
    const set = new Set(fixtures.map((f) => f.season));
    return [...set].sort();
  }, [fixtures]);

  const [season, setSeason] = useState(() => seasons[seasons.length - 1] ?? "");
  const [competition, setCompetition] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // A competition selected in one season may not exist in another (e.g. the
  // Champions League isn't played every year), so reset it when the season
  // changes. Adjusted during render (React's recommended pattern for this)
  // rather than in an effect, to avoid an extra render pass.
  const [prevSeason, setPrevSeason] = useState(season);
  if (season !== prevSeason) {
    setPrevSeason(season);
    setCompetition("all");
  }

  const seasonFixtures = useMemo(
    () => fixtures.filter((f) => f.season === season),
    [fixtures, season],
  );

  const competitions = useMemo(() => {
    const set = new Set(seasonFixtures.map((f) => f.competition));
    return [...set].sort();
  }, [seasonFixtures]);

  const displayedFixtures = useMemo(
    () =>
      competition === "all"
        ? seasonFixtures
        : seasonFixtures.filter((f) => f.competition === competition),
    [seasonFixtures, competition],
  );

  const selectableIds = useMemo(
    () => displayedFixtures.filter((f) => !f.behindClosedDoors).map((f) => f.matchId),
    [displayedFixtures],
  );
  const homeIds = useMemo(
    () =>
      displayedFixtures
        .filter((f) => !f.behindClosedDoors && f.venueType === "H")
        .map((f) => f.matchId),
    [displayedFixtures],
  );

  return (
    <div>
      <div className="season-filter">
        <select value={season} onChange={(e) => setSeason(e.target.value)}>
          {seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={competition} onChange={(e) => setCompetition(e.target.value)}>
          <option value="all">All competitions</option>
          {competitions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="unit-toggle">
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
          <button
            className={viewMode === "grid" ? "active" : ""}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </button>
        </div>
      </div>

      <div className="bulk-actions">
        <button className="btn" onClick={() => onBulkSetAttendance(homeIds, true)}>
          Tick all home games
        </button>
        <button className="btn" onClick={() => onBulkSetAttendance(selectableIds, true)}>
          Select all
        </button>
        <button className="btn" onClick={() => onBulkSetAttendance(selectableIds, false)}>
          Untick all
        </button>
      </div>

      {viewMode === "list" ? (
        <div className="card">
          {displayedFixtures.map((fixture) => {
            const ground = groundsById.get(fixture.groundId);
            const attended = attendedMatchIds.has(fixture.matchId);
            const disabled = fixture.behindClosedDoors;
            return (
              <div
                key={fixture.matchId}
                className={`fixture-row${disabled ? " disabled" : ""}`}
              >
                <div className="fixture-score">{formatFixtureScoreLine(fixture)}</div>
                <div className="fixture-main">
                  <div className="fixture-teams">
                    {fixture.homeTeam} v {fixture.awayTeam}
                  </div>
                  <div className="fixture-meta">
                    <span>{formatDateLong(fixture.date)}</span>
                    <span
                      className={`pill badge-${fixture.result.toLowerCase()}`}
                      title="Result"
                    >
                      {resultLabel(fixture)}
                    </span>
                    {fixture.penaltyShootOut && <span>({fixture.penaltyShootOut} pens)</span>}
                    <span>{fixture.competition}</span>
                    {fixture.stage !== fixture.competition && <span>&middot; {fixture.stage}</span>}
                    <span>&middot; {ground?.ground ?? fixture.venue}</span>
                    {!fixture.countsInRecord && (
                      <span className="pill badge-voided">Voided</span>
                    )}
                    {disabled && <span className="pill badge-voided">Behind closed doors</span>}
                    <a
                      className="remember-link"
                      href={googleSearchUrl(fixture)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Can&apos;t remember?
                    </a>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="attend-toggle"
                  checked={attended}
                  disabled={disabled}
                  onChange={(e) => onToggleAttendance(fixture.matchId, e.target.checked)}
                  aria-label={`Mark ${fixture.homeTeam} v ${fixture.awayTeam} as attended`}
                />
              </div>
            );
          })}
          {displayedFixtures.length === 0 && <div className="empty-state">No fixtures.</div>}
        </div>
      ) : (
        <div className="fixture-grid">
          {displayedFixtures.map((fixture) => {
            const attended = attendedMatchIds.has(fixture.matchId);
            const disabled = fixture.behindClosedDoors;
            return (
              <div
                key={fixture.matchId}
                className={`fixture-card${disabled ? " disabled" : ""}`}
              >
                <div className="fixture-card-score">{formatFixtureScoreLine(fixture)}</div>
                <div className="fixture-card-teams" title={`${fixture.homeTeam} v ${fixture.awayTeam}`}>
                  {fixture.opponent}{" "}
                  <span className="fixture-card-venue">@ {venueLabel(fixture.venueType).toLowerCase()}</span>
                </div>
                <div className="fixture-card-meta">
                  <span>{formatDateLong(fixture.date)}</span>
                  <span className={`pill badge-${fixture.result.toLowerCase()}`} title="Result">
                    {resultLabel(fixture)}
                  </span>
                </div>
                {(!fixture.countsInRecord || disabled) && (
                  <div className="fixture-card-meta">
                    {!fixture.countsInRecord && <span className="pill badge-voided">Voided</span>}
                    {disabled && <span className="pill badge-voided">BCD</span>}
                  </div>
                )}
                <input
                  type="checkbox"
                  className="attend-toggle"
                  checked={attended}
                  disabled={disabled}
                  onChange={(e) => onToggleAttendance(fixture.matchId, e.target.checked)}
                  aria-label={`Mark ${fixture.homeTeam} v ${fixture.awayTeam} as attended`}
                />
              </div>
            );
          })}
          {displayedFixtures.length === 0 && <div className="empty-state">No fixtures.</div>}
        </div>
      )}
    </div>
  );
}
