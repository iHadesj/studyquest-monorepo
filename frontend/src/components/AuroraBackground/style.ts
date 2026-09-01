import styled, { css, keyframes } from 'styled-components';
import { theme } from '../../style/theme';

const drift1 = keyframes`
  0%   { transform: translate(-12%, -8%) scale(1); }
  33%  { transform: translate(14%, 10%) scale(1.18); }
  66%  { transform: translate(-6%, 16%) scale(0.94); }
  100% { transform: translate(-12%, -8%) scale(1); }
`;

const drift2 = keyframes`
  0%   { transform: translate(10%, 6%) scale(1.06); }
  40%  { transform: translate(-14%, -10%) scale(0.9); }
  75%  { transform: translate(6%, -16%) scale(1.2); }
  100% { transform: translate(10%, 6%) scale(1.06); }
`;

const drift3 = keyframes`
  0%   { transform: translate(4%, 14%) scale(0.95); }
  50%  { transform: translate(-10%, -6%) scale(1.15); }
  100% { transform: translate(4%, 14%) scale(0.95); }
`;

export const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: radial-gradient(
      120% 90% at 50% 0%,
      ${theme.color.bgRaised} 0%,
      ${theme.color.bg} 45%,
      ${theme.color.bgDeep} 100%
    );
`;

export const Blob = styled.div<{ $variant: 'violet' | 'cyan' | 'pink' }>`
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  will-change: transform;

  ${({ $variant }) =>
    $variant === 'violet' &&
    css`
      top: -18%;
      left: -10%;
      width: 62vw;
      height: 62vw;
      max-width: 820px;
      max-height: 820px;
      background: radial-gradient(
        circle,
        rgba(124, 92, 255, 0.5) 0%,
        rgba(124, 92, 255, 0) 70%
      );
      animation: ${drift1} 26s ease-in-out infinite;
    `}

  ${({ $variant }) =>
    $variant === 'cyan' &&
    css`
      top: 8%;
      right: -16%;
      width: 54vw;
      height: 54vw;
      max-width: 720px;
      max-height: 720px;
      background: radial-gradient(
        circle,
        rgba(34, 211, 238, 0.34) 0%,
        rgba(34, 211, 238, 0) 70%
      );
      animation: ${drift2} 32s ease-in-out infinite;
    `}

  ${({ $variant }) =>
    $variant === 'pink' &&
    css`
      bottom: -22%;
      left: 22%;
      width: 50vw;
      height: 50vw;
      max-width: 680px;
      max-height: 680px;
      background: radial-gradient(
        circle,
        rgba(244, 114, 182, 0.28) 0%,
        rgba(244, 114, 182, 0) 70%
      );
      animation: ${drift3} 38s ease-in-out infinite;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Grid = styled.div`
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.028) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.028) 1px, transparent 1px);
  background-size: 56px 56px;
  /* A grade some nas bordas pra não brigar com o conteúdo. */
  mask-image: radial-gradient(120% 80% at 50% 30%, #000 25%, transparent 78%);
  -webkit-mask-image: radial-gradient(
    120% 80% at 50% 30%,
    #000 25%,
    transparent 78%
  );
`;

/* Grão em SVG inline: quebra o banding do blur sem custo de imagem. */
export const Grain = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.16;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
`;

export const Vignette = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(
    120% 100% at 50% 40%,
    transparent 40%,
    rgba(0, 0, 0, 0.55) 100%
  );
`;
