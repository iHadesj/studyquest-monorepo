import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  arrayUnion,
  getDoc,
  arrayRemove,
  runTransaction,
} from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { BackButton, Title } from '../../style/globalStyle';
import { Crown, UserPlus } from 'phosphor-react';
import { useProgressStore } from '../../hooks/useProgressStore';
import type { FirestoreUserData } from '../../hooks/useProgressStore';

// --- TIPOS ---
export type UserData = {
  uid: string;
  username: string;
  avatarSeed: string;
  xp: number;
  level: number;
  fullTag?: string; // Adicionado para a verificação do dev
};

// --- ANIMAÇÕES DE NEON ---
// (o restante das animações e estilos permanece o mesmo)
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
  object-fit: cover; // Adicionado para sua foto não distorcer
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

export const FriendActionButton = styled.button`
  background-color: #40444b;
  color: #dcddde;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-family: 'Fira Code', monospace;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #5865f2;
    color: white;
  }

  &:disabled {
    background-color: #2f3136;
    color: #72767d;
    cursor: not-allowed;
  }
`;

// --- LÓGICA UTILITÁRIA ---
type LevelInfo = {
  level: number;
  progress: number;
  xpInCurrentLevel: number;
  xpNeededForLevel: number;
};

function calculateLevel(xp: number): LevelInfo {
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
  const rawProgress =
    xpNeededForLevel > 0 ? (xpInCurrentLevel / xpNeededForLevel) * 100 : 0;

  const progress = Math.max(0, Math.min(100, rawProgress));

  return { level, progress, xpInCurrentLevel, xpNeededForLevel };
}

// --- COMPONENTE PRINCIPAL ---
export const RankingPage = ({ onBack }: { onBack: () => void }) => {
  const [ranking, setRanking] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserData = useProgressStore((state) => state);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, orderBy('xp', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);

        const usersData: UserData[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            username: data.username || 'Anônimo',
            avatarSeed: data.avatarSeed || 'default',
            xp: data.xp || 0,
            level: calculateLevel(data.xp || 0).level,
            fullTag: data.fullTag || '', // Buscando a fullTag
          };
        });
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

  const refreshCurrentUserState = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        useProgressStore
          .getState()
          .hydrateFromFirestore(userDoc.data() as FirestoreUserData);
      }
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    try {
      await runTransaction(db, async (transaction) => {
        const currentUserRef = doc(db, 'users', currentUserId);
        const targetUserRef = doc(db, 'users', targetUserId);

        transaction.update(currentUserRef, {
          friendRequestsSent: arrayUnion(targetUserId),
        });
        transaction.update(targetUserRef, {
          friendRequestsReceived: arrayUnion(currentUserId),
        });
      });
      await refreshCurrentUserState();
    } catch (e) {
      console.error('Erro ao enviar pedido de amizade:', e);
    }
  };

  const handleAcceptFriendRequest = async (requesterId: string) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    try {
      await runTransaction(db, async (transaction) => {
        const currentUserRef = doc(db, 'users', currentUserId);
        const requesterRef = doc(db, 'users', requesterId);

        transaction.update(currentUserRef, {
          friends: arrayUnion(requesterId),
          friendRequestsReceived: arrayRemove(requesterId),
        });
        transaction.update(requesterRef, {
          friends: arrayUnion(currentUserId),
          friendRequestsSent: arrayRemove(currentUserId),
        });
      });
      await refreshCurrentUserState();
    } catch (e) {
      console.error('Erro ao aceitar pedido de amizade:', e);
    }
  };

  const renderFriendButton = (user: UserData) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserData || user.uid === currentUserId) return null;

    const isFriend = currentUserData.friends?.includes(user.uid);
    const hasSentRequest = currentUserData.friendRequestsSent?.includes(
      user.uid
    );
    const hasReceivedRequest = currentUserData.friendRequestsReceived?.includes(
      user.uid
    );

    if (isFriend) {
      return <FriendActionButton disabled>Amigos</FriendActionButton>;
    }
    if (hasSentRequest) {
      return <FriendActionButton disabled>Pendente</FriendActionButton>;
    }
    if (hasReceivedRequest) {
      return (
        <FriendActionButton onClick={() => handleAcceptFriendRequest(user.uid)}>
          Aceitar
        </FriendActionButton>
      );
    }
    return (
      <FriendActionButton onClick={() => handleSendFriendRequest(user.uid)}>
        <UserPlus size={18} /> Adicionar
      </FriendActionButton>
    );
  };

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
            >
              <Rank>#{index + 1}</Rank>
              <Avatar src={avatarSrc} alt={user.username} />
              <UserInfo>
                <Username>{user.username}</Username>
                <UserStats>
                  Nível {user.level} - {user.xp.toLocaleString('pt-BR')} XP
                </UserStats>
              </UserInfo>
              {renderFriendButton(user)}
            </UserRow>
          );
        })
      )}
    </RankingContainer>
  );
};
