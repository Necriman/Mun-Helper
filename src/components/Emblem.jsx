/**
 * Original circular seal — globe meridians framed by laurel-inspired
 * branches, evoking diplomatic/institutional emblems without reproducing
 * any protected organization's actual mark.
 */
export default function Emblem({ size = 40, className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Mun Helper emblem"
    >
      <circle cx="32" cy="32" r="31" fill="#0F3355" />
      <circle cx="32" cy="32" r="27" fill="none" stroke="#B08D2E" strokeWidth="1.2" />
      <g fill="none" stroke="#EEF5FC" strokeWidth="1.1" opacity="0.9">
        <ellipse cx="32" cy="32" rx="10" ry="18" />
        <ellipse cx="32" cy="32" rx="18" ry="10" />
        <line x1="14" y1="32" x2="50" y2="32" />
      </g>
      <g fill="none" stroke="#D4AF5F" strokeWidth="1.6" strokeLinecap="round">
        <path d="M20 44 C16 40 15 34 17 27" />
        <path d="M18 30 L21.5 30.5 M17.3 34.5 L21 34.8 M17.4 39 L21 38.6" />
        <path d="M44 44 C48 40 49 34 47 27" />
        <path d="M46 30 L42.5 30.5 M46.7 34.5 L43 34.8 M46.6 39 L43 38.6" />
      </g>
    </svg>
  );
}
