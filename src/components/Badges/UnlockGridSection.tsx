import type { UnlockItem } from "../../lib/badgeEngine";
import type { BadgeId } from "../../lib/badges";
import { googleSearchUrl } from "../../lib/format";
import { BadgeIcon } from "./BadgeIcons";

interface Props<T> {
  id: BadgeId;
  name: string;
  rule: string;
  items: UnlockItem<T>[];
  labelFor: (item: T) => string;
  variant: "passport" | "cathedral";
}

export function UnlockGridSection<T>({ id, name, rule, items, labelFor, variant }: Props<T>) {
  const earnedCount = items.filter((i) => i.unlocked).length;

  return (
    <div className="badge-card unlock-grid-card">
      <div className="badge-card-top">
        <BadgeIcon id={id} />
        <div className="badge-card-info">
          <div className="badge-card-name">{name}</div>
          <div className="badge-card-status">
            {earnedCount} of {items.length} earned
          </div>
        </div>
      </div>
      <p className="badge-detail-rule">{rule}</p>
      <div className={`unlock-grid unlock-grid-${variant}`}>
        {items.map((item) => {
          const chipClass = `unlock-chip unlock-chip-${variant} ${
            item.unlocked ? "unlock-chip-earned" : "unlock-chip-locked"
          }`;
          const label = labelFor(item.item);
          return item.unlocked && item.earningMatch ? (
            <a
              key={item.key}
              className={chipClass}
              href={googleSearchUrl(item.earningMatch)}
              target="_blank"
              rel="noreferrer"
            >
              {label}
            </a>
          ) : (
            <span key={item.key} className={chipClass}>
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
