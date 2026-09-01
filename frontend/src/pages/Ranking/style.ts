import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../style/theme';
import { Avatar as BaseAvatar } from '../../style/globalStyle';

type Medal = 'gold' | 'silver' | 'bronze';

const medalGradient: Record<Medal, string> = {
  gold: theme.gradient.gold,
  silver: theme.gradient.silver,
  bronze: theme.gradient.bronze,
};

const medalColor: Record<Medal, string> = {
  gold: theme.color.gold,
  silver: theme.color.silver,
  bronze: theme.color.bronze,
};

const shine = keyframes`
  0%   { transform: translateX(-130%) skewX(-20deg); }
  100% { transform: translateX(320%) skewX(-20deg); }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50%      { opacity: 0.75; transform: scale(1.08); }
`;

const floaty = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

export const RankingContainer = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;

  svg {
    color: ${theme.color.gold};
    filter: drop-shadow(0 0 12px rgba(245, 197, 66, 0.5));
  }
`;

/* ------------------------------------------------------------- Pódio ---- */

export const Podium = styled(motion.div)`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1.15fr 1fr;
  align-items: end;
  gap: 0.75rem;
  margin: 2.5rem 0 2.75rem;
  padding-bottom: 1px;

  /* Linha de chão: sem ela os blocos ficam flutuando no vazio. */
  &::after {
    content: '';
    position: absolute;
    left: -4%;
    right: -4%;
    bottom: 0;
    height: 2px;
    border-radius: ${theme.radius.pill};
    background: linear-gradient(
      90deg,
      transparent,
      ${theme.color.strokeStrong} 18%,
      ${theme.color.gold} 50%,
      ${theme.color.strokeStrong} 82%,
      transparent
    );
    box-shadow: 0 0 18px rgba(245, 197, 66, 0.35);
  }

  @media (max-width: 560px) {
    gap: 0.4rem;
  }
`;

export const PodiumSlot = styled(motion.button)<{ $medal: Medal }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 1.1rem 0.6rem 0;
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.color.text};

  /* O halo da medalha pulsa atrás do avatar. */
  &::before {
    content: '';
    position: absolute;
    top: ${(p) => (p.$medal === 'gold' ? '10px' : '18px')};
    width: ${(p) => (p.$medal === 'gold' ? '96px' : '76px')};
    height: ${(p) => (p.$medal === 'gold' ? '96px' : '76px')};
    border-radius: 50%;
    background: radial-gradient(
      circle,
      ${(p) => medalColor[p.$medal]}66 0%,
      transparent 70%
    );
    filter: blur(12px);
    animation: ${glow} 3s ease-in-out infinite;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation: none;
    }
  }
`;

export const Crown = styled(motion.div)`
  color: ${theme.color.gold};
  filter: drop-shadow(0 4px 10px rgba(245, 197, 66, 0.55));
  animation: ${floaty} 3.2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const PodiumAvatar = styled(BaseAvatar)<{ $medal: Medal }>`
  position: relative;
  width: ${(p) => (p.$medal === 'gold' ? '80px' : '62px')};
  height: ${(p) => (p.$medal === 'gold' ? '80px' : '62px')};
  border: 3px solid transparent;
  background-image: linear-gradient(${theme.color.bgRaised}, ${theme.color.bgRaised}),
    ${(p) => medalGradient[p.$medal]};
  background-origin: border-box;
  background-clip: content-box, border-box;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
`;

export const PodiumName = styled.div`
  font-weight: 700;
  font-size: 0.88rem;
  color: ${theme.color.text};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PodiumXp = styled.div<{ $medal: Medal }>`
  font-size: 0.76rem;
  font-weight: 700;
  color: ${(p) => medalColor[p.$medal]};
  font-variant-numeric: tabular-nums;
`;

export const PodiumBlock = styled.div<{ $medal: Medal }>`
  position: relative;
  width: 100%;
  margin-top: 0.65rem;
  height: ${(p) =>
    p.$medal === 'gold' ? '92px' : p.$medal === 'silver' ? '68px' : '50px'};
  border-radius: ${theme.radius.md} ${theme.radius.md} 0 0;
  border: 1px solid ${(p) => medalColor[p.$medal]}44;
  border-bottom: none;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    ${(p) => medalColor[p.$medal]}26 0%,
    transparent 100%
  );
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.5rem;

  .place {
    font-size: 1.5rem;
    font-weight: 900;
    background: ${(p) => medalGradient[p.$medal]};
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${theme.gradient.sheen};
    transform: translateX(-130%) skewX(-20deg);
    animation: ${shine} 4.5s ${theme.ease.inOut} infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`;

/* -------------------------------------------------------------- Lista --- */

export const List = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

export const UserRow = styled(motion.button)<{
  $isCurrentUser: boolean;
  $medal?: Medal;
}>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  text-align: left;
  padding: 0.8rem 1.1rem;
  border-radius: ${theme.radius.md};
  cursor: pointer;
  overflow: hidden;
  color: ${theme.color.text};
  background: ${(p) =>
    p.$isCurrentUser
      ? 'linear-gradient(100deg, rgba(124,92,255,0.20), rgba(34,211,238,0.08))'
      : theme.color.glass};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid
    ${(p) =>
      p.$isCurrentUser ? 'rgba(124, 92, 255, 0.55)' : theme.color.stroke};
  transition: border-color 220ms ease, background 220ms ease;

  ${(p) =>
    p.$medal &&
    css`
      border-color: ${medalColor[p.$medal]}55;
    `}

  &:hover {
    background: ${theme.color.glassStrong};
    border-color: ${(p) =>
      p.$medal ? medalColor[p.$medal] : theme.color.strokeStrong};
  }
`;

export const Rank = styled.div<{ $medal?: Medal }>`
  font-size: 0.95rem;
  font-weight: 800;
  width: 42px;
  flex-shrink: 0;
  text-align: center;
  font-variant-numeric: tabular-nums;
  color: ${(p) => (p.$medal ? medalColor[p.$medal] : theme.color.textFaint)};
`;

export const Avatar = styled(BaseAvatar)`
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border: 2px solid ${theme.color.stroke};
  box-shadow: ${theme.shadow.sm};
`;

export const UserInfo = styled.div`
  flex-grow: 1;
  min-width: 0;
`;

export const Username = styled.p`
  font-weight: 700;
  color: ${theme.color.text};
  margin: 0 0 0.35rem 0;
  font-size: 0.92rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  span {
    font-size: 0.7rem;
    font-weight: 700;
    color: ${theme.color.primarySoft};
    margin-left: 0.45rem;
  }
`;

export const UserStats = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: ${theme.color.textMuted};
  font-size: 0.76rem;
  font-variant-numeric: tabular-nums;
`;

export const LevelPill = styled.span`
  padding: 0.1rem 0.5rem;
  border-radius: ${theme.radius.pill};
  background: ${theme.color.glassStrong};
  border: 1px solid ${theme.color.stroke};
  font-weight: 700;
  color: ${theme.color.text};
  flex-shrink: 0;
`;

/* Barra fina que mostra o XP relativo ao líder. */
export const XpTrack = styled.div`
  flex: 1;
  height: 4px;
  min-width: 40px;
  border-radius: ${theme.radius.pill};
  background: rgba(0, 0, 0, 0.35);
  overflow: hidden;
`;

export const XpFill = styled(motion.div)<{ $medal?: Medal }>`
  height: 100%;
  border-radius: ${theme.radius.pill};
  background: ${(p) =>
    p.$medal ? medalGradient[p.$medal] : theme.gradient.primary};
`;

export const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5rem 0;
  text-align: center;
  color: ${theme.color.textMuted};
  gap: 1rem;
`;
