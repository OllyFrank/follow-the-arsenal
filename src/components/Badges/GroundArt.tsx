// Generic line-art drawings of Highbury's East Stand and the Emirates'
// curved facade, copied from design-handoff/reference/Badges-Grounds.dc.html
// — no club crests or kit marks, per CLAUDE.md.

export function HighburyArt() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 64" style={{ width: "100%", height: "100%" }}>
      <circle cx="106" cy="11" r="4.5" fill="#e9c877" />
      <path d="M30 28V13M90 28V13" stroke="#ffffff" strokeWidth="1.2" />
      <path d="M30.6 13h7l-2 2.5 2 2.5h-7zM90.6 13h7l-2 2.5 2 2.5h-7z" fill="#db0007" />
      <rect x="6" y="28" width="108" height="28" fill="#f4f1e8" />
      <path d="M44 56V22H49V18H54V14H66V18H71V22H76V56Z" fill="#ffffff" />
      <path d="M12 31.5H38M82 31.5H108" stroke="#c99b3f" strokeWidth="1" />
      <path
        d="M10 37H40M80 37H110M10 44H40M80 44H110M10 51H40M80 51H110"
        stroke="#0e2f5c"
        strokeWidth="2.2"
      />
      <path d="M52 23V39M56 19V39M60 15V39M64 19V39M68 23V39" stroke="#0e2f5c" strokeWidth="1.4" />
      <rect x="40" y="41" width="40" height="3" fill="#c99b3f" />
      <rect x="50" y="45" width="20" height="11" fill="#0e2f5c" />
      <path d="M55 45V56M60 45V56M65 45V56" stroke="#f4f1e8" strokeWidth="0.8" />
      <path d="M0 56H120" stroke="#ffffff" strokeWidth="1.8" />
    </svg>
  );
}

export function EmiratesArt() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 64" style={{ width: "100%", height: "100%" }}>
      <circle cx="16" cy="11" r="4.5" fill="#e9c877" />
      <path
        d="M30 26L38 19L46 25L54 18L62 25L70 18L78 25L86 19L92 26"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.1"
      />
      <path
        d="M14 33C26 26 36 24 46 26C54 27.5 66 27.5 74 26C84 24 94 26 106 33"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
      />
      <path
        d="M10 56V36C30 31 50 29 60 29C70 29 90 31 110 36V56Z"
        fill="#0a2448"
        stroke="#ffffff"
        strokeWidth="1.8"
      />
      <path
        d="M20 49V35M30 49V33M40 49V31.5M50 49V30.5M60 49V30M70 49V30.5M80 49V31.5M90 49V33M100 49V35"
        stroke="#ffffff"
        strokeWidth="0.8"
        opacity="0.55"
      />
      <path
        d="M9 36C30 30 50 28.5 60 28.5C70 28.5 90 30 111 36"
        fill="none"
        stroke="#c99b3f"
        strokeWidth="2"
      />
      <rect x="10" y="50" width="100" height="4" fill="#db0007" />
      <path d="M0 56H120" stroke="#ffffff" strokeWidth="1.8" />
    </svg>
  );
}
