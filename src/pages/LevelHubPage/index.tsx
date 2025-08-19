import { BookOpen, PencilSimple, Lock } from 'phosphor-react';
import { useProgressStore } from '../../hooks/useProgressStore';
import type { Materia, Nivel } from '../../interfaces';
import { BackButton, Subtitle, Title } from '../../style/globalStyle';
import { HubWrapper, OptionButton, OptionsContainer } from './style';

export const LevelHubPage = ({
  subject,
  level,
  onBack,
  onSelectStudy,
  onSelectPractice,
}: {
  subject: Materia;
  level: Nivel;
  onBack: () => void;
  onSelectStudy: () => void;
  onSelectPractice: () => void;
}) => {
  const progress = useProgressStore((state) => state.progress);
  const levelProgress = progress[subject.id]?.[level.id];

  const totalExercicios = level.exercicios.length;
  const passouNosAcertos =
    level.minAcertosParaDesbloquearProximo !== null &&
    levelProgress &&
    levelProgress.acertos >= level.minAcertosParaDesbloquearProximo;
  const pontuacaoPerfeita =
    levelProgress && levelProgress.acertos === totalExercicios;
  const passou = passouNosAcertos || pontuacaoPerfeita;

  const tentativasRestantes = 3 - (levelProgress?.tentativas || 0);
  const exerciciosBloqueados = passou || tentativasRestantes <= 0;

  let practiceButtonText = 'Fazer Exercícios';
  if (levelProgress) {
    if (passou) {
      practiceButtonText = 'Nível Concluído!';
    } else if (tentativasRestantes > 0) {
      practiceButtonText = `Tentar de Novo (${tentativasRestantes} restantes)`;
    } else {
      practiceButtonText = 'Tentativas Esgotadas';
    }
  }

  return (
    <HubWrapper>
      <BackButton onClick={onBack}>&larr; Voltar para Níveis</BackButton>
      <Title>{subject.nome}</Title>
      <Subtitle>{level.nome}</Subtitle>

      <OptionsContainer>
        <OptionButton onClick={onSelectStudy}>
          <BookOpen size={48} weight="light" />
          <h2>Estudar Conteúdo</h2>
        </OptionButton>

        <OptionButton
          onClick={onSelectPractice}
          disabled={exerciciosBloqueados}
        >
          {exerciciosBloqueados ? (
            <Lock size={48} weight="light" />
          ) : (
            <PencilSimple size={48} weight="light" />
          )}
          <h2>{practiceButtonText}</h2>
        </OptionButton>
      </OptionsContainer>
    </HubWrapper>
  );
};
