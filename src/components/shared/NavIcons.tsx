const commonProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  className: "nav-icon",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function FixturesIcon() {
  return (
    <svg {...commonProps}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function AddressesIcon() {
  return (
    <svg {...commonProps}>
      <path d="M4 11l8-7 8 7M6 10v10h12V10" />
    </svg>
  );
}

export function StatsIcon() {
  return (
    <svg {...commonProps}>
      <path d="M5 20V11M12 20V4M19 20v-6" />
    </svg>
  );
}

export function BadgesIcon() {
  return (
    <svg {...commonProps}>
      <path d="M12 2l2.6 6.6L21 9.3l-5 4.7 1.3 7-5.3-3.6L6.7 21 8 14 3 9.3l6.4-.7L12 2z" />
    </svg>
  );
}

export function AccountIcon() {
  return (
    <svg {...commonProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg {...commonProps} className="nav-icon" width="18" height="18">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
