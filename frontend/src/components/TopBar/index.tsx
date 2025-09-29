import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useProgressStore } from '../../hooks/useProgressStore';
import { SignOut } from 'phosphor-react';
import { calculateLevelInfo } from '../../style/level';
import * as S from './style';
import { Avatar } from '../../style/globalStyle';

type TopBarProps = {
  onClick?: () => void;
};

export const TopBar = ({ onClick }: TopBarProps) => {
  const { xp, username, avatarSeed, fullTag } = useProgressStore();
  const { level, progress, xpInCurrentLevel, xpNeededForLevel } =
    calculateLevelInfo(xp);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const devTag = 'Edu.dev#8636';
  const avatarSrc =
    fullTag === devTag
      ? './Light.jpg'
      : `https://api.dicebear.com/8.x/pixel-art/svg?seed=${avatarSeed}`;

  return (
    <S.TopBarContainer>
      <S.ProfileInfo onClick={onClick}>
        <Avatar src={avatarSrc} alt="User Avatar" />
        <S.UserDetails>
          <S.Username>{username}</S.Username>
          <S.SettingsIcon className="settings-icon" weight="fill" size={16} />
        </S.UserDetails>
      </S.ProfileInfo>

      <S.LevelBarContainer>
        <S.LevelDisplay title={`Nível ${level}`}>{level}</S.LevelDisplay>
        <S.ProgressBarContainer>
          <S.ProgressBarFill $progress={progress} />
          <S.XPText>{`${xpInCurrentLevel} / ${xpNeededForLevel} XP`}</S.XPText>
        </S.ProgressBarContainer>
      </S.LevelBarContainer>

      <S.LogoutButton onClick={handleLogout} title="Sair">
        <SignOut size={24} />
      </S.LogoutButton>
    </S.TopBarContainer>
  );
};
