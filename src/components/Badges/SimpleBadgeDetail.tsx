export interface SimpleDetailRow {
  key: string;
  label: string;
  value: string;
  done: boolean;
}

interface Props {
  category: string;
  name: string;
  rule: string;
  rows: SimpleDetailRow[];
}

/** The simpler detail for Ever Present, Old & New, The Premier League,
 * stamps, stadiums and tickets — "the rule and the matches involved"
 * (design-handoff/BADGES.md), reusing the tiered detail's row list look
 * without the medals or countdown banner. */
export function SimpleBadgeDetail({ category, name, rule, rows }: Props) {
  return (
    <div className="badge-detail-simple">
      <div className="badge-detail-titles badge-detail-simple-titles">
        <div className="badge-detail-eyebrow">{category}</div>
        <h2 id="badge-detail-title" className="badge-detail-name">
          {name}
        </h2>
      </div>
      <div className="badge-detail-rule">{rule}</div>
      <ol className="badge-detail-tiers">
        {rows.map((row) => (
          <li key={row.key} className="badge-detail-tier-row badge-detail-tier-row-simple">
            <div className="badge-detail-tier-lines">
              <div className={`badge-detail-tier-line1${row.done ? " badge-detail-tier-line1-reached" : ""}`}>
                {row.label}
              </div>
              <div className="badge-detail-tier-line2">{row.value}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
