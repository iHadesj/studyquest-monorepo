// src/pages/AchievementsPage/style.ts
import styled, { css } from 'styled-components';
import { theme } from '../../style/theme';

export const AchievementsWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

export const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

export const AchievementCard = styled.div<{
  $unlocked: boolean;
  $rarity: 'bronze' | 'prata' | 'ouro';
}>`
  background-color: ${theme.color.bgRaised};
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-top: 4px solid;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  ${({ $unlocked, $rarity }) =>
    $unlocked
      ? css`
          opacity: 1;
          border-color: ${$rarity === 'bronze'
            ? '#cd7f32'
            : $rarity === 'prata'
            ? '#c0c0c0'
            : theme.color.gold};
          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          }
        `
      : css`
          opacity: 0.5;
          filter: grayscale(80%);
          border-color: ${theme.color.stroke};
        `}
`;

export const AchievementIcon = styled.div`
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 1rem;
`;

export const AchievementName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #ffffff;
`;

export const AchievementDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${theme.color.textMuted};
  flex-grow: 1;
`;

export const AchievementRarity = styled.span`
  margin-top: 1rem;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  color: ${theme.color.textFaint};
`;
