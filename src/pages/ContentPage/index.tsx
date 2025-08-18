import { BookOpen } from 'phosphor-react';
import type { Nivel } from '../../interfaces';
import { BackButton, ContentBox, Title } from '../../style/globalStyle';
import { ContentWrapper, StartExercisesButton, SummaryText } from './style';

// --- COMPONENTE PRINCIPAL ---
export const ContentPage = ({
  level,
  onBack,
  onStartExercises,
}: {
  level: Nivel;
  onBack: () => void;
  onStartExercises: () => void;
}) => {
  return (
    <ContentWrapper>
      <BackButton onClick={onBack}>&larr; Voltar para Níveis</BackButton>
      <ContentBox>
        <Title
          as="h1"
          style={{
            textAlign: 'left',
            fontSize: '2rem',
            border: 'none',
            padding: 0,
          }}
        >
          {level.conteudo.titulo}
        </Title>
        <SummaryText>{level.conteudo.resumo}</SummaryText>
      </ContentBox>
      <StartExercisesButton onClick={onStartExercises}>
        <BookOpen weight="bold" />
        Começar Exercícios
      </StartExercisesButton>
    </ContentWrapper>
  );
};
