import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { BackButton, Title } from '../../style/globalStyle';
import { Crown } from 'phosphor-react';
import type { FirestoreUserData } from '../../hooks/useProgressStore';
import type { UserProfileData } from '../../interfaces';
import { Avatar as BaseAvatar } from '../../components/TopBar';

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

const RankingContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const UserRow = styled.div<{ rank: number; isCurrentUser: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${(props) => (props.isCurrentUser ? '#3a3e45' : '#2f3136')};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: transform 0.2s ease-in-out;
  border: 2px solid
    ${(props) => (props.isCurrentUser ? '#5865f2' : 'transparent')};
  cursor: pointer;

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

export const Avatar = styled(BaseAvatar)`
  width: 40px;
  height: 40px;
  border: 4px solid #4f545c;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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

function calculateLevel(xp: number): number {
  let level = 1;
  let xpForNextLevel = 150;
  while (xp >= xpForNextLevel) {
    level++;
    xpForNextLevel += 150 * level;
  }
  return level;
}

interface RankingPageProps {
  onBack: () => void;
  onViewProfile: (user: UserProfileData) => void;
}

export const RankingPage = ({ onBack, onViewProfile }: RankingPageProps) => {
  const [ranking, setRanking] = useState<UserProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('xp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);

        const usersData: UserProfileData[] = querySnapshot.docs.map(
          (doc, index) => {
            const data = doc.data() as FirestoreUserData;
            return {
              ...data,
              uid: doc.id,
              level: calculateLevel(data.xp || 0),
              rank: index + 1,
            };
          }
        );
        setRanking(usersData);
      } catch (err) {
        console.error('Erro ao buscar o ranking:', err);
        setError(
          'Não foi possível carregar o ranking. Tente novamente mais tarde.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
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
        ranking.map((user, index) => {
          const devTag = 'Edu.dev#8636';
          const avatarSrc =
            user.fullTag === devTag
              ? '/Light.jpg'
              : `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.avatarSeed}`;
          return (
            <UserRow
              key={user.uid}
              rank={index + 1}
              isCurrentUser={user.uid === auth.currentUser?.uid}
              onClick={() => onViewProfile(user)}
            >
              <Rank>#{index + 1}</Rank>
              <Avatar src={avatarSrc} alt={user.username || 'Avatar'} />
              <UserInfo>
                <Username>{user.username}</Username>
                <UserStats>
                  Nível {user.level} - {user.xp.toLocaleString('pt-BR')} XP
                </UserStats>
              </UserInfo>
            </UserRow>
          );
        })
      )}
    </RankingContainer>
  );
};
