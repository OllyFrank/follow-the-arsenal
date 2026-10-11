import type { Fixture, Ground } from "../../types";
import type { DerbySectionStats } from "../../lib/derbyStats";
import { fixtureLabel, formatFixtureScoreLine, googleSearchUrl } from "../../lib/format";

interface Props {
  title: string;
  seasons: string[];
  season: string;
  onSeasonChange: (season: string) => void;
  stats: DerbySectionStats;
  /** Only North London Derbies shows this; omit for London Derbies. */
  firstDerby?: Fixture | null;
  /** Singular, natural-case label for the "Your first ___" line, e.g.
   * "North London derby" — title is plural ("...Derbies") so isn't reused. */
  firstDerbyLabel?: string;
  groundsById: Map<string, Ground>;
  /** Preset the Fixtures-tab opponent filter when following the empty-state
   * link. Omit for a section with no single opponent (London Derbies). */
  opponentForEmptyState?: string;
  onViewFixtures: (opponent?: string) => void;
}

export function DerbyCard({
  title,
  seasons,
  season,
  onSeasonChange,
  stats,
  firstDerby,
  firstDerbyLabel,
  groundsById,
  opponentForEmptyState,
  onViewFixtures,
}: Props) {
  const { record, biggestWin, biggestLoss, unbeatenRun, luckyCharm } = stats;

  return (
    <section className="card derby-card">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <div className="season-filter">
          <select value={season} onChange={(e) => onSeasonChange(e.target.value)}>
            <option value="all">All seasons</option>
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {stats.attendedCount === 0 ? (
        <div className="empty-state">
          No derbies ticked yet.{" "}
          <button className="link-button" onClick={() => onViewFixtures(opponentForEmptyState)}>
            See the fixtures
          </button>
        </div>
      ) : (
        <div className="derby-card-body">
          {firstDerby && (
            <div className="stat-line-pair derby-first">
              <div className="stat-subline">Your first {firstDerbyLabel}</div>
              <a
                className="stat-line derby-first-link"
                href={googleSearchUrl(firstDerby)}
                target="_blank"
                rel="noreferrer"
              >
                {formatFixtureScoreLine(firstDerby)} &middot; {fixtureLabel(firstDerby)}
              </a>
              <div className="stat-subline">
                {groundsById.get(firstDerby.groundId)?.ground ?? firstDerby.venue}
              </div>
            </div>
          )}

          <div className="record-figures">
            <div className="record-figure">
              <div className="record-figure-value record-won">{record.wins}</div>
              <div className="record-figure-label">Won</div>
            </div>
            <div className="record-figure">
              <div className="record-figure-value record-drawn">{record.draws}</div>
              <div className="record-figure-label">Drawn</div>
            </div>
            <div className="record-figure">
              <div className="record-figure-value record-lost">{record.losses}</div>
              <div className="record-figure-label">Lost</div>
            </div>
          </div>
          <div
            className="record-bar"
            role="img"
            aria-label={`${record.wins} won, ${record.draws} drawn, ${record.losses} lost`}
          >
            {record.played > 0 && (
              <>
                <div className="record-bar-won" style={{ width: `${(record.wins / record.played) * 100}%` }} />
                <div
                  className="record-bar-drawn"
                  style={{ width: `${(record.draws / record.played) * 100}%` }}
                />
                <div className="record-bar-lost" />
              </>
            )}
          </div>
          <div className="stat-line-pair">
            <div className="stat-line">{record.winPct.toFixed(0)}% win rate</div>
            <div className="stat-subline">
              {record.goalsFor}-{record.goalsAgainst} goals for/against &middot; {record.played} played
            </div>
          </div>

          <div className="derby-sub-grid">
            <div className="stat-line-pair">
              <div className="stat-line">
                {biggestWin
                  ? `${biggestWin.fixture.arsenalGoals}-${biggestWin.fixture.opponentGoals} win`
                  : "No wins seen yet"}
              </div>
              <div className="stat-subline">
                {biggestWin ? fixtureLabel(biggestWin.fixture) : "Biggest win seen"}
              </div>
            </div>
            <div className="stat-line-pair">
              <div className="stat-line">
                {biggestLoss
                  ? `${biggestLoss.fixture.arsenalGoals}-${biggestLoss.fixture.opponentGoals} loss`
                  : "No losses seen yet"}
              </div>
              <div className="stat-subline">
                {biggestLoss ? fixtureLabel(biggestLoss.fixture) : "Biggest defeat seen"}
              </div>
            </div>
            <div className="stat-line-pair">
              <div className="stat-line">{unbeatenRun.length} matches</div>
              <div className="stat-subline">Longest unbeaten run seen</div>
            </div>
          </div>

          <div className="lucky-charm-row">
            <div className="lucky-charm-row-head">
              <div>
                Attended{" "}
                <span className="stat-subline-inline">&middot; {luckyCharm.attended.played} matches</span>
              </div>
              <div className="lucky-charm-pct lucky-charm-pct-attended">
                {luckyCharm.attended.winPct.toFixed(0)}%
              </div>
            </div>
            <div className="lucky-charm-track">
              <div
                className="lucky-charm-fill lucky-charm-fill-attended"
                style={{ width: `${luckyCharm.attended.winPct}%` }}
              />
            </div>
          </div>
          <div className="lucky-charm-row">
            <div className="lucky-charm-row-head">
              <div>
                Missed{" "}
                <span className="stat-subline-inline">&middot; {luckyCharm.missed.played} matches</span>
              </div>
              <div className="lucky-charm-pct lucky-charm-pct-missed">
                {luckyCharm.missed.winPct.toFixed(0)}%
              </div>
            </div>
            <div className="lucky-charm-track">
              <div
                className="lucky-charm-fill lucky-charm-fill-missed"
                style={{ width: `${luckyCharm.missed.winPct}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
