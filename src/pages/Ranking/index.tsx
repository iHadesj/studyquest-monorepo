import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { BackButton, Title } from '../../style/globalStyle';
import { Crown } from 'phosphor-react';

// --- TIPOS ---
type UserData = {
  uid: string;
  username: string;
  avatarSeed: string;
  xp: number;
  level: number;
};

// --- ANIMAÇÕES DE NEON ---
// Keyframes para a animação de brilho pulsante
const neonGold = keyframes`
  0%, 100% { box-shadow: 0 0 3px #f1c40f, 0 0 6px #f1c40f, 0 0 9px #f1c40f; }
  50% { box-shadow: 0 0 6px #f1c40f, 0 0 18px #f1c40f, 0 0 6px #f1c40f; }
`;

const neonSilver = keyframes`
  0%, 100% { box-shadow: 0 0 3px #c0c0c0, 0 0 6px #c0c0c0, 0 0 9px #c0c0c0; }
  50% { box-shadow: 0 0 6px #c0c0c0, 0 0 18px #c0c0c0, 0 0 6px #c0c0c0; }
`;

const neonBronze = keyframes`
  0%, 100% { box-shadow: 0 0 3px #cd7f32, 0 0 6px #cd7f32, 0 0 9px #cd7f32; }
  50% { box-shadow: 0 0 6px #cd7f32, 0 0 18px #cd7f32, 0 0 6px #cd7f32; }
`;

// --- ESTILOS ---
const RankingContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const UserRow = styled.div<{ rank: number; isCurrentUser: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${(props) => (props.isCurrentUser ? '#3a3e45' : '#2f3136')};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: transform 0.2s ease-in-out;

  border: 2px solid
    ${(props) => (props.isCurrentUser ? '#5865f2' : 'transparent')};

  animation: ${(props) => {
    if (props.rank === 1)
      return css`
        ${neonGold} 2s ease-in-out infinite
      `;
    if (props.rank === 2)
      return css`
        ${neonSilver} 2.2s ease-in-out infinite
      `;
    if (props.rank === 3)
      return css`
        ${neonBronze} 2.4s ease-in-out infinite
      `;
    return 'none';
  }};

  &:hover {
    transform: scale(1.02);
  }
`;

const Rank = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
  width: 50px;
  text-align: center;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 0 1rem;
`;

const UserInfo = styled.div`
  flex-grow: 1;
`;

const Username = styled.p`
  font-weight: bold;
  color: #ffffff;
  margin: 0;
`;

const UserStats = styled.p`
  color: #b9bbbe;
  margin: 0;
  font-size: 0.875rem;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-left-color: #5865f2;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5rem 0;
  text-align: center;
  color: #b9bbbe;
`;

// --- LÓGICA UTILITÁRIA ---
const calculateLevel = (xp: number) => {
  let level = 1;
  let requiredXp = 200;
  let totalXpForNext = 200;

  while (xp >= totalXpForNext) {
    level++;
    requiredXp += 100;
    totalXpForNext += requiredXp;
  }
  return level;
};

// --- COMPONENTE PRINCIPAL ---
export const RankingPage = ({ onBack }: { onBack: () => void }) => {
  const [ranking, setRanking] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('xp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);

        const usersData: UserData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.username) {
            usersData.push({
              uid: doc.id,
              username: data.username,
              avatarSeed: data.avatarSeed,
              xp: data.xp,
              level: calculateLevel(data.xp),
            });
          }
        });
        setRanking(usersData);
      } catch (error) {
        console.error('Erro ao buscar o ranking:', error);
        setError(
          'Não foi possível carregar o ranking. Tente novamente mais tarde.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <CenteredContainer>
        <LoadingSpinner />
      </CenteredContainer>
    );
  }

  if (error) {
    return (
      <CenteredContainer>
        <p style={{ color: '#ed4245' }}>{error}</p>
        <BackButton onClick={onBack} style={{ marginTop: '1rem' }}>
          &larr; Voltar
        </BackButton>
      </CenteredContainer>
    );
  }

  return (
    <RankingContainer>
      <BackButton onClick={onBack}>&larr; Voltar</BackButton>
      <Title
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <Crown size={32} weight="fill" /> Ranking Global
      </Title>

      {ranking.length === 0 ? (
        <CenteredContainer>
          <p>O ranking ainda está vazio. Seja o primeiro a marcar pontos!</p>
        </CenteredContainer>
      ) : (
        ranking.map((user, index) => (
          <UserRow
            key={user.uid}
            rank={index + 1}
            isCurrentUser={user.uid === currentUserId}
          >
            <Rank>#{index + 1}</Rank>
            <AvatarContainer onClick={onClick}>
              <Avatar
                src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${avatarSeed}`}
                alt="User Avatar"
              />
              <SettingsIcon weight="fill" />
            </AvatarContainer>
            <UserInfo>
              <Username>{user.username}</Username>
              <UserStats>
                Nível {user.level} - {user.xp.toLocaleString('pt-BR')} XP
              </UserStats>
            </UserInfo>
          </UserRow>
        ))
      )}
    </RankingContainer>
  );
};
