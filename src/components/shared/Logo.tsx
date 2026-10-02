interface LogoProps {
  variant: "long" | "compact";
  tone: "onRed" | "onLight";
  width: number;
  height: number;
}

const TONE_COLORS = {
  onRed: {
    body: "var(--white)",
    bar: "var(--red)",
    line: "var(--navy)",
    lead: "var(--navy)",
    name: "var(--red)",
  },
  onLight: {
    body: "var(--red)",
    bar: "var(--white)",
    line: "var(--gold)",
    lead: "var(--white)",
    name: "var(--white)",
  },
} as const;

/**
 * The app's wordmark: a football bar scarf with tassels. See
 * design-handoff/HANDOFF.md ("Shared pieces > Logo: the scarf") for the
 * source markup this is built from. No crest or club mark — original
 * drawing only.
 */
export function Logo({ variant, tone, width, height }: LogoProps) {
  const c = TONE_COLORS[tone];

  if (variant === "compact") {
    return (
      <svg
        role="img"
        aria-label="We All Follow The Arsenal"
        viewBox="0 0 400 120"
        width={width}
        height={height}
      >
        <path
          d="M0 12H22M0 28H22M0 44H22M0 60H22M0 76H22M0 92H22M0 108H22M378 12H400M378 28H400M378 44H400M378 60H400M378 76H400M378 92H400M378 108H400"
          fill="none"
          stroke={c.body}
          strokeWidth={8}
          strokeLinecap="round"
        />
        <rect x="20" y="0" width="360" height="120" fill={c.body} />
        <rect x="34" y="0" width="12" height="120" fill={c.bar} />
        <rect x="354" y="0" width="12" height="120" fill={c.bar} />
        <text
          x="200"
          y="48"
          textAnchor="middle"
          fontSize="27"
          fontWeight="700"
          fill={c.lead}
          textLength="246"
          lengthAdjust="spacingAndGlyphs"
          style={{ fontFamily: "var(--font-label)" }}
        >
          WE ALL FOLLOW
        </text>
        <text
          x="200"
          y="94"
          textAnchor="middle"
          fontSize="38"
          fill={c.name}
          textLength="276"
          lengthAdjust="spacingAndGlyphs"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          THE ARSENAL
        </text>
      </svg>
    );
  }

  return (
    <svg
      role="img"
      aria-label="We All Follow The Arsenal"
      viewBox="0 0 720 120"
      width={width}
      height={height}
    >
      <path
        d="M0 12H26M0 28H26M0 44H26M0 60H26M0 76H26M0 92H26M0 108H26M694 12H720M694 28H720M694 44H720M694 60H720M694 76H720M694 92H720M694 108H720"
        fill="none"
        stroke={c.body}
        strokeWidth={8}
        strokeLinecap="round"
      />
      <rect x="24" y="0" width="672" height="120" fill={c.body} />
      <rect x="44" y="0" width="16" height="120" fill={c.bar} />
      <rect x="70" y="0" width="16" height="120" fill={c.bar} />
      <rect x="634" y="0" width="16" height="120" fill={c.bar} />
      <rect x="660" y="0" width="16" height="120" fill={c.bar} />
      <rect x="106" y="12" width="508" height="4" fill={c.line} />
      <rect x="106" y="104" width="508" height="4" fill={c.line} />
      <text
        x="360"
        y="72"
        textAnchor="middle"
        fontSize="33"
        textLength="492"
        lengthAdjust="spacingAndGlyphs"
      >
        <tspan fill={c.lead} fontWeight="700" style={{ fontFamily: "var(--font-label)" }}>
          WE ALL FOLLOW{" "}
        </tspan>
        <tspan fill={c.name} style={{ fontFamily: "var(--font-heading)" }}>
          THE ARSENAL
        </tspan>
      </text>
    </svg>
  );
}
