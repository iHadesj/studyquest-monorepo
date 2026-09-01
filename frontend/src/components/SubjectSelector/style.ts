import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../style/theme';

const shine = keyframes`
  0%   { transform: translateX(-130%) skewX(-20deg); }
  100% { transform: translateX(320%) skewX(-20deg); }
`;

const spinSlow = keyframes`
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
`;

const pulseRing = keyframes`
  0%   { transform: scale(0.9); opacity: 0.55; }
  70%  { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(1.5); opacity: 0; }
`;

const eyeMove = keyframes`
  0%  , 10% {     background-position: 0px 0px}
  13%  , 40% {     background-position: -15px 0px}
  43%  , 70% {     background-position: 15px 0px}
  73%  , 90% {     background-position: 0px 15px}
  93%  , 100% {     background-position: 0px 0px}
`;

const blink = keyframes`
  0%  , 10% , 12% , 20%, 22%, 40%, 42% , 60%, 62%,  70%, 72% , 90%, 92%, 98% , 100%
  { height: 48px}
  11% , 21% ,41% , 61% , 71% , 91% , 99%
  { height: 18px}
`;

export const Container = styled.div`
  padding-bottom: 2rem;
`;

/* ------------------------------------------------------- HUD do jogador -- */

/**
 * Cabeçalho assimétrico: texto à esquerda, cérebro à direita. Foge do
 * empilhamento centrado (selo, título, subtítulo, números) que toda home tem.
 */
export const Hero = styled(motion.header)`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: 2rem;
  padding: 0.5rem 0 2.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
    justify-items: center;
  }
`;

export const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media (max-width: 900px) {
    align-items: center;
  }
`;

/** Rótulo de seção: discreto, sem selo colorido nem emoji. */
export const HeroBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${theme.color.textFaint};
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin-bottom: 0.9rem;

  svg {
    color: ${theme.color.textMuted};
  }
`;

/**
 * Título sóbrio: peso e hierarquia fazem o trabalho, sem gradiente arco-íris
 * animado. Só o nome do estudante recebe cor.
 */
export const DisplayTitle = styled(motion.h1)`
  margin: 0;
  font-size: clamp(2.1rem, 5.4vw, 3.4rem);
  line-height: 1.05;
  letter-spacing: -1.8px;
  font-weight: 300;
  color: ${theme.color.textMuted};

  .nome {
    font-weight: 700;
    color: ${theme.color.text};
  }
`;

export const HeroLead = styled(motion.p)`
  margin: 1.1rem 0 0;
  max-width: 42ch;
  color: ${theme.color.textMuted};
  font-size: 0.98rem;
  line-height: 1.65;
`;

/** Atalho para a matéria em andamento: deixa o cabeçalho útil, não decorativo. */
export const ContinueButton = styled(motion.button)`
  position: relative;
  overflow: hidden;
  margin-top: 1.6rem;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1.4rem;
  border-radius: ${theme.radius.pill};
  border: 1px solid ${theme.color.strokeStrong};
  background: ${theme.color.glass};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: ${theme.color.text};
  font-family: ${theme.font.sans};
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;

  .rotulo {
    color: ${theme.color.textFaint};
    font-weight: 600;
  }

  .ponto {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${theme.gradient.sheen};
    transform: translateX(-130%) skewX(-20deg);
  }

  &:hover {
    border-color: ${theme.color.primary};
    &::after {
      animation: ${shine} 800ms ${theme.ease.out};
    }
  }
`;

export const BrainSlot = styled(motion.div)`
  width: 100%;
  max-width: 420px;
  justify-self: center;

  @media (max-width: 900px) {
    max-width: 260px;
    order: -1;
    margin-bottom: 0.5rem;
  }
`;

/**
 * Faixa única com as três métricas, em vez de três cartões soltos: menos
 * caixas empilhadas e uma leitura horizontal só.
 */
export const StatStrip = styled(motion.div)`
  display: inline-flex;
  align-items: stretch;
  margin-top: 1.75rem;
  border-radius: ${theme.radius.pill};
  background: ${theme.color.glass};
  border: 1px solid ${theme.color.stroke};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  overflow: hidden;

  @media (max-width: 560px) {
    width: 100%;
    border-radius: ${theme.radius.lg};
  }
`;

export const Stat = styled.div<{ $accent: string }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1.35rem;
  flex: 1;
  justify-content: center;

  & + & {
    border-left: 1px solid ${theme.color.stroke};
  }

  svg {
    color: ${(p) => p.$accent};
    flex-shrink: 0;
  }

  .value {
    font-size: 1.05rem;
    font-weight: 800;
    color: ${theme.color.text};
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .label {
    font-size: 0.66rem;
    color: ${theme.color.textFaint};
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-top: 0.15rem;
    white-space: nowrap;
  }

  @media (max-width: 560px) {
    padding: 0.7rem 0.5rem;
    gap: 0.45rem;
    .value {
      font-size: 0.95rem;
    }
    .label {
      font-size: 0.58rem;
    }
  }
`;

/* Marcos de largada e chegada, nas pontas da trilha. */
export const TrailStart = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: ${theme.color.textFaint};
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;

  .linha {
    width: 1px;
    height: 34px;
    background: linear-gradient(180deg, transparent, ${theme.color.stroke});
  }
`;

/* Liga a última parada ao portal, para o Brainstorm não ficar solto. */
export const TrailEnd = styled.div`
  width: 2px;
  height: 72px;
  margin: 0 auto;
  background: linear-gradient(
    180deg,
    ${theme.color.stroke},
    ${theme.color.primary}
  );
  mask-image: linear-gradient(180deg, #000 0 4px, transparent 4px 12px);
  -webkit-mask-image: linear-gradient(
    180deg,
    #000 0 4px,
    transparent 4px 12px
  );
  mask-size: 100% 12px;
  -webkit-mask-size: 100% 12px;
  mask-repeat: repeat-y;
  -webkit-mask-repeat: repeat-y;
`;

/* ---------------------------------------------------------- Brainstorm -- */

/* Fim da trilha: um portal, não mais um retângulo de destaque. */
export const PortalSection = styled(motion.section)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 1rem;
  padding: 0 1rem 1rem;
`;

export const PortalRing = styled.div`
  position: relative;
  width: 132px;
  height: 132px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  animation: ${float} 6s ease-in-out infinite;

  /* Anel cônico girando, dando a sensação de portal. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      transparent 0%,
      ${theme.color.primary} 25%,
      ${theme.color.cyan} 50%,
      ${theme.color.pink} 75%,
      transparent 100%
    );
    mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0);
    -webkit-mask: radial-gradient(
      farthest-side,
      transparent calc(100% - 3px),
      #000 0
    );
    animation: ${spinSlow} 8s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 12px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(124, 92, 255, 0.34) 0%,
      transparent 72%
    );
    filter: blur(10px);
  }

  svg {
    position: relative;
    z-index: 1;
    color: #fff;
    filter: drop-shadow(0 0 14px rgba(124, 92, 255, 0.8));
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    &::before {
      animation: none;
    }
  }
`;

export const PortalTitle = styled.h2`
  font-size: clamp(1.75rem, 5vw, 2.4rem);
  font-weight: 800;
  margin: 0 0 0.6rem;
  letter-spacing: -1.2px;
  background: ${theme.gradient.primary};
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

export const PortalDescription = styled.p`
  color: ${theme.color.textMuted};
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 440px;
  margin: 0 auto;
`;

export const PortalMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.25rem 0 1.5rem;
`;

export const MetaChip = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  border-radius: ${theme.radius.pill};
  background: ${theme.color.glass};
  border: 1px solid ${theme.color.stroke};
  color: ${theme.color.textMuted};
  font-size: 0.76rem;
  font-weight: 600;

  strong {
    color: ${theme.color.text};
  }

  svg {
    color: ${theme.color.cyan};
  }
`;

export const BrainControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.85rem;
`;

export const LargeButton = styled(motion.button)<{
  $variant?: 'primary' | 'accent';
}>`
  position: relative;
  overflow: hidden;
  padding: 0.85rem 1.9rem;
  border-radius: ${theme.radius.pill};
  border: none;
  cursor: pointer;
  display: inline-flex;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  font-family: ${theme.font.sans};
  font-weight: 800;
  font-size: 0.95rem;
  color: #fff;
  background: ${(p) =>
    p.$variant === 'accent' ? theme.gradient.hot : theme.gradient.primary};
  box-shadow: ${(p) =>
    p.$variant === 'accent'
      ? '0 10px 30px rgba(244, 114, 182, 0.32)'
      : '0 10px 30px rgba(124, 92, 255, 0.32)'};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${theme.gradient.sheen};
    transform: translateX(-130%) skewX(-20deg);
  }

  &:hover::after {
    animation: ${shine} 800ms ${theme.ease.out};
  }
`;

export const PulseDot = styled.span`
  position: relative;
  display: inline-flex;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: #fff;
    animation: ${pulseRing} 1.8s ${theme.ease.out} infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

/* ------------------------------------------------------------- Loader --- */

export const Loader = styled.span`
  position: relative;
  width: 108px;
  display: flex;
  justify-content: space-between;

  &::after,
  &::before {
    content: '';
    display: inline-block;
    width: 48px;
    height: 48px;
    background-color: #fff;
    background-image: radial-gradient(circle 14px, #0d161b 100%, transparent 0);
    background-repeat: no-repeat;
    border-radius: 50%;
    animation: ${eyeMove} 10s infinite, ${blink} 10s infinite;
  }
`;

export const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 3rem 0;
`;
