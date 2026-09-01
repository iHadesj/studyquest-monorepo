import { theme } from '../../style/theme';

/**
 * Pôster estático do cérebro: SVG puro, sem JS, pintado no primeiro frame.
 *
 * É ele quem aparece enquanto (ou no lugar de) a cena WebGL. Em mobile, com
 * prefers-reduced-motion ou em aparelho fraco, o pôster fica e nenhum byte do
 * three é baixado — o 3D nunca é o que segura a primeira pintura.
 */
export function BrainPoster({ hidden }: { hidden?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: hidden ? 0 : 1,
        transition: 'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <defs>
        <radialGradient id="poster-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={theme.color.primary} stopOpacity="0.5" />
          <stop offset="100%" stopColor={theme.color.primary} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="poster-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.color.primarySoft} />
          <stop offset="55%" stopColor={theme.color.cyan} />
          <stop offset="100%" stopColor={theme.color.pink} />
        </linearGradient>
      </defs>

      <circle cx="100" cy="92" r="78" fill="url(#poster-glow)" />

      <g
        fill="none"
        stroke="url(#poster-stroke)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      >
        {/* Silhueta dos dois hemisférios. */}
        <path d="M100 34c-16-10-38-6-48 8-12 3-20 14-19 27-8 8-9 21-2 30-3 12 5 24 17 27 7 10 21 13 32 8 6 4 14 5 20 2" />
        <path d="M100 34c16-10 38-6 48 8 12 3 20 14 19 27 8 8 9 21 2 30 3 12-5 24-17 27-7 10-21 13-32 8-6 4-14 5-20 2" />
        {/* Fissura central. */}
        <path d="M100 34v102" strokeOpacity="0.55" />
        {/* Sulcos. */}
        <path d="M74 56c10 4 12 16 6 23M62 84c11 1 17 10 15 19M88 70c-8 5-9 15-3 21M126 56c-10 4-12 16-6 23M138 84c-11 1-17 10-15 19M112 70c8 5 9 15 3 21" strokeOpacity="0.5" />
        {/* Tronco encefálico. */}
        <path d="M96 138c1 10-2 18-8 24M104 138c-1 10 2 18 8 24" strokeOpacity="0.6" />
      </g>

      {/* Nós sinápticos. */}
      <g fill={theme.color.cyan}>
        <circle cx="74" cy="56" r="2.2" opacity="0.9" />
        <circle cx="126" cy="56" r="2.2" opacity="0.75" />
        <circle cx="62" cy="84" r="2" opacity="0.7" />
        <circle cx="138" cy="84" r="2" opacity="0.85" />
        <circle cx="88" cy="112" r="1.8" opacity="0.65" />
        <circle cx="115" cy="120" r="1.8" opacity="0.8" />
      </g>
    </svg>
  );
}
