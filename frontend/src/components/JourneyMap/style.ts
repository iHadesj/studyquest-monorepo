import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../style/theme';

const haloPulse = keyframes`
  0%   { transform: scale(0.92); opacity: 0.6; }
  70%  { transform: scale(1.35); opacity: 0; }
  100% { transform: scale(1.35); opacity: 0; }
`;

const dashFlow = keyframes`
  to { stroke-dashoffset: -28; }
`;

export const MapWrapper = styled.div`
  position: relative;
  width: 100%;
`;

/* A trilha em si, desenhada atrás dos nós. */
export const Connector = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 0;
  overflow: visible;

  .trilha-base {
    fill: none;
    stroke: ${theme.color.stroke};
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 2 14;
    animation: ${dashFlow} 1.6s linear infinite;
  }

  .trilha-feita {
    fill: none;
    stroke: url(#gradiente-trilha);
    stroke-width: 4;
    stroke-linecap: round;
    filter: drop-shadow(0 0 8px rgba(124, 92, 255, 0.5));
  }

  @media (prefers-reduced-motion: reduce) {
    .trilha-base {
      animation: none;
    }
  }
`;

/**
 * O posicionamento fica num elemento comum, separado do que anima. O
 * framer-motion escreve `transform` inline, o que apagava o translateX(-50%)
 * daqui e desalinhava todas as paradas.
 *
 * O width: max-content também é necessário: um absoluto em left:50% só recebe
 * metade do container como espaço disponível e transborda em vez de centralizar.
 */
export const EntrySlot = styled.div`
  position: absolute;
  width: max-content;
  transform: translateX(-50%);
  z-index: 1;
`;

export const EntryInner = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* ------------------------------------------------------------- Região -- */

export const RegionBanner = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  white-space: nowrap;

  .traco {
    width: clamp(24px, 8vw, 76px);
    height: 1px;
    background: linear-gradient(90deg, transparent, ${theme.color.stroke});

    &:last-child {
      background: linear-gradient(90deg, ${theme.color.stroke}, transparent);
    }
  }

  .pilula {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.4rem 1rem;
    border-radius: ${theme.radius.pill};
    background: ${theme.color.glass};
    border: 1px solid ${theme.color.stroke};
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: ${theme.color.textMuted};
  }

  .contagem {
    color: ${theme.color.textFaint};
    font-weight: 700;
    letter-spacing: 0;
  }

  /* Na tela estreita os traços laterais não cabem junto com o rótulo. */
  @media (max-width: 560px) {
    gap: 0;

    .traco {
      display: none;
    }

    .pilula {
      font-size: 0.66rem;
      letter-spacing: 0.9px;
      padding: 0.35rem 0.8rem;
    }
  }
`;

/* ---------------------------------------------------------------- Nó ---- */

export const NodeButton = styled(motion.button)<{
  $size: number;
  $accent: string;
  $done: boolean;
}>`
  position: relative;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background: radial-gradient(
    circle at 50% 35%,
    ${(p) => p.$accent}5c 0%,
    rgba(16, 16, 28, 0.92) 72%
  );
  border: 1px solid ${(p) => p.$accent}33;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  ${(p) =>
    p.$done &&
    css`
      box-shadow: 0 10px 26px rgba(0, 0, 0, 0.55),
        0 0 22px ${theme.color.gold}44,
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    `}

  &:focus-visible {
    outline: 2px solid ${(p) => p.$accent};
    outline-offset: 6px;
  }

  svg.icone {
    position: relative;
    z-index: 1;
    transition: transform 320ms ${theme.ease.bounce};
  }

  &:hover svg.icone {
    transform: scale(1.16) rotate(-8deg);
  }
`;

/* Anel de progresso: substitui a barrinha embaixo do cartão. */
export const Ring = styled.svg`
  position: absolute;
  inset: -7px;
  width: calc(100% + 14px);
  height: calc(100% + 14px);
  transform: rotate(-90deg);
  pointer-events: none;

  .trilho {
    fill: none;
    stroke: rgba(255, 255, 255, 0.09);
    stroke-width: 6;
  }

  .progresso {
    fill: none;
    stroke-width: 6;
    stroke-linecap: round;
  }
`;

/* Halo pulsante marcando a próxima matéria a encarar. */
export const Halo = styled.span<{ $accent: string }>`
  position: absolute;
  inset: -7px;
  border-radius: 50%;
  border: 2px solid ${(p) => p.$accent};
  animation: ${haloPulse} 2.4s ${theme.ease.out} infinite;
  pointer-events: none;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.4;
  }
`;

export const DoneBadge = styled(motion.span)`
  position: absolute;
  right: -2px;
  bottom: -2px;
  z-index: 2;
  display: flex;
  border-radius: 50%;
  background: ${theme.color.bgDeep};
  color: ${theme.color.gold};
`;

export const NodeLabel = styled.div<{ $current: boolean }>`
  margin-top: 0.7rem;
  text-align: center;
  max-width: 150px;

  .nome {
    font-size: 0.88rem;
    font-weight: 700;
    color: ${(p) => (p.$current ? '#fff' : theme.color.text)};
    letter-spacing: -0.2px;
    line-height: 1.25;
  }

  .meta {
    margin-top: 0.15rem;
    font-size: 0.72rem;
    color: ${theme.color.textFaint};
    font-variant-numeric: tabular-nums;
  }

  .aqui {
    display: inline-block;
    margin-top: 0.3rem;
    padding: 0.1rem 0.5rem;
    border-radius: ${theme.radius.pill};
    background: ${theme.gradient.primary};
    color: #fff;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
`;
