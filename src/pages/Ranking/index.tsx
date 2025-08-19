import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { BackButton, Title } from '../../style/globalStyle';
import { Crown } from 'phosphor-react';

type UserData = {
  uid: string;
  username: string;
  avatarSeed: string;
  xp: number;
  level: number;
};

const RankingContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const UserRow = styled.div<{ rank: number }>`
  display: flex;
  align-items: center;
  background-color: #2f3136;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border: 2px solid transparent;
  border-color: ${(props) =>
    props.rank === 1
      ? '#f1c40f'
      : props.rank === 2
      ? '#95a5a6'
      : props.rank === 3
      ? '#cd7f32'
      : 'transparent'};
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

const calculateLevel = (xp: number) => {
  let level = 1;
  let xpForNextLevel = 150;
  while (xp >= xpForNextLevel) {
    level++;
    xpForNextLevel += 150 * level;
  }
  return level;
};

export const RankingPage = ({ onBack }: { onBack: () => void }) => {
  const [ranking, setRanking] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('xp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);

        const usersData: UserData[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            uid: data.uid,
            username: data.username,
            avatarSeed: data.avatarSeed,
            xp: data.xp,
            level: calculateLevel(data.xp),
          });
        });
        setRanking(usersData);
      } catch (error) {
        console.error('Erro ao buscar o ranking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return <p style={{ textAlign: 'center' }}>A carregar o ranking...</p>;
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

      {ranking.map((user, index) => (
        <UserRow key={user.uid} rank={index + 1}>
          <Rank>#{index + 1}</Rank>
          <Avatar
            src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.avatarSeed}`}
            alt={user.username}
          />
          <UserInfo>
            <Username>{user.username}</Username>
            <UserStats>
              Nível {user.level} - {user.xp} XP
            </UserStats>
          </UserInfo>
        </UserRow>
      ))}
    </RankingContainer>
  );
};
