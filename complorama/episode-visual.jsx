// Episode visual — square placeholder mimicking a collage/investigation aesthetic
// (high contrast, color blocks, silhouettes, document textures).
// Used when an episode has no real cover image yet.
// Each visual is square; real images are rendered at 1:1 via object-fit: cover.

const EV_PALETTES = [
  { a: '#7a1c1c', b: '#0d0d0d', c: '#d6b36a' }, // rouge profond / or
  { a: '#1a4a3a', b: '#0a0a0a', c: '#9ec9b3' }, // vert sombre / vert pâle
  { a: '#2a2f5a', b: '#0a0a14', c: '#c8a8d8' }, // bleu nuit / mauve
  { a: '#5a2a1c', b: '#1a0a08', c: '#e8a878' }, // sépia brûlé
  { a: '#3a3a3a', b: '#0a0a0a', c: '#d4d4d4' }, // gris dossier
  { a: '#6a1a3a', b: '#0a0a0a', c: '#e8b8c8' }, // bordeaux
  { a: '#1a3a4a', b: '#080a0c', c: '#b8d8e8' }, // teal sombre
  { a: '#4a3a1a', b: '#0c0a08', c: '#d8c898' }, // ocre archive
];

function evPalette(n) { return EV_PALETTES[n % EV_PALETTES.length]; }

function EpisodeVisual({ n }) {
  const variant = n % 8;
  const p = evPalette(n);
  const common = {
    width: '100%',
    height: '100%',
    display: 'block',
    position: 'absolute',
    inset: 0,
  };

  const grain = (
    <filter id={`g-${n}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={n} />
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0" />
    </filter>
  );

  if (variant === 0) {
    return (
      <svg viewBox="0 0 100 100" style={common} preserveAspectRatio="xMidYMid slice">
        <defs>{grain}</defs>
        <rect width="100" height="100" fill={p.b} />
        <circle cx="55" cy="42" r="22" fill={p.a} />
        <rect x="14" y="20" width="14" height="18" fill="none" stroke={p.c} strokeWidth="0.5" opacity="0.5" />
        <rect x="76" y="14" width="12" height="16" fill="none" stroke={p.c} strokeWidth="0.5" opacity="0.5" />
        <rect x="80" y="42" width="14" height="18" fill="none" stroke={p.c} strokeWidth="0.5" opacity="0.4" />
        <rect x="6" y="56" width="14" height="18" fill="none" stroke={p.c} strokeWidth="0.5" opacity="0.4" />
        <path d="M 38 100 L 38 78 Q 38 64 50 64 Q 62 64 62 78 L 62 100 Z" fill="#000" />
        <circle cx="50" cy="56" r="9" fill="#000" />
        <rect width="100" height="100" filter={`url(#g-${n})`} />
      </svg>
    );
  }

  if (variant === 1) {
    return (
      <svg viewBox="0 0 100 100" style={common} preserveAspectRatio="xMidYMid slice">
        <defs>{grain}</defs>
        <rect width="100" height="100" fill={p.a} />
        <ellipse cx="50" cy="34" rx="32" ry="6" fill={p.b} />
        <ellipse cx="50" cy="32" rx="20" ry="6" fill={p.c} opacity="0.85" />
        <polygon points="36,38 64,38 72,90 28,90" fill={p.c} opacity="0.18" />
        <rect x="42" y="74" width="3" height="14" fill={p.b} />
        <rect x="49" y="72" width="3" height="16" fill={p.b} />
        <rect x="56" y="74" width="3" height="14" fill={p.b} />
        <rect width="100" height="100" filter={`url(#g-${n})`} />
      </svg>
    );
  }

  if (variant === 2) {
    return (
      <svg viewBox="0 0 100 100" style={common} preserveAspectRatio="xMidYMid slice">
        <defs>{grain}</defs>
        <rect width="100" height="100" fill={p.a} />
        <polygon points="0,0 100,0 100,30 60,42 30,28 0,40" fill={p.b} />
        <polygon points="0,100 100,100 100,68 70,76 40,62 0,72" fill={p.c} opacity="0.35" />
        <circle cx="50" cy="50" r="14" fill={p.b} />
        <circle cx="50" cy="50" r="6" fill={p.c} />
        <rect width="100" height="100" filter={`url(#g-${n})`} />
      </svg>
    );
  }

  if (variant === 3) {
    return (
      <svg viewBox="0 0 100 100" style={common} preserveAspectRatio="xMidYMid slice">
        <defs>{grain}</defs>
        <rect width="100" height="100" fill={p.b} />
        <rect x="0" y="0" width="33" height="100" fill={p.a} />
        <rect x="33" y="0" width="34" height="100" fill={p.c} opacity="0.9" />
        <rect x="67" y="0" width="33" height="100" fill={p.a} opacity="0.8" />
        <path d="M 50 20 Q 62 22 62 38 L 62 56 Q 60 62 56 64 L 56 100 L 38 100 L 38 64 Q 38 50 42 42 Q 44 30 50 20 Z" fill="#000" opacity="0.85" />
        <rect width="100" height="100" filter={`url(#g-${n})`} />
      </svg>
    );
  }

  if (variant === 4) {
    return (
      <svg viewBox="0 0 100 100" style={common} preserveAspectRatio="xMidYMid slice">
        <defs>{grain}</defs>
        <rect width="100" height="100" fill={p.b} />
        <ellipse cx="50" cy="50" rx="40" ry="22" fill={p.c} />
        <circle cx="50" cy="50" r="16" fill={p.a} />
        <circle cx="50" cy="50" r="6" fill={p.b} />
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x="0" y={i * 7.4} width="100" height="0.8" fill="#000" opacity="0.18" />
        ))}
        <rect width="100" height="100" filter={`url(#g-${n})`} />
      </svg>
    );
  }

  if (variant === 5) {
    return (
      <svg viewBox="0 0 100 100" style={common} preserveAspectRatio="xMidYMid slice">
        <defs>{grain}</defs>
        <rect width="100" height="100" fill={p.b} />
        <g transform="rotate(-18 50 50)">
          <rect x="-20" y="40" width="140" height="20" fill={p.a} />
          <rect x="-20" y="40" width="140" height="20" fill="none" stroke={p.c} strokeWidth="0.4" strokeDasharray="2 2" />
        </g>
        <g stroke={p.c} strokeWidth="1" opacity="0.5">
          <line x1="14" y1="14" x2="22" y2="22" />
          <line x1="22" y1="14" x2="14" y2="22" />
          <line x1="78" y1="78" x2="86" y2="86" />
          <line x1="86" y1="78" x2="78" y2="86" />
        </g>
        <rect width="100" height="100" filter={`url(#g-${n})`} />
      </svg>
    );
  }

  if (variant === 6) {
    return (
      <svg viewBox="0 0 100 100" style={common} preserveAspectRatio="xMidYMid slice">
        <defs>{grain}</defs>
        <rect width="100" height="100" fill={p.a} />
        <rect x="0" y="0" width="100" height="40" fill={p.b} opacity="0.6" />
        <circle cx="50" cy="22" r="8" fill={p.c} />
        {[10, 26, 42, 58, 74, 90].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={70} r="6" fill="#000" />
            <path d={`M ${x - 10} 100 L ${x - 10} 82 Q ${x - 10} 76 ${x} 76 Q ${x + 10} 76 ${x + 10} 82 L ${x + 10} 100 Z`} fill="#000" />
          </g>
        ))}
        <rect width="100" height="100" filter={`url(#g-${n})`} />
      </svg>
    );
  }

  // variant 7 — typographic / symbolic
  return (
    <svg viewBox="0 0 100 100" style={common} preserveAspectRatio="xMidYMid slice">
      <defs>{grain}</defs>
      <rect width="100" height="100" fill={p.b} />
      <rect x="20" y="20" width="60" height="60" fill={p.a} />
      <text x="50" y="62" textAnchor="middle" fontFamily="Georgia, serif" fontSize="42" fontWeight="700" fill={p.c} fontStyle="italic">?</text>
      <rect x="20" y="20" width="60" height="60" fill="none" stroke={p.c} strokeWidth="0.4" strokeDasharray="2 2" />
      <rect width="100" height="100" filter={`url(#g-${n})`} />
    </svg>
  );
}

window.EpisodeVisual = EpisodeVisual;
