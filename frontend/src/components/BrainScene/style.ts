import styled, { keyframes } from 'styled-components';
import { theme } from '../../style/theme';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-10px); }
`;

export const Wrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  animation: ${float} 9s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

/**
 * O brilho é CSS, não pós-processamento. Um bloom em WebGL custaria dezenas de
 * KB no chunk e mais um passe de render por frame, para um ganho que este
 * degradê entrega de graça.
 */
export const Glow = styled.div`
  position: absolute;
  inset: -12%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 45%,
    ${theme.color.primary}3d 0%,
    ${theme.color.cyan}1a 42%,
    transparent 68%
  );
  filter: blur(28px);
  pointer-events: none;
`;

export const Canvas = styled.canvas<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 700ms ${theme.ease.out};
  cursor: grab;
  touch-action: pan-y;

  &:active {
    cursor: grabbing;
  }
`;
