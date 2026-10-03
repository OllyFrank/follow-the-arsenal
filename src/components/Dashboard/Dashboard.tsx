import { useMemo, useState } from "react";
import type { Fixture, Ground, HomeAddress, Manager } from "../../types";
import { computeStats } from "../../lib/stats";
import { formatDateLong, formatDistance, ordinal } from "../../lib/format";
import { EARTH_CIRCUMFERENCE_KM } from "../../lib/distance";
import { usePagination } from "../../hooks/usePagination";
import { Globe } from "../shared/Globe";
import { LapStamps } from "../shared/LapStamps";
import { GroundsMap } from "./GroundsMap";
import { PaginationControls } from "./PaginationControls";

const GROUNDS_PAGE_SIZE = 10;
const VISIBLE_SEASONS_DEFAULT = 6;

interface Props {
  fixtures: Fixture[];
  grounds: Ground[];
  managers: Manager[];
  attendedMatchIds: Set<string>;
  addresses: HomeAddress[];
  unit: "mi" | "km";
  onUnitChange: (unit: "mi" | "km") => void;
}

function fixtureLabel(fixture: Fixture): string {
  return `${fixture.homeTeam} v ${fixture.awayTeam}, ${formatDateLong(fixture.date)}`;
}

// Monthly attendance heatmap: color and bar height both scale continuously
// against the busiest month *in the current scope* (never a fixed or
// all-time number), so the ramp always uses its full range regardless of
// how many matches that scope actually has.
const HEAT_TRACK_PX = 110;
const HEAT_MIN_BAR_PX = 18;
const HEAT_EMPTY_COLOR = "#ececef"; // var(--grey-100)
const HEAT_LIGHT_COLOR = "#fde4e4"; // var(--loss-bg)
const HEAT_DARK_COLOR = "#a3000c"; // var(--red-dark)

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function monthBarColor(count: number, maxCount: number): string {
  if (count === 0 || maxCount === 0) return HEAT_EMPTY_COLOR;
  const t = count / maxCount;
  const [r1, g1, b1] = hexToRgb(HEAT_LIGHT_COLOR);
  const [r2, g2, b2] = hexToRgb(HEAT_DARK_COLOR);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function monthBarHeightPx(count: number, maxCount: number): number {
  if (count === 0 || maxCount === 0) return 6;
  return Math.max(HEAT_MIN_BAR_PX, Math.round((count / maxCount) * HEAT_TRACK_PX));
}

export function Dashboard({
  fixtures,
  grounds,
  managers,
  attendedMatchIds,
  addresses,
  unit,
  onUnitChange,
}: Props) {
  const seasons = useMemo(() => {
    const set = new Set(fixtures.map((f) => f.season));
    return [...set].sort();
  }, [fixtures]);

  const [season, setSeason] = useState<string>("all");
  const [showAllSeasons, setShowAllSeasons] = useState(false);

  const scopedFixtures = useMemo(
    () => (season === "all" ? fixtures : fixtures.filter((f) => f.season === season)),
    [fixtures, season],
  );

  const stats = useMemo(
    () => computeStats(scopedFixtures, grounds, [...attendedMatchIds], addresses, managers),
    [scopedFixtures, grounds, attendedMatchIds, addresses, managers],
  );

  const dist = (km: number) => formatDistance(km, unit);

  const groundsPage = usePagination(stats.grounds.rankedByVisits, GROUNDS_PAGE_SIZE);

  const lapsOfEarth = stats.distance.lapsOfEarth;
  const completedLaps = Math.floor(lapsOfEarth);
  const lapFraction = lapsOfEarth - completedLaps;
  const remainingToNextLapKm = EARTH_CIRCUMFERENCE_KM * (1 - lapFraction);

  const seasonsByDistanceDesc = useMemo(
    () => [...stats.distance.bySeasonKm].reverse(),
    [stats.distance.bySeasonKm],
  );
  const maxSeasonKm = useMemo(
    () => Math.max(0, ...stats.distance.bySeasonKm.map((s) => s.km)),
    [stats.distance.bySeasonKm],
  );
  const visibleSeasons = showAllSeasons
    ? seasonsByDistanceDesc
    : seasonsByDistanceDesc.slice(0, VISIBLE_SEASONS_DEFAULT);

  const recordBar = stats.record.overall;

  const maxMonthlyCount = Math.max(0, ...stats.monthlyAttendance.map((m) => m.count));

  return (
    <div>
      <div className="stats-title-row">
        <h1 className="page-heading">Stats</h1>
        <div className="season-filter stats-controls">
          <select value={season} onChange={(e) => setSeason(e.target.value)}>
            <option value="all">All seasons</option>
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="unit-toggle">
            <button
              aria-pressed={unit === "mi"}
              className={unit === "mi" ? "active" : ""}
              onClick={() => onUnitChange("mi")}
            >
              mi
            </button>
            <button
              aria-pressed={unit === "km"}
              className={unit === "km" ? "active" : ""}
              onClick={() => onUnitChange("km")}
            >
              km
            </button>
          </div>
        </div>
      </div>

      {stats.distance.unresolvedFixtures.length > 0 && (
        <div className="warning-box">
          {stats.distance.unresolvedFixtures.length} attended match
          {stats.distance.unresolvedFixtures.length === 1 ? "" : "es"} fell outside any home
          address period and {stats.distance.unresolvedFixtures.length === 1 ? "isn't" : "aren't"}{" "}
          counted in distance totals.
        </div>
      )}

      <div className="stats-top">
        <section className="stats-hero">
          <Globe variant="navy" className="stats-hero-globe" />
          <div className="stats-hero-label">Total distance</div>
          <div className="stats-hero-value">
            <span>{dist(stats.distance.totalKm).replace(new RegExp(`\\s*${unit}$`), "")}</span>
            <span className="stats-hero-unit">{unit}</span>
          </div>
          <div className="stats-hero-rule" />
          <div className="stats-hero-laps-row">
            <div className="stats-hero-laps">
              <span className="stats-hero-laps-value">{lapsOfEarth.toFixed(2)}</span>
              <span>laps of the Earth</span>
            </div>
            <LapStamps lapsOfEarth={lapsOfEarth} />
          </div>
          <div className="lap-progress-track">
            <div className="lap-progress-fill" style={{ width: `${lapFraction * 100}%` }} />
          </div>
          <div className="stats-hero-caption">
            One cannon per lap. Another {dist(remainingToNextLapKm)} earns the{" "}
            {ordinal(completedLaps + 1)}.
          </div>
        </section>

        <div className="stats-tiles">
          <div className="stat-tile">
            <div className="stat-value">{stats.grounds.totalVisited}</div>
            <div className="stat-label">Grounds visited</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">{stats.goalsSeen.arsenal}</div>
            <div className="stat-label">Arsenal goals seen</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">{stats.longestUnbeatenRun.length}</div>
            <div className="stat-label">Longest unbeaten run</div>
          </div>
        </div>

        <section className="card record-card">
          <div className="section-header">
            <h2 className="section-title">Record</h2>
            <div className="record-winrate">{recordBar.winPct.toFixed(0)}% win rate</div>
          </div>
          <div className="record-figures">
            <div className="record-figure">
              <div className="record-figure-value record-won">{recordBar.wins}</div>
              <div className="record-figure-label">Won</div>
            </div>
            <div className="record-figure">
              <div className="record-figure-value record-drawn">{recordBar.draws}</div>
              <div className="record-figure-label">Drawn</div>
            </div>
            <div className="record-figure">
              <div className="record-figure-value record-lost">{recordBar.losses}</div>
              <div className="record-figure-label">Lost</div>
            </div>
          </div>
          <div
            className="record-bar"
            role="img"
            aria-label={`${recordBar.wins} won, ${recordBar.draws} drawn, ${recordBar.losses} lost`}
          >
            {recordBar.played > 0 && (
              <>
                <div
                  className="record-bar-won"
                  style={{ width: `${(recordBar.wins / recordBar.played) * 100}%` }}
                />
                <div
                  className="record-bar-drawn"
                  style={{ width: `${(recordBar.draws / recordBar.played) * 100}%` }}
                />
                <div className="record-bar-lost" />
              </>
            )}
          </div>
          <table className="stats-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Venue</span>
                </th>
                <th scope="col" className="num">P</th>
                <th scope="col" className="num">W</th>
                <th scope="col" className="num">D</th>
                <th scope="col" className="num">L</th>
                <th scope="col" className="num">Win%</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Home", stats.record.home],
                  ["Away", stats.record.away],
                  ["Overall", stats.record.overall],
                ] as const
              ).map(([label, r]) => (
                <tr key={label} className={label === "Overall" ? "stats-table-total" : ""}>
                  <th scope="row">{label}</th>
                  <td className="num">{r.played}</td>
                  <td className="num">{r.wins}</td>
                  <td className="num">{r.draws}</td>
                  <td className="num">{r.losses}</td>
                  <td className="num strong">{r.winPct.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="stats-bottom">
        <section className="card distance-season-section">
          <h2 className="section-title">Distance by season</h2>
          <div className="season-bars">
            {visibleSeasons.map(({ season: s, km }) => (
              <div className="season-bar-row" key={s}>
                <div className="season-bar-label">{s}</div>
                <div className="season-bar-track">
                  <div
                    className="season-bar-fill"
                    style={{ width: maxSeasonKm === 0 ? "0%" : `${(km / maxSeasonKm) * 100}%` }}
                  />
                </div>
                <div className="season-bar-value">{dist(km)}</div>
              </div>
            ))}
          </div>
          {!showAllSeasons && seasonsByDistanceDesc.length > VISIBLE_SEASONS_DEFAULT && (
            <button className="link-button" onClick={() => setShowAllSeasons(true)}>
              Show all {seasonsByDistanceDesc.length} seasons
            </button>
          )}
        </section>

        <div className="stats-side">
          <section className="card furthest-trip-section">
            <h2 className="section-title">Furthest single trip</h2>
            {stats.distance.furthestTrip ? (
              <>
                <div className="furthest-trip-strip">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="var(--navy)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 11l8-7 8 7M6 10v10h12V10" />
                  </svg>
                  <div className="furthest-trip-dots" />
                  <div className="furthest-trip-distance">
                    {dist(stats.distance.furthestTrip.oneWayKm)}
                  </div>
                  <div className="furthest-trip-dots" />
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="var(--red)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                </div>
                <div className="stat-line">
                  {stats.distance.furthestTrip.fixture.homeTeam} v{" "}
                  {stats.distance.furthestTrip.fixture.awayTeam}
                </div>
                <div className="stat-subline">
                  {formatDateLong(stats.distance.furthestTrip.fixture.date)} &middot;{" "}
                  {stats.distance.furthestTrip.ground.ground}
                </div>
              </>
            ) : (
              <div className="empty-state">No attended matches with a resolvable distance yet.</div>
            )}
          </section>

          <section className="card lucky-charm-section">
            <h2 className="section-title">Lucky charm?</h2>
            <div className="stat-subline" style={{ marginTop: "-0.5rem", marginBottom: "0.25rem" }}>
              Arsenal&apos;s win rate when you&apos;re there, and when you&apos;re not.
            </div>
            <div className="lucky-charm-row">
              <div className="lucky-charm-row-head">
                <div>
                  Attended <span className="stat-subline-inline">&middot; {stats.luckyCharm.attended.played} matches</span>
                </div>
                <div className="lucky-charm-pct lucky-charm-pct-attended">
                  {stats.luckyCharm.attended.winPct.toFixed(0)}%
                </div>
              </div>
              <div className="lucky-charm-track">
                <div
                  className="lucky-charm-fill lucky-charm-fill-attended"
                  style={{ width: `${stats.luckyCharm.attended.winPct}%` }}
                />
              </div>
            </div>
            <div className="lucky-charm-row">
              <div className="lucky-charm-row-head">
                <div>
                  Missed <span className="stat-subline-inline">&middot; {stats.luckyCharm.missed.played} matches</span>
                </div>
                <div className="lucky-charm-pct lucky-charm-pct-missed">
                  {stats.luckyCharm.missed.winPct.toFixed(0)}%
                </div>
              </div>
              <div className="lucky-charm-track">
                <div
                  className="lucky-charm-fill lucky-charm-fill-missed"
                  style={{ width: `${stats.luckyCharm.missed.winPct}%` }}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2 className="section-title">Grounds visited</h2>
        <GroundsMap groundsWithVisits={stats.grounds.rankedByVisits} />
        <table className="stats-table">
          <tbody>
            {groundsPage.pageItems.map(({ ground, visits }) => (
              <tr key={ground.groundId}>
                <th scope="row">{ground.ground}</th>
                <td className="num">{visits}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls
          page={groundsPage.page}
          totalPages={groundsPage.totalPages}
          onChange={groundsPage.setPage}
        />
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2 className="section-title">Monthly attendance</h2>
        <div className="month-heatmap">
          {stats.monthlyAttendance.map((m) => (
            <div className="month-heatmap-col" key={m.month}>
              <div className="month-heatmap-count">{m.count}</div>
              <div className="month-heatmap-track">
                <div
                  className="month-heatmap-bar"
                  style={{
                    height: `${monthBarHeightPx(m.count, maxMonthlyCount)}px`,
                    background: monthBarColor(m.count, maxMonthlyCount),
                  }}
                  title={`${m.label}: ${m.count} match${m.count === 1 ? "" : "es"} attended`}
                />
              </div>
              <div className="month-heatmap-label">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="month-heatmap-legend">
          Fewer
          <div className="month-heatmap-legend-gradient" />
          More
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="card">
          <h2 className="section-title">Top opponents</h2>
          <table className="stats-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Opponent</span>
                </th>
                <th scope="col" className="num">P</th>
                <th scope="col" className="num">Home</th>
                <th scope="col" className="num">Away</th>
              </tr>
            </thead>
            <tbody>
              {stats.topOpponents.slice(0, 10).map((o) => (
                <tr key={o.opponent}>
                  <th scope="row">{o.opponent}</th>
                  <td className="num">{o.played}</td>
                  <td className="num">{o.home}</td>
                  <td className="num">{o.away}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="dashboard-stack">
          <section className="card">
            <h2 className="section-title">By manager</h2>
            <table className="stats-table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">Manager</span>
                  </th>
                  <th scope="col" className="num">P</th>
                  <th scope="col" className="num">W</th>
                  <th scope="col" className="num">D</th>
                  <th scope="col" className="num">L</th>
                  <th scope="col" className="num">Win%</th>
                </tr>
              </thead>
              <tbody>
                {stats.byManager.map((m) => (
                  <tr key={m.manager}>
                    <th scope="row">{m.manager}</th>
                    <td className="num">{m.played}</td>
                    <td className="num">{m.wins}</td>
                    <td className="num">{m.draws}</td>
                    <td className="num">{m.losses}</td>
                    <td className="num strong">{m.winPct.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card">
            <h2 className="section-title">Finals</h2>
            <div className="stat-line-pair">
              <div className="stat-line">
                {stats.finals.wins} win{stats.finals.wins === 1 ? "" : "s"} from{" "}
                {stats.finals.attended}
              </div>
              <div className="stat-subline">{stats.finals.winPct.toFixed(0)}% win rate</div>
            </div>
          </section>
        </div>

        <section className="card">
          <h2 className="section-title">Matches by competition</h2>
          <table className="stats-table">
            <tbody>
              {stats.byCompetition.map(({ competition, matches }) => (
                <tr key={competition}>
                  <th scope="row">{competition}</th>
                  <td className="num">{matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="section-title">Biggest win &amp; loss seen</h2>
          {stats.biggestWin ? (
            <div className="stat-line-pair">
              <div className="stat-line">
                {stats.biggestWin.fixture.arsenalGoals}-{stats.biggestWin.fixture.opponentGoals} win
              </div>
              <div className="stat-subline">{fixtureLabel(stats.biggestWin.fixture)}</div>
            </div>
          ) : (
            <div className="empty-state">No wins seen yet.</div>
          )}
          {stats.biggestLoss ? (
            <div className="stat-line-pair" style={{ marginTop: "0.75rem" }}>
              <div className="stat-line">
                {stats.biggestLoss.fixture.arsenalGoals}-{stats.biggestLoss.fixture.opponentGoals}{" "}
                loss
              </div>
              <div className="stat-subline">{fixtureLabel(stats.biggestLoss.fixture)}</div>
            </div>
          ) : (
            <div className="empty-state">No losses seen yet.</div>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Highest-scoring match seen</h2>
          {stats.highestScoring ? (
            <div className="stat-line-pair">
              <div className="stat-line">{stats.highestScoring.totalGoals} goals</div>
              <div className="stat-subline">{fixtureLabel(stats.highestScoring.fixture)}</div>
            </div>
          ) : (
            <div className="empty-state">No matches seen yet.</div>
          )}
        </section>

        <section className="card">
          <h2 className="section-title">Best seasons</h2>
          <div className="stat-line-pair">
            <div className="stat-line">
              {stats.bestSeasons.attendance
                ? `${stats.bestSeasons.attendance.value} match${
                    stats.bestSeasons.attendance.value === 1 ? "" : "es"
                  } — ${stats.bestSeasons.attendance.season}`
                : "No matches seen yet."}
            </div>
            <div className="stat-subline">Most attended</div>
          </div>
          <div className="stat-line-pair" style={{ marginTop: "0.75rem" }}>
            <div className="stat-line">
              {stats.bestSeasons.wins
                ? `${stats.bestSeasons.wins.value} win${
                    stats.bestSeasons.wins.value === 1 ? "" : "s"
                  } — ${stats.bestSeasons.wins.season}`
                : "No wins seen yet."}
            </div>
            <div className="stat-subline">Most wins seen</div>
          </div>
          <div className="stat-line-pair" style={{ marginTop: "0.75rem" }}>
            <div className="stat-line">
              {stats.bestSeasons.goals
                ? `${stats.bestSeasons.goals.value} goal${
                    stats.bestSeasons.goals.value === 1 ? "" : "s"
                  } — ${stats.bestSeasons.goals.season}`
                : "No goals seen yet."}
            </div>
            <div className="stat-subline">Most Arsenal goals seen</div>
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Longest gap between attended matches</h2>
          {stats.longestGap.before && stats.longestGap.after ? (
            <div className="stat-line-pair">
              <div className="stat-line">
                {stats.longestGap.matchesMissed}{" "}
                {stats.longestGap.matchesMissed === 1 ? "match" : "matches"} missed
              </div>
              <div className="stat-subline">
                {fixtureLabel(stats.longestGap.before)} to {fixtureLabel(stats.longestGap.after)}
              </div>
            </div>
          ) : (
            <div className="empty-state">Not enough attended matches yet.</div>
          )}
        </section>
      </div>
    </div>
  );
}
