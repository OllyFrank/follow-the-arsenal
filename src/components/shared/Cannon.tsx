interface CannonProps {
  /** The wheel's inner fill — must match whatever sits behind the icon. */
  wheelFill: string;
  size?: number;
}

/** Used for the attended toggle and (later) the Stats lap stamps. */
export function Cannon({ wheelFill, size = 30 }: CannonProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path
        d="M12 20L3.5 27"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <g transform="rotate(-18 14 16)" fill="currentColor">
        <rect x="5" y="11.5" width="21" height="7" rx="2.2" />
        <rect x="24.5" y="10.3" width="3.2" height="9.4" rx="1.2" />
        <circle cx="4.4" cy="15" r="1.9" />
      </g>
      <circle cx="12" cy="22" r="6.3" fill={wheelFill} stroke="currentColor" strokeWidth={2.2} />
      <path
        d="M12 16.9V27.1M6.9 22H17.1"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <circle cx="12" cy="22" r="1.7" fill="currentColor" />
    </svg>
  );
}
