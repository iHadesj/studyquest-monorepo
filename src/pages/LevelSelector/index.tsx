import { useProgressStore } from '../../hooks/useProgressStore';
import type { Materia, Nivel } from '../../interfaces';
import {
  BackButton,
  LevelButton,
  LevelList,
  LevelSelectorWrapper,
  Subtitle,
  Title,
} from '../../style/globalStyle';
import { LockIcon } from '../../style/icons';
import { Star } from 'phosphor-react';
import styled from 'styled-components';

// --- COMPONENTES ESTILIZADOS PARA AS ESTRELAS ---
const LevelInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StarsDisplay = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

export const LevelSelector = ({
  subject,
  onSelect,
  onBack,
}: {
  subject: Materia;
  onSelect: (level: Nivel) => void;
  onBack: () => void;
}) => {
  const progress = useProgressStore((state) => state.progress);
  const isLevelUnlocked = (levelIndex: number) => {
    if (levelIndex === 0) return true;

    const prevLevel = subject.niveis[levelIndex - 1];
    const prevLevelProgress = progress[subject.id]?.[prevLevel.id];

    if (!prevLevelProgress?.concluido) {
      return false;
    }

    if (prevLevel.minAcertosParaDesbloquearProximo === null) {
      return true;
    }

    return (
      prevLevelProgress.acertos >= prevLevel.minAcertosParaDesbloquearProximo
    );
  };

  return (
    <LevelSelectorWrapper>
      <BackButton onClick={onBack}>&larr; Voltar para matérias</BackButton>
      <Title>Matéria: {subject.nome}</Title>
      <Subtitle>Selecione o nível para iniciar os estudos.</Subtitle>
      <LevelList>
        {subject.niveis.map((level, index) => {
          const unlocked = isLevelUnlocked(index);
          const levelProgress = progress[subject.id]?.[level.id];
          return (
            <LevelButton
              key={level.id}
              onClick={() => unlocked && onSelect(level)}
              disabled={!unlocked}
            >
              <LevelInfoContainer>
                <h2>{level.nome}</h2>
                {levelProgress && (
                  <>
                    <p>
                      Acertos: {levelProgress.acertos}/{level.exercicios.length}
                    </p>
                    <StarsDisplay>
                      {[1, 2, 3].map((i) => (
                        <Star
                          key={i}
                          size={20}
                          color={
                            i <= levelProgress.estrelas ? '#f1c40f' : '#72767d'
                          }
                          weight="fill"
                        />
                      ))}
                    </StarsDisplay>
                  </>
                )}
              </LevelInfoContainer>
              {!unlocked && <LockIcon />}
            </LevelButton>
          );
        })}
      </LevelList>
    </LevelSelectorWrapper>
  );
};
