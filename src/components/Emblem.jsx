export default function Emblem({ size = 40, className = '' }) {
  return (
    <img
      src="/muniverse-logo.png"
      width={size}
      height={size}
      className={className}
      alt="MUNIVERSE logo"
      loading="eager"
      decoding="async"
      style={{ objectFit: 'contain' }}
    />
  );
}
