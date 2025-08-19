import { useProgressStore } from '../../hooks/useProgressStore';
import { BarWrapper } from '../../style/globalStyle';
import {
  XPBarWrapper,
  InfoHeader,
  LevelLabel,
  XPLabel,
  ProgressBarContainer,
  ProgressBarFill,
} from './style';

const calculateLevelInfo = (xp: number) => {
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 150;

  while (xp >= xpForNextLevel) {
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel += 150 * level;
  }

  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progress =
    xpNeededForLevel > 0 ? (xpInCurrentLevel / xpNeededForLevel) * 100 : 0;

  return { level, progress, xpInCurrentLevel, xpNeededForLevel };
};

export const UserLevelBar = () => {
  const xp = useProgressStore((state) => state.xp);

  const { level, progress, xpInCurrentLevel, xpNeededForLevel } =
    calculateLevelInfo(xp);

  return (
    <BarWrapper>
      <XPBarWrapper>
        <InfoHeader>
          <LevelLabel>Nível {level}</LevelLabel>
          <XPLabel>{`${xpInCurrentLevel} / ${xpNeededForLevel} XP`}</XPLabel>
        </InfoHeader>

        <ProgressBarContainer>
          <ProgressBarFill progress={progress} />
        </ProgressBarContainer>
      </XPBarWrapper>
    </BarWrapper>
  );
};
