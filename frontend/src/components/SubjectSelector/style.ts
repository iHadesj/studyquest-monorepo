import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../style/theme';

const shine = keyframes`
  0%   { transform: translateX(-130%) skewX(-20deg); }
  100% { transform: translateX(320%) skewX(-20deg); }
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

/* ---------------------------------------------------------------- Hero -- */

export const Hero = styled(motion.header)`
  position: relative;
  text-align: center;
  padding: 1rem 0 2.5rem;
`;

export const HeroBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.9rem;
  border-radius: ${theme.radius.pill};
  background: ${theme.color.glass};
  border: 1px solid ${theme.color.stroke};
  color: ${theme.color.textMuted};
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  margin-bottom: 1.1rem;

  svg {
    color: ${theme.color.warn};
  }
`;

export const HeroStats = styled(motion.div)`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
`;

export const StatChip = styled(motion.div)<{ $accent: string }>`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 1.15rem;
  border-radius: ${theme.radius.md};
  background: ${theme.color.glass};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${theme.color.stroke};
  transition: border-color 220ms ease, background 220ms ease;

  svg {
    color: ${(p) => p.$accent};
    flex-shrink: 0;
  }

  .value {
    font-size: 1.15rem;
    font-weight: 800;
    color: ${theme.color.text};
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .label {
    font-size: 0.72rem;
    color: ${theme.color.textFaint};
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  &:hover {
    background: ${theme.color.glassStrong};
    border-color: ${(p) => p.$accent}55;
  }
`;

/* ------------------------------------------------------------ Matérias -- */

export const CategoryHeader = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2.75rem 0 1.25rem;
`;

export const CategoryTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${theme.color.text};
  margin: 0;
  white-space: nowrap;
  letter-spacing: -0.2px;
`;

export const CategoryCount = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${theme.color.textFaint};
  background: ${theme.color.glass};
  border: 1px solid ${theme.color.stroke};
  padding: 0.15rem 0.55rem;
  border-radius: ${theme.radius.pill};
`;

export const CategoryRule = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    ${theme.color.stroke},
    transparent
  );
`;

export const SubjectGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

export const SubjectCard = styled(motion.button)<{ $accent: string }>`
  --accent: ${(p) => p.$accent};

  position: relative;
  isolation: isolate;
  border: 1px solid ${theme.color.stroke};
  border-radius: ${theme.radius.lg};
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: stretch;
  text-align: left;
  cursor: pointer;
  min-height: 172px;
  overflow: hidden;
  color: ${theme.color.text};
  background: ${theme.color.glass};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: ${theme.shadow.sm};
  transition: border-color 260ms ease, box-shadow 260ms ease;

  /* Véu da cor da matéria: quase invisível parado, acende no hover. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: radial-gradient(
      120% 100% at 0% 0%,
      var(--accent) 0%,
      transparent 62%
    );
    opacity: 0.16;
    transition: opacity 320ms ${theme.ease.out};
  }

  /* Brilho diagonal que varre o card. */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 45%;
    height: 100%;
    z-index: -1;
    background: ${theme.gradient.sheen};
    transform: translateX(-130%) skewX(-20deg);
  }

  &:hover {
    border-color: var(--accent);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--accent) inset;
    &::before {
      opacity: 0.42;
    }
    &::after {
      animation: ${shine} 900ms ${theme.ease.out};
    }
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }

  .top {
    display: flex;
    gap: 0.85rem;
    align-items: center;
  }

  h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
  }

  .meta {
    font-size: 0.76rem;
    color: ${theme.color.textMuted};
    margin-top: 0.2rem;
  }

  .progress-wrap {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

export const IconWrap = styled.div<{ $accent: string }>`
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: ${theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(
    145deg,
    ${(p) => p.$accent}44,
    ${(p) => p.$accent}14
  );
  border: 1px solid ${(p) => p.$accent}55;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition: transform 320ms ${theme.ease.bounce};

  ${SubjectCard}:hover & {
    transform: translateY(-3px) rotate(-6deg) scale(1.06);
  }
`;

export const DoneBadge = styled(motion.div)`
  position: absolute;
  top: 0.9rem;
  right: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.color.success};
`;

export const ProgressBarContainer = styled.div`
  height: 8px;
  width: 100%;
  background: rgba(0, 0, 0, 0.32);
  border-radius: ${theme.radius.pill};
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const ProgressBarFill = styled(motion.div)<{ $accent: string }>`
  height: 100%;
  border-radius: ${theme.radius.pill};
  background: linear-gradient(
    90deg,
    ${(p) => p.$accent},
    ${theme.color.cyan}
  );
  position: relative;
  overflow: hidden;

  /* Reflexo correndo por dentro da barra preenchida. */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${theme.gradient.sheen};
    transform: translateX(-130%) skewX(-20deg);
    animation: ${shine} 3.2s ${theme.ease.inOut} infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 0.74rem;
  color: ${theme.color.textMuted};
  font-variant-numeric: tabular-nums;
`;

export const Separator = styled.div`
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    ${theme.color.stroke},
    transparent
  );
  margin: 3rem 0 2.5rem;
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

export const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  width: 100%;
`;

const shimmer = keyframes`
  0%   { background-position: -420px 0; }
  100% { background-position: 420px 0; }
`;

export const SkeletonCard = styled.div`
  height: 172px;
  border-radius: ${theme.radius.lg};
  border: 1px solid ${theme.color.stroke};
  background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 100%
    ),
    ${theme.color.glass};
  background-size: 420px 100%;
  background-repeat: no-repeat;
  animation: ${shimmer} 1.4s linear infinite;
`;

/* ---------------------------------------------------------- Brainstorm -- */

export const BrainstormSection = styled(motion.section)`
  position: relative;
  border-radius: ${theme.radius.xl};
  padding: 2.5rem;
  overflow: hidden;
  border: 1px solid ${theme.color.strokeStrong};
  background: linear-gradient(
    135deg,
    rgba(124, 92, 255, 0.16) 0%,
    rgba(34, 211, 238, 0.08) 45%,
    rgba(244, 114, 182, 0.12) 100%
  );
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: ${theme.shadow.lg};
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  align-items: center;
  gap: 2.5rem;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 2rem 1.5rem;
  }
`;

/* Orbe decorativo que flutua no canto do CTA. */
export const BrainstormOrb = styled.div`
  position: absolute;
  top: -70px;
  right: -50px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(124, 92, 255, 0.42) 0%,
    transparent 68%
  );
  filter: blur(28px);
  pointer-events: none;
  animation: ${float} 7s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const BrainstormContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 880px) {
    align-items: center;
  }
`;

export const BrainStormTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -1.2px;

  svg {
    color: ${theme.color.primarySoft};
  }
`;

export const BrainstormDescription = styled.p`
  color: ${theme.color.textMuted};
  font-size: 0.98rem;
  line-height: 1.65;
  max-width: 460px;
  margin: 0;
`;

export const BrainControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 0.75rem;

  @media (max-width: 880px) {
    justify-content: center;
  }
`;

export const LargeButton = styled(motion.button)<{
  $variant?: 'primary' | 'accent';
}>`
  position: relative;
  overflow: hidden;
  padding: 0.85rem 1.75rem;
  border-radius: ${theme.radius.pill};
  border: none;
  cursor: pointer;
  display: inline-flex;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  font-family: ${theme.font.mono};
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

/* Anel que pulsa atrás do botão de multiplayer, chamando atenção. */
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

export const BrainInfo = styled.div`
  position: relative;
  background: rgba(0, 0, 0, 0.26);
  border: 1px solid ${theme.color.stroke};
  border-radius: ${theme.radius.lg};
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  h4 {
    margin: 0 0 1rem 0;
    font-size: 0.82rem;
    color: ${theme.color.textFaint};
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
`;

export const InfoItem = styled(motion.li)`
  color: ${theme.color.textMuted};
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.9rem;
  font-weight: 500;

  strong {
    color: ${theme.color.text};
  }

  svg {
    flex-shrink: 0;
    color: ${theme.color.cyan};
  }
`;
