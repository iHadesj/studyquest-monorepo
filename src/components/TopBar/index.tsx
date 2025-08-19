import styled from 'styled-components';
import { signOut } from 'firebase/auth'; // Importa a função de logout
import { auth } from '../../config/firebase'; // Importa a configuração do Firebase
import { useProgressStore } from '../../hooks/useProgressStore';
import { SignOut } from 'phosphor-react'; // Ícone para o botão de sair

// --- COMPONENTES ESTILIZADOS ---
const TopBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1280px;
  gap: 0.5rem;
  margin: 0 auto;
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2f3136;
  border: 2px solid #40444b;
`;

const Username = styled.span`
  color: #ffffff;
  font-weight: bold;
  font-size: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const LevelBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
`;

const LevelDisplay = styled.div`
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

const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: #202225;
  border-radius: 8px;
  height: 20px;
  overflow: hidden;
  position: relative;
  border: 1px solid #40444b;
`;

const ProgressBarFill = styled.div<{ progress: number }>`
  width: ${(props) => props.progress}%;
  height: 100%;
  background: linear-gradient(90deg, #43b581, #5865f2);
  transition: width 0.5s ease-in-out;
`;

const XPText = styled.span`
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

// NOVO: Botão de Logout
const LogoutButton = styled.button`
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

// --- COMPONENTE PRINCIPAL ---
export const TopBar = () => {
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
        <Avatar
          src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${avatarSeed}`}
          alt="User Avatar"
        />
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
