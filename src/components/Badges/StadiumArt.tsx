// The 12 Cathedrals of Football line drawings, copied verbatim from
// design-handoff/reference/StadiumCard.dc.html — one generic illustration
// per ground, no club crests or kit marks, per CLAUDE.md. Shared style: a
// 200x118 viewBox, a ground line at y=104, white 2px strokes, gold #e9c877
// accents and #0a2448 fills on a #0e2f5c sky (Allianz Arena's shell uses
// #2a0f2a and Signal Iduna Park's pylons use #f5c84c instead).
import type { StadiumArtId } from "../../lib/badgeCardConfig";

const commonSvgProps = {
  "aria-hidden": true as const,
  viewBox: "0 0 200 118",
  preserveAspectRatio: "xMidYMax meet",
  style: { width: "100%", height: "100%" },
};

const ART: Record<StadiumArtId, React.JSX.Element> = {
  sansiro: (
    <svg {...commonSvgProps}>
      <circle cx="100" cy="12" r="6" fill="#e9c877" />
      <rect x="34" y="48" width="132" height="56" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path d="M34 64H166M34 80H166" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />
      <rect x="18" y="30" width="16" height="74" rx="8" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <rect x="64" y="30" width="16" height="74" rx="8" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <rect x="120" y="30" width="16" height="74" rx="8" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <rect x="166" y="30" width="16" height="74" rx="8" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path
        d="M18 46l16-8M18 62l16-8M18 78l16-8M18 94l16-8M64 46l16-8M64 62l16-8M64 78l16-8M64 94l16-8M120 46l16-8M120 62l16-8M120 78l16-8M120 94l16-8M166 46l16-8M166 62l16-8M166 78l16-8M166 94l16-8"
        stroke="#ffffff"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <rect x="16" y="20" width="168" height="10" fill="none" stroke="#db0007" strokeWidth="3" />
      <path
        d="M16 30L30 20L44 30L58 20L72 30L86 20L100 30L114 20L128 30L142 20L156 30L170 20L184 30"
        fill="none"
        stroke="#db0007"
        strokeWidth="2"
      />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
  amsterdam: (
    <svg {...commonSvgProps}>
      <circle cx="34" cy="22" r="7" fill="#e9c877" />
      <path d="M22 104V58h156v46" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path
        d="M42 62V104M62 62V104M82 62V104M102 62V104M122 62V104M142 62V104M162 62V104"
        stroke="#ffffff"
        strokeWidth="1.2"
        opacity="0.45"
      />
      <path d="M18 58Q100 18 182 58" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M30 58Q100 28 170 58" fill="none" stroke="#e9c877" strokeWidth="2" />
      <rect x="78" y="36" width="44" height="8" rx="2" fill="#061a36" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
  bernabeu: (
    <svg {...commonSvgProps}>
      <circle cx="100" cy="14" r="7" fill="#e9c877" />
      <rect x="40" y="38" width="120" height="66" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path d="M40 54H160M40 70H160M40 86H160" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />
      <rect x="20" y="26" width="22" height="78" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <rect x="158" y="26" width="22" height="78" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path
        d="M20 40l22 10M20 56l22 10M20 72l22 10M20 88l22 10M158 40l22 10M158 56l22 10M158 72l22 10M158 88l22 10"
        stroke="#e9c877"
        strokeWidth="1.5"
      />
      <path d="M16 26H184" stroke="#ffffff" strokeWidth="3" />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
  stadedefrance: (
    <svg {...commonSvgProps}>
      <circle cx="30" cy="20" r="7" fill="#e9c877" />
      <path d="M16 104L28 78H172L184 104" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path d="M24 34V78M62 30V78M100 28V78M138 30V78M176 34V78" stroke="#ffffff" strokeWidth="1.5" />
      <path
        d="M24 34L40 52M62 30L78 50M100 28L116 49M138 30L154 50M176 34L160 52"
        stroke="#ffffff"
        strokeWidth="1"
        opacity="0.7"
      />
      <ellipse cx="100" cy="56" rx="92" ry="11" fill="#c99b3f" fillOpacity="0.3" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
  dragao: (
    <svg {...commonSvgProps}>
      <circle cx="170" cy="20" r="7" fill="#e9c877" />
      <path d="M14 104L24 74H176L186 104" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path d="M50 52V74M75 46V74M100 44V74M125 46V74M150 52V74" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
      <path d="M30 62C60 40 140 40 170 62" fill="none" stroke="#e9c877" strokeWidth="1.5" />
      <path d="M12 76C40 38 160 38 188 76" fill="none" stroke="#ffffff" strokeWidth="3" />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
  olimpico: (
    <svg {...commonSvgProps}>
      <circle cx="150" cy="22" r="7" fill="#e9c877" />
      <path d="M0 80C40 50 90 46 130 64S190 70 200 66V104H0Z" fill="#0a2448" />
      <path d="M34 104L42 80H158L166 104" fill="#0e2f5c" stroke="#ffffff" strokeWidth="2" />
      <path d="M38 72H162" stroke="#ffffff" strokeWidth="3" />
      <path d="M44 72V80M100 72V80M156 72V80" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M18 104V78M184 104V80" stroke="#e9c877" strokeWidth="2" />
      <ellipse cx="18" cy="74" rx="16" ry="6" fill="#2e6b3f" stroke="#ffffff" strokeWidth="1.2" />
      <ellipse cx="184" cy="76" rx="15" ry="6" fill="#2e6b3f" stroke="#ffffff" strokeWidth="1.2" />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
  campnou: (
    <svg {...commonSvgProps}>
      <circle cx="168" cy="20" r="7" fill="#e9c877" />
      <path d="M8 104L20 52H180L192 104" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path d="M17 66H183M14 80H186M11 93H189" stroke="#ffffff" strokeWidth="1.4" opacity="0.55" />
      <path d="M58 52L66 41H134L142 52" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M76 41V52M100 41V52M124 41V52" stroke="#e9c877" strokeWidth="1.2" />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
  metropolitano: (
    <svg {...commonSvgProps}>
      <circle cx="30" cy="22" r="7" fill="#e9c877" />
      <path d="M14 104L22 72H178L186 104" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path d="M60 67V72M100 57V72M140 46V72M176 37V72" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" />
      <path d="M22 74C60 68 120 50 184 40" fill="none" stroke="#e9c877" strokeWidth="1.5" />
      <path d="M10 74C50 66 120 40 190 30" fill="none" stroke="#ffffff" strokeWidth="3" />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
  allianz: (
    <svg {...commonSvgProps}>
      <circle cx="170" cy="20" r="7" fill="#e9c877" />
      <rect x="22" y="40" width="156" height="64" rx="30" fill="#2a0f2a" stroke="#ffffff" strokeWidth="2.5" />
      <path
        d="M36 58 L44 48 L52 58 L60 48 L68 58 L76 48 L84 58 L92 48 L100 58 L108 48 L116 58 L124 48 L132 58 L140 48 L148 58 L156 48 L164 58 M36 58 L44 68 L52 58 L60 68 L68 58 L76 68 L84 58 L92 68 L100 58 L108 68 L116 58 L124 68 L132 58 L140 68 L148 58 L156 68 L164 58 M36 78 L44 68 L52 78 L60 68 L68 78 L76 68 L84 78 L92 68 L100 78 L108 68 L116 78 L124 68 L132 78 L140 68 L148 78 L156 68 L164 78 M36 78 L44 88 L52 78 L60 88 L68 78 L76 88 L84 78 L92 88 L100 78 L108 88 L116 78 L124 88 L132 78 L140 88 L148 78 L156 88 L164 78 M36 98 L44 88 L52 98 L60 88 L68 98 L76 88 L84 98 L92 88 L100 98 L108 88 L116 98 L124 88 L132 98 L140 88 L148 98 L156 88 L164 98"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.1"
        opacity="0.75"
      />
      <path d="M40 40C70 30 130 30 160 40" fill="none" stroke="#e9c877" strokeWidth="1.5" />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
  signaliduna: (
    <svg {...commonSvgProps}>
      <circle cx="30" cy="20" r="7" fill="#e9c877" />
      <path d="M14 104V64H186V104" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path d="M14 78H186M14 91H186" stroke="#ffffff" strokeWidth="1.3" opacity="0.5" />
      <path
        d="M36 22L22 62M36 22L50 62M78 22L64 62M78 22L92 62M122 22L108 62M122 22L136 62M164 22L150 62M164 22L178 62"
        stroke="#ffffff"
        strokeWidth="0.9"
        opacity="0.7"
      />
      <path d="M36 20V66M78 20V66M122 20V66M164 20V66" stroke="#f5c84c" strokeWidth="4" strokeLinecap="round" />
      <path d="M10 64H190" stroke="#ffffff" strokeWidth="3" />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
  parcdesprinces: (
    <svg {...commonSvgProps}>
      <circle cx="168" cy="20" r="7" fill="#e9c877" />
      <path d="M14 104L22 80H178L186 104" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path
        d="M26 96Q19 72 27 48 M36 96Q29 72 37 48 M46 96Q39 72 47 48 M56 96Q49 72 57 48 M66 96Q59 72 67 48 M76 96Q69 72 77 48 M86 96Q79 72 87 48 M96 96Q89 72 97 48 M106 96Q99 72 107 48 M116 96Q109 72 117 48 M126 96Q119 72 127 48 M136 96Q129 72 137 48 M146 96Q139 72 147 48 M156 96Q149 72 157 48 M166 96Q159 72 167 48 M176 96Q169 72 177 48"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
      />
      <path d="M20 48H178" stroke="#e9c877" strokeWidth="1.5" />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
  celticpark: (
    <svg {...commonSvgProps}>
      <circle cx="30" cy="20" r="7" fill="#e9c877" />
      <rect x="20" y="44" width="160" height="60" fill="#0a2448" stroke="#ffffff" strokeWidth="2" />
      <path d="M20 62H180M20 80H180" stroke="#ffffff" strokeWidth="1.3" opacity="0.5" />
      <path d="M16 32L28 40H172L184 32" fill="none" stroke="#e9c877" strokeWidth="1.5" />
      <path
        d="M40 40L52 32M76 40L88 32M112 40L124 32M148 40L160 32"
        stroke="#e9c877"
        strokeWidth="1"
      />
      <path d="M14 42H186" stroke="#ffffff" strokeWidth="3" />
      <path d="M0 104H200" stroke="#ffffff" strokeWidth="2" />
    </svg>
  ),
};

export function StadiumArt({ art }: { art: StadiumArtId }) {
  return ART[art];
}

export function EmptyStadiumIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="46"
      height="46"
      fill="none"
      stroke="#9aa3ad"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="9" rx="9" ry="3.5" />
      <path d="M3 9v6c0 2 4 3.5 9 3.5s9-1.5 9-3.5V9" />
      <path d="M8 12.2v5.6M12 12.5v6M16 12.2v5.6" />
    </svg>
  );
}
