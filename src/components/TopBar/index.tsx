import styled from 'styled-components';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useProgressStore } from '../../hooks/useProgressStore';
import { SignOut, Gear } from 'phosphor-react';

// --- COMPONENTES ESTILIZADOS ---
export const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1280px;
  gap: 0.5rem;
  margin: 0 auto;
`;

export const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const Avatar = styled.img<{
  $pointer?: boolean;
}>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2f3136;
  border: 2px solid #40444b;
  cursor: ${(props) => (props.$pointer ? 'pointer' : 'default')};
`;

export const AvatarContainer = styled.div`
  position: relative;
  cursor: pointer;
`;

export const SettingsIcon = styled(Gear)`
  position: absolute;
  bottom: 6px;
  right: 0;
  transform: translate(25%, 25%);

  background-color: #40444b;
  color: #ffffff;
  border-radius: 50%;
  padding: 2px;
  width: 14px;
  height: 14px;
  border: 2px solid #2f3136;
`;

export const Username = styled.span`
  color: #ffffff;
  font-weight: bold;
  font-size: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const LevelBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
`;

export const LevelDisplay = styled.div`
  background-color: #5865f2;
  color: white;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  border: 2px solid #2f3136;
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: #202225;
  border-radius: 8px;
  height: 20px;
  overflow: hidden;
  position: relative;
  border: 1px solid #40444b;
`;

export const ProgressBarFill = styled.div<{ progress: number }>`
  width: ${(props) => props.progress}%;
  height: 100%;
  background: linear-gradient(90deg, #43b581, #5865f2);
  transition: width 0.5s ease-in-out;
`;

export const XPText = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);

  @media (max-width: 480px) {
    display: none;
  }
`;

export const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  margin-left: 1rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    color: #ffffff;
    background-color: #40444b;
  }
`;

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

type TopBarProps = {
  onClick?: () => void;
};

// --- COMPONENTE PRINCIPAL ---
export const TopBar = ({ onClick }: TopBarProps) => {
  const { xp, username, avatarSeed } = useProgressStore();
  const { level, progress, xpInCurrentLevel, xpNeededForLevel } =
    calculateLevelInfo(xp);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <TopBarContainer>
      <ProfileInfo>
        <AvatarContainer onClick={onClick}>
          <Avatar
            src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${avatarSeed}`}
            alt="User Avatar"
          />
          <SettingsIcon weight="fill" />
        </AvatarContainer>
        <Username>{username}</Username>
      </ProfileInfo>

      <LevelBarContainer>
        <LevelDisplay title={`Nível ${level}`}>{level}</LevelDisplay>
        <ProgressBarContainer>
          <ProgressBarFill progress={progress} />
          <XPText>{`${xpInCurrentLevel} / ${xpNeededForLevel} XP`}</XPText>
        </ProgressBarContainer>
      </LevelBarContainer>

      <LogoutButton onClick={handleLogout} title="Sair">
        <SignOut size={24} />
      </LogoutButton>
    </TopBarContainer>
  );
};
