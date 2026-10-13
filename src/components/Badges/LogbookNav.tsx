import type { LogbookPageId } from "../../hooks/useLogbookPage";

const PAGES: { id: LogbookPageId; label: string }[] = [
  { id: "att", label: "Attendance" },
  { id: "grd", label: "Grounds" },
  { id: "eur", label: "Europe" },
  { id: "his", label: "History" },
];

interface Props {
  activePage: LogbookPageId;
  counts: Record<LogbookPageId, number>;
}

/** Mobile: divider tabs below the title row, one page shown at a time. */
export function LogbookTabs({ activePage, counts }: Props) {
  return (
    <nav aria-label="Logbook sections" className="badges-tabs">
      {PAGES.map(({ id, label }) => {
        const active = id === activePage;
        return (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active ? "page" : undefined}
            className={`badges-tab${active ? " badges-tab-active" : ""}`}
          >
            <span className="badges-tab-label">{label}</span>
            <span className="badges-tab-count">{counts[id]}</span>
          </a>
        );
      })}
    </nav>
  );
}

/** Desktop: every page is stacked at once, these just jump-scroll to one. */
export function LogbookJumpLinks({ counts }: Omit<Props, "activePage">) {
  return (
    <nav aria-label="Logbook sections" className="badges-jumplinks">
      {PAGES.map(({ id, label }) => (
        <a key={id} href={`#${id}`} className="badges-jumplink">
          {label} <span className="badges-jumplink-count">{counts[id]}</span>
        </a>
      ))}
    </nav>
  );
}
