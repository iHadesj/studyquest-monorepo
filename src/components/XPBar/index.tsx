import { useProgressStore } from '../../hooks/useProgressStore';
import { BarWrapper, XPDisplay } from '../../style/globalStyle';
import { StarIcon } from '../../style/icons';

export const XPBar = () => {
  const xp = useProgressStore((state) => state.xp);
  return (
    <BarWrapper>
      {' '}
      <XPDisplay>
        {' '}
        <StarIcon /> <span>{xp} XP</span>{' '}
      </XPDisplay>{' '}
    </BarWrapper>
  );
};
