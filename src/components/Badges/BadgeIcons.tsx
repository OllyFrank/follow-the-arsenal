// The badge logbook's own icon set, copied from design-handoff/reference/
// BadgeCard.dc.html (24x24 viewBox, 2px stroke, round caps, white on the
// emblem disc). No club crests, logos or kit marks, per CLAUDE.md.

export type BadgeIconId =
  | "ticket"
  | "ball"
  | "hourglass"
  | "home"
  | "coach"
  | "stadium"
  | "ghost"
  | "plane";

const commonProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  width: 26,
  height: 26,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const PATHS: Record<BadgeIconId, React.JSX.Element> = {
  ticket: (
    <>
      <path d="M3 9V6h18v3a3 3 0 0 0 0 6v3H3v-3a3 3 0 0 0 0-6z" />
      <path d="M14 6v12" strokeDasharray="2 2.5" />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5l4 2.9-1.5 4.7h-5L8 10.4z" />
      <path d="M12 3v4.5M20.5 9.5l-4.5.9M17.5 19.5l-3-4.4M6.5 19.5l3-4.4M3.5 9.5l4.5.9" />
    </>
  ),
  hourglass: (
    <>
      <path d="M6 3h12M6 21h12" />
      <path d="M8 3c0 6 8 5 8 9s-8 3-8 9M16 3c0 6-8 5-8 9s8 3 8 9" />
    </>
  ),
  home: (
    <>
      <path d="M4 11l8-7 8 7M6 10v10h12V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  coach: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M3 11h18M8 5v6M16 5v6M7 17v2M17 17v2" />
    </>
  ),
  stadium: (
    <>
      <ellipse cx="12" cy="9" rx="9" ry="3.5" />
      <path d="M3 9v6c0 2 4 3.5 9 3.5s9-1.5 9-3.5V9" />
      <path d="M8 12.2v5.6M12 12.5v6M16 12.2v5.6" />
    </>
  ),
  ghost: (
    <>
      <path d="M6 20V10a6 6 0 0 1 12 0v10l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5z" />
      <circle cx="10" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  plane: (
    <path d="M12 2.5c1 0 1.6 1 1.6 2.5v4.6l7.4 4.2v2l-7.4-2.2v4.6l2.4 1.8v1.7L12 20.6l-4 1.1v-1.7l2.4-1.8v-4.6L3 15.8v-2l7.4-4.2V5c0-1.5.6-2.5 1.6-2.5z" />
  ),
};

export function BadgeIcon({ icon }: { icon: BadgeIconId }) {
  return <svg {...commonProps}>{PATHS[icon]}</svg>;
}
