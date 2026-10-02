import { useMemo, useState } from "react";
import type { Fixture, Ground } from "../../types";
import { formatDateLong, formatFixtureScoreLine, formatMonthYear, googleSearchUrl } from "../../lib/format";
import { AttendToggle } from "../shared/AttendToggle";
import { LockIcon } from "../shared/LockIcon";

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

interface MonthGroup {
  month: string;
  fixtures: Fixture[];
}

/** Fixtures within a season are already in chronological order, so a single
 * pass (starting a new group whenever the month changes) groups them
 * correctly without needing to re-sort. */
function groupByMonth(fixtures: Fixture[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const fixture of fixtures) {
    const month = formatMonthYear(fixture.date);
    const last = groups[groups.length - 1];
    if (last && last.month === month) {
      last.fixtures.push(fixture);
    } else {
      groups.push({ month, fixtures: [fixture] });
    }
  }
  return groups;
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

  const monthGroups = useMemo(() => groupByMonth(displayedFixtures), [displayedFixtures]);

  const attendedCount = useMemo(
    () => displayedFixtures.filter((f) => attendedMatchIds.has(f.matchId)).length,
    [displayedFixtures, attendedMatchIds],
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

  const countDisplay = (
    <>
      <span className="fixture-count-value">{attendedCount}</span>
      <span className="fixture-count-label">attended</span>
    </>
  );

  return (
    <div>
      <div className="fixtures-toolbar">
        <div className="fixtures-title-row">
          <h1 className="page-heading">Fixtures</h1>
          <div className="fixture-count fixture-count-desktop">{countDisplay}</div>
        </div>

        <div className="fixtures-filters-row">
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
          <div className="fixtures-row-break" />
          <div className="unit-toggle">
            <button
              className={viewMode === "list" ? "active" : ""}
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
            >
              List
            </button>
            <button
              className={viewMode === "grid" ? "active" : ""}
              aria-pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
          </div>
          <div className="fixture-count fixture-count-mobile">{countDisplay}</div>
          <div className="fixtures-row-break" />
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
        </div>

        <div className="autosave-notice">
          <LockIcon />
          <div>
            Saves automatically, in this browser only.
            <span className="autosave-notice-extra">
              {" "}
              Switching devices or clearing your browser data will lose your matches.
            </span>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="ticket-list">
          {monthGroups.map(({ month, fixtures: monthFixtures }) => (
            <section key={month} className="month-group">
              <div className="month-heading">
                <h2>{month}</h2>
                <div className="hairline" />
              </div>
              <div className="ticket-grid">
                {monthFixtures.map((fixture) => {
                  const ground = groundsById.get(fixture.groundId);
                  const attended = attendedMatchIds.has(fixture.matchId);
                  const disabled = fixture.behindClosedDoors;
                  const title = `${fixture.homeTeam} v ${fixture.awayTeam}`;
                  return (
                    <div
                      key={fixture.matchId}
                      className={`ticket${attended ? " attended" : ""}${disabled ? " disabled" : ""}`}
                    >
                      <div className="ticket-stub">
                        <div className="ticket-score">{formatFixtureScoreLine(fixture)}</div>
                        <div className="ticket-ha">{venueLabel(fixture.venueType)}</div>
                      </div>
                      <div className="ticket-details">
                        <div className="ticket-meta-row">
                          <span className={`result-chip result-chip-${fixture.result.toLowerCase()}`}>
                            {resultLabel(fixture)}
                          </span>
                          <span className="ticket-competition">{fixture.competition}</span>
                        </div>
                        <div className="ticket-title">{title}</div>
                        <div className="ticket-subtext">
                          {formatDateLong(fixture.date)}
                          <br />
                          {ground?.ground ?? fixture.venue}
                        </div>
                        {(!fixture.countsInRecord || disabled) && (
                          <div className="ticket-flags">
                            {!fixture.countsInRecord && (
                              <span className="pill badge-voided">Voided</span>
                            )}
                            {disabled && <span className="pill badge-voided">Behind closed doors</span>}
                          </div>
                        )}
                        <a
                          className="remember-link"
                          href={googleSearchUrl(fixture)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Can&apos;t remember?
                        </a>
                      </div>
                      <div className="ticket-toggle-col">
                        <AttendToggle
                          attended={attended}
                          disabled={disabled}
                          label={`Attended ${title}`}
                          onToggle={(next) => onToggleAttendance(fixture.matchId, next)}
                        />
                        <div className="ticket-caption">{attended ? "Was there" : "Missed it"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          {displayedFixtures.length === 0 && <div className="empty-state">No fixtures.</div>}
        </div>
      ) : (
        <div className="fixture-grid">
          {displayedFixtures.map((fixture) => {
            const attended = attendedMatchIds.has(fixture.matchId);
            const disabled = fixture.behindClosedDoors;
            const title = `${fixture.homeTeam} v ${fixture.awayTeam}`;
            return (
              <div
                key={fixture.matchId}
                className={`fixture-card${attended ? " attended" : ""}${disabled ? " disabled" : ""}`}
              >
                <div className="fixture-card-score">{formatFixtureScoreLine(fixture)}</div>
                <div className="fixture-card-teams" title={title}>
                  {fixture.opponent}{" "}
                  <span className="pill badge-venue" title={venueLabel(fixture.venueType)}>
                    {fixture.venueType}
                  </span>
                </div>
                <div className="fixture-card-meta">
                  <span>{formatDateLong(fixture.date)}</span>
                  <span className={`result-chip result-chip-${fixture.result.toLowerCase()}`}>
                    {resultLabel(fixture)}
                  </span>
                </div>
                {(!fixture.countsInRecord || disabled) && (
                  <div className="fixture-card-meta">
                    {!fixture.countsInRecord && <span className="pill badge-voided">Voided</span>}
                    {disabled && <span className="pill badge-voided">BCD</span>}
                  </div>
                )}
                <AttendToggle
                  attended={attended}
                  disabled={disabled}
                  label={`Attended ${title}`}
                  onToggle={(next) => onToggleAttendance(fixture.matchId, next)}
                  size={36}
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
