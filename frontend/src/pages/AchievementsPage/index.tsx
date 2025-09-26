// src/pages/AchievementsPage/index.tsx
import { useProgressStore } from '../../hooks/useProgressStore';
import { TODAS_AS_CONQUISTAS } from '../../services/achievements';
import { BackButton, Title, Subtitle } from '../../style/globalStyle';
import * as S from './style';

interface AchievementsPageProps {
  onBack: () => void;
}

export function AchievementsPage({ onBack }: AchievementsPageProps) {
  const { unlockedAchievements, username } = useProgressStore();

  return (
    <S.AchievementsWrapper>
      <BackButton onClick={onBack}>&larr; Voltar</BackButton>
      <Title>Estante de Troféus</Title>
      <Subtitle>As conquistas de {username} no StudyQuest.</Subtitle>

      <S.AchievementsGrid>
        {TODAS_AS_CONQUISTAS.map((conquista) => {
          const isUnlocked = unlockedAchievements.includes(conquista.id);
          return (
            <S.AchievementCard
              key={conquista.id}
              $unlocked={isUnlocked}
              $rarity={conquista.raridade}
            >
              <S.AchievementIcon>
                {isUnlocked ? conquista.icon : '❓'}
              </S.AchievementIcon>
              <S.AchievementName>{conquista.nome}</S.AchievementName>
              <S.AchievementDescription>
                {isUnlocked
                  ? conquista.descricao
                  : 'Continue jogando para desbloquear.'}
              </S.AchievementDescription>
              <S.AchievementRarity>{conquista.raridade}</S.AchievementRarity>
            </S.AchievementCard>
          );
        })}
      </S.AchievementsGrid>
    </S.AchievementsWrapper>
  );
}
