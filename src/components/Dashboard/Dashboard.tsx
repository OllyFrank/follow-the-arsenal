import { useMemo, useState } from "react";
import type { Fixture, Ground, HomeAddress } from "../../types";
import { computeStats } from "../../lib/stats";
import { formatDateLong, formatDistance } from "../../lib/format";
import { usePagination } from "../../hooks/usePagination";
import { GroundsMap } from "./GroundsMap";
import { PaginationControls } from "./PaginationControls";

const GROUNDS_PAGE_SIZE = 10;

interface Props {
  fixtures: Fixture[];
  grounds: Ground[];
  attendedMatchIds: Set<string>;
  addresses: HomeAddress[];
  unit: "mi" | "km";
  onUnitChange: (unit: "mi" | "km") => void;
}

function fixtureLabel(fixture: Fixture): string {
  return `${fixture.homeTeam} v ${fixture.awayTeam}, ${formatDateLong(fixture.date)}`;
}

export function Dashboard({
  fixtures,
  grounds,
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

  const scopedFixtures = useMemo(
    () => (season === "all" ? fixtures : fixtures.filter((f) => f.season === season)),
    [fixtures, season],
  );

  const stats = useMemo(
    () => computeStats(scopedFixtures, grounds, [...attendedMatchIds], addresses),
    [scopedFixtures, grounds, attendedMatchIds, addresses],
  );

  const dist = (km: number) => formatDistance(km, unit);

  const groundsPage = usePagination(stats.grounds.rankedByVisits, GROUNDS_PAGE_SIZE);

  return (
    <div>
      <div className="season-filter">
        <select value={season} onChange={(e) => setSeason(e.target.value)}>
          <option value="all">All seasons</option>
          {seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="unit-toggle">
          <button className={unit === "mi" ? "active" : ""} onClick={() => onUnitChange("mi")}>
            mi
          </button>
          <button className={unit === "km" ? "active" : ""} onClick={() => onUnitChange("km")}>
            km
          </button>
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

      <div className="stats-grid">
        <div className="stat-tile">
          <div className="stat-value">{dist(stats.distance.totalKm)}</div>
          <div className="stat-label">Total distance</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{stats.distance.lapsOfEarth.toFixed(2)}</div>
          <div className="stat-label">Laps of the Earth</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{stats.grounds.totalVisited}</div>
          <div className="stat-label">Grounds visited</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">
            {stats.record.overall.wins}-{stats.record.overall.draws}-
            {stats.record.overall.losses}
          </div>
          <div className="stat-label">Record (W-D-L)</div>
          <div className="stat-detail">{stats.record.overall.winPct.toFixed(0)}% win rate</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{stats.goalsSeen.arsenal}</div>
          <div className="stat-label">Arsenal goals seen</div>
          <div className="stat-detail">{stats.goalsSeen.total} total goals</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{stats.longestUnbeatenRun.length}</div>
          <div className="stat-label">Longest unbeaten run</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="section-title">Furthest single trip</div>
        {stats.distance.furthestTrip ? (
          <div>
            {dist(stats.distance.furthestTrip.distanceKm)} &mdash;{" "}
            {fixtureLabel(stats.distance.furthestTrip.fixture)} at{" "}
            {stats.distance.furthestTrip.ground.ground}
          </div>
        ) : (
          <div className="empty-state">No attended matches with a resolvable distance yet.</div>
        )}
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="section-title">Grounds visited</div>
        <GroundsMap groundsWithVisits={stats.grounds.rankedByVisits} />
        <table className="stats-table">
          <tbody>
            {groundsPage.pageItems.map(({ ground, visits }) => (
              <tr key={ground.groundId}>
                <td>{ground.ground}</td>
                <td>{visits}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls
          page={groundsPage.page}
          totalPages={groundsPage.totalPages}
          onChange={groundsPage.setPage}
        />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="section-title">Distance by season</div>
          <table className="stats-table">
            <tbody>
              {stats.distance.bySeasonKm.map(({ season: s, km }) => (
                <tr key={s}>
                  <td>{s}</td>
                  <td>{dist(km)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="section-title">Top opponents</div>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Opponent</th>
                <th>Played</th>
                <th>Home</th>
                <th>Away</th>
              </tr>
            </thead>
            <tbody>
              {stats.topOpponents.slice(0, 10).map((o) => (
                <tr key={o.opponent}>
                  <td>{o.opponent}</td>
                  <td>{o.played}</td>
                  <td>{o.home}</td>
                  <td>{o.away}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="section-title">Record</div>
          <table className="stats-table">
            <thead>
              <tr>
                <th></th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>Win%</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Overall", stats.record.overall],
                  ["Home", stats.record.home],
                  ["Away", stats.record.away],
                ] as const
              ).map(([label, r]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{r.played}</td>
                  <td>{r.wins}</td>
                  <td>{r.draws}</td>
                  <td>{r.losses}</td>
                  <td>{r.winPct.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="section-title">Lucky charm?</div>
          <table className="stats-table">
            <thead>
              <tr>
                <th></th>
                <th>P</th>
                <th>Win%</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Attended</td>
                <td>{stats.luckyCharm.attended.played}</td>
                <td>{stats.luckyCharm.attended.winPct.toFixed(0)}%</td>
              </tr>
              <tr>
                <td>Missed</td>
                <td>{stats.luckyCharm.missed.played}</td>
                <td>{stats.luckyCharm.missed.winPct.toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="section-title">Biggest win &amp; loss seen</div>
          <div>
            {stats.biggestWin
              ? `Biggest win: ${fixtureLabel(stats.biggestWin.fixture)} (${stats.biggestWin.fixture.arsenalGoals}-${stats.biggestWin.fixture.opponentGoals})`
              : "No wins seen yet."}
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            {stats.biggestLoss
              ? `Biggest loss: ${fixtureLabel(stats.biggestLoss.fixture)} (${stats.biggestLoss.fixture.arsenalGoals}-${stats.biggestLoss.fixture.opponentGoals})`
              : "No losses seen yet."}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Highest-scoring match seen</div>
          <div>
            {stats.highestScoring
              ? `${fixtureLabel(stats.highestScoring.fixture)} (${stats.highestScoring.totalGoals} goals)`
              : "No matches seen yet."}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Longest gap between attended matches</div>
          {stats.longestGap.before && stats.longestGap.after ? (
            <div>
              {stats.longestGap.days} days, between {fixtureLabel(stats.longestGap.before)} and{" "}
              {fixtureLabel(stats.longestGap.after)}
            </div>
          ) : (
            <div className="empty-state">Not enough attended matches yet.</div>
          )}
        </div>

        <div className="card">
          <div className="section-title">Matches by competition</div>
          <table className="stats-table">
            <tbody>
              {stats.byCompetition.map(({ competition, matches }) => (
                <tr key={competition}>
                  <td>{competition}</td>
                  <td>{matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="section-title">Finals</div>
          <div>
            Attended {stats.finals.attended}, won {stats.finals.wins} (
            {stats.finals.winPct.toFixed(0)}%)
          </div>
        </div>
      </div>
    </div>
  );
}
