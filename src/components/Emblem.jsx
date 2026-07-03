/**
 * Mun Helper's own UN-inspired seal: globe grid, laurel branches and a small
 * chair gavel. It references diplomatic visual language without reproducing
 * the official United Nations emblem.
 */
export default function Emblem({ size = 40, className = '' }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Mun Helper diplomatic seal"
    >
      <defs>
        <radialGradient id="mh-seal-bg" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#6DB7E8" />
          <stop offset="58%" stopColor="#3B82C4" />
          <stop offset="100%" stopColor="#0F3355" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#mh-seal-bg)" />
      <circle cx="40" cy="40" r="33" fill="none" stroke="#EEF5FC" strokeWidth="1.4" opacity="0.95" />

      <g fill="none" stroke="#EAF5FF" strokeWidth="1.2" opacity="0.9">
        <circle cx="40" cy="38" r="18" />
        <ellipse cx="40" cy="38" rx="8" ry="18" />
        <ellipse cx="40" cy="38" rx="18" ry="7.5" />
        <path d="M22 38h36M40 20v36" />
      </g>

      <g fill="none" stroke="#F3E6C2" strokeLinecap="round" strokeWidth="2">
        <path d="M22 59c-8-7-10-18-6-29" />
        <path d="M17 36l7 1M17 43l7-.5M20 50l6-2" />
        <path d="M58 59c8-7 10-18 6-29" />
        <path d="M63 36l-7 1M63 43l-7-.5M60 50l-6-2" />
      </g>

      <g transform="translate(31 48) rotate(-32 9 6)" fill="#F8F1D8" stroke="#0A2038" strokeWidth="1.2">
        <rect x="0.5" y="4" width="21" height="4.5" rx="1.6" />
        <rect x="14" y="0.5" width="7" height="11" rx="2" />
        <path d="M7 8.5v9" strokeLinecap="round" />
      </g>

      <text
        x="40"
        y="69"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="7"
        fontWeight="700"
        fill="#F8F1D8"
        letterSpacing="1"
      >
        MUN
      </text>
    </svg>
  );
}
