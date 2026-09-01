import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { db, auth } from '../../config/firebase';
import {
  BackButton,
  LoadingSpinner,
  Subtitle,
  Title,
} from '../../style/globalStyle';
import { Crown as CrownIcon, Trophy } from 'phosphor-react';
import type { FirestoreUserData } from '../../hooks/useProgressStore';
import type { UserProfileData } from '../../interfaces';
import { calculateLevelInfo } from '../../style/level';
import { fadeUp, popIn, spring, staggerContainer } from '../../style/motion';
import * as S from './style';

const DEV_TAG = 'Edu.dev#8636';
const MEDALS = ['gold', 'silver', 'bronze'] as const;

const avatarFor = (user: UserProfileData) =>
  user.fullTag === DEV_TAG
    ? '/Light.jpg'
    : `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.avatarSeed}`;

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
              xp: data.xp || 0,
              level: calculateLevelInfo(data.xp || 0).level,
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

  // O XP do líder vira a régua das barrinhas de cada linha.
  const topXp = useMemo(
    () => Math.max(1, ...ranking.map((u) => u.xp ?? 0)),
    [ranking]
  );

  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  // Ordem visual do pódio: prata, ouro, bronze — com o ouro no meio e no alto.
  const podiumOrder = [podium[1], podium[0], podium[2]];

  if (isLoading) {
    return (
      <S.CenteredContainer>
        <LoadingSpinner />
        <p>Montando o ranking...</p>
      </S.CenteredContainer>
    );
  }

  if (error) {
    return (
      <S.CenteredContainer>
        <p style={{ color: '#FB7185' }}>{error}</p>
        <BackButton onClick={onBack}>&larr; Voltar</BackButton>
      </S.CenteredContainer>
    );
  }

  return (
    <S.RankingContainer>
      <BackButton onClick={onBack}>&larr; Voltar</BackButton>

      <S.TitleRow>
        <Trophy size={32} weight="fill" />
        <Title style={{ marginBottom: 0, paddingBottom: 0 }}>
          Ranking Global
        </Title>
      </S.TitleRow>
      <Subtitle style={{ marginBottom: 0 }}>
        Os 50 estudantes com mais XP na plataforma.
      </Subtitle>

      {ranking.length === 0 ? (
        <S.CenteredContainer>
          <p>O ranking ainda está vazio. Seja o primeiro a marcar pontos!</p>
        </S.CenteredContainer>
      ) : (
        <>
          <S.Podium
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.14, 0.1)}
          >
            {podiumOrder.map((user, i) => {
              if (!user) return <div key={`empty-${i}`} />;

              // podiumOrder é [prata, ouro, bronze]; o índice real vem do rank.
              const place = (user.rank ?? 1) - 1;
              const medal = MEDALS[place] ?? 'bronze';

              return (
                <S.PodiumSlot
                  key={user.uid}
                  $medal={medal}
                  variants={popIn}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                  onClick={() => onViewProfile(user)}
                >
                  {medal === 'gold' && (
                    <S.Crown
                      initial={{ y: -14, opacity: 0, rotate: -20 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      transition={{ ...spring, delay: 0.45 }}
                    >
                      <CrownIcon size={26} weight="fill" />
                    </S.Crown>
                  )}

                  <S.PodiumAvatar
                    $medal={medal}
                    src={avatarFor(user)}
                    alt={user.username || 'Avatar'}
                  />

                  <S.PodiumName>{user.username}</S.PodiumName>
                  <S.PodiumXp $medal={medal}>
                    {(user.xp ?? 0).toLocaleString('pt-BR')} XP
                  </S.PodiumXp>

                  <S.PodiumBlock $medal={medal}>
                    <motion.span
                      className="place"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ ...spring, delay: 0.3 }}
                    >
                      {place + 1}
                    </motion.span>
                  </S.PodiumBlock>
                </S.PodiumSlot>
              );
            })}
          </S.Podium>

          <S.List
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.04, 0.5)}
          >
            {rest.map((user) => {
              const isCurrentUser = user.uid === auth.currentUser?.uid;
              const pct = Math.round(((user.xp ?? 0) / topXp) * 100);

              return (
                <S.UserRow
                  key={user.uid}
                  $isCurrentUser={isCurrentUser}
                  variants={fadeUp}
                  whileHover={{ x: 6 }}
                  whileTap={{ scale: 0.99 }}
                  transition={spring}
                  onClick={() => onViewProfile(user)}
                >
                  <S.Rank>#{user.rank}</S.Rank>
                  <S.Avatar
                    src={avatarFor(user)}
                    alt={user.username || 'Avatar'}
                  />
                  <S.UserInfo>
                    <S.Username>
                      {user.username}
                      {isCurrentUser && <span>VOCÊ</span>}
                    </S.Username>
                    <S.UserStats>
                      <S.LevelPill>Nv {user.level}</S.LevelPill>
                      <S.XpTrack>
                        <S.XpFill
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.6,
                          }}
                        />
                      </S.XpTrack>
                      <span>{(user.xp ?? 0).toLocaleString('pt-BR')} XP</span>
                    </S.UserStats>
                  </S.UserInfo>
                </S.UserRow>
              );
            })}
          </S.List>
        </>
      )}
    </S.RankingContainer>
  );
};
