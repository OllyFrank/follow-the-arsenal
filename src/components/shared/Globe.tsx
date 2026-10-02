interface Props {
  /** "navy" for the Stats hero (and future navy grounds); "red" for the red welcome screen. */
  variant: "navy" | "red";
  className?: string;
}

/** Decorative only. Copied from the design handoff's Main/Stats reference mockups. */
export function Globe({ variant, className }: Props) {
  if (variant === "navy") {
    return (
      <svg aria-hidden="true" viewBox="0 0 200 200" className={className}>
        <circle cx="100" cy="100" r="84" fill="none" stroke="var(--navy-line)" strokeWidth={2} />
        <ellipse cx="100" cy="100" rx="32" ry="84" fill="none" stroke="var(--navy-line)" strokeWidth={2} />
        <ellipse cx="100" cy="100" rx="62" ry="84" fill="none" stroke="var(--navy-line)" strokeWidth={2} />
        <path
          d="M100 16V184M16 100H184M27 58H173M27 142H173"
          fill="none"
          stroke="var(--navy-line)"
          strokeWidth={2}
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 420 420" className={className}>
      <circle cx="210" cy="210" r="150" fill="var(--red-deep)" stroke="var(--red-dark)" strokeWidth={2} />
      <ellipse cx="210" cy="210" rx="55" ry="150" fill="none" stroke="var(--red-dark)" strokeWidth={2} />
      <ellipse cx="210" cy="210" rx="110" ry="150" fill="none" stroke="var(--red-dark)" strokeWidth={2} />
      <path
        d="M210 60V360M60 210H360M80 135H340M80 285H340"
        fill="none"
        stroke="var(--red-dark)"
        strokeWidth={2}
      />
      <ellipse
        cx="210"
        cy="210"
        rx="200"
        ry="64"
        transform="rotate(-24 210 210)"
        fill="none"
        stroke="var(--gold)"
        strokeWidth={3}
        strokeDasharray="1 10"
        strokeLinecap="round"
      />
      <circle cx="64.8" cy="309.7" r="9" fill="var(--white)" stroke="var(--navy)" strokeWidth={4} />
    </svg>
  );
}
