// Tokens de design do StudyQuest.
//
// Fonte única de cor, sombra, raio e curva de animação. Qualquer valor novo
// entra aqui antes de ser usado numa tela, pra interface continuar parecendo
// uma coisa só.

export const theme = {
  color: {
    // Fundo em camadas, do mais profundo ao mais próximo do olho.
    bg: '#0B0B14',
    bgDeep: '#07070E',
    bgRaised: '#12121F',

    // Superfícies de vidro: sempre sobre o fundo, nunca cor sólida.
    glass: 'rgba(255, 255, 255, 0.045)',
    glassStrong: 'rgba(255, 255, 255, 0.075)',
    stroke: 'rgba(255, 255, 255, 0.09)',
    strokeStrong: 'rgba(255, 255, 255, 0.16)',

    text: '#ECEDF3',
    textMuted: '#A0A3B1',
    textFaint: '#6B6E80',

    primary: '#7C5CFF',
    primarySoft: '#9B84FF',
    cyan: '#22D3EE',
    pink: '#F472B6',
    success: '#34D399',
    warn: '#FBBF24',
    danger: '#FB7185',

    gold: '#F5C542',
    silver: '#C6CEDA',
    bronze: '#D08A5A',
  },

  gradient: {
    primary: 'linear-gradient(135deg, #7C5CFF 0%, #22D3EE 100%)',
    hot: 'linear-gradient(135deg, #F472B6 0%, #FBBF24 100%)',
    success: 'linear-gradient(135deg, #34D399 0%, #22D3EE 100%)',
    gold: 'linear-gradient(135deg, #F5C542 0%, #FF9E45 100%)',
    silver: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)',
    bronze: 'linear-gradient(135deg, #E0A06A 0%, #A9603A 100%)',
    // Brilho que atravessa barras de progresso e botões.
    sheen:
      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)',
  },

  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.35)',
    md: '0 8px 24px rgba(0, 0, 0, 0.45)',
    lg: '0 20px 48px rgba(0, 0, 0, 0.55)',
    glowPrimary: '0 0 0 1px rgba(124, 92, 255, 0.35), 0 8px 32px rgba(124, 92, 255, 0.28)',
    glowCyan: '0 0 0 1px rgba(34, 211, 238, 0.35), 0 8px 32px rgba(34, 211, 238, 0.25)',
  },

  radius: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '28px',
    pill: '999px',
  },

  // Curvas nomeadas: 'out' pra entrada de conteúdo, 'spring' pra interação.
  ease: {
    out: 'cubic-bezier(0.22, 1, 0.36, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  font: {
    // Inter para toda a interface: o monoespaçado em tudo dava ar de terminal,
    // não de plataforma de estudo.
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    // Reservado para código, fórmulas e números que precisam alinhar.
    mono: "'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace",
  },

  layout: {
    maxWidth: '1240px',
  },
} as const;

export type Theme = typeof theme;
