import { BookOpen } from 'phosphor-react';
import type { Nivel } from '../../interfaces';
import { BackButton, ContentBox, Title } from '../../style/globalStyle';
import { ContentWrapper, StartExercisesButton, SummaryText } from './style';

// --- FUNÇÃO AUXILIAR PARA FORMATAR O TEXTO ---
const formatText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove os asteriscos e envolve o texto em uma tag <strong>
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

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
      <BackButton onClick={onBack}>&larr; Voltar</BackButton>
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
        {/* Usamos a nova função para renderizar o resumo formatado */}
        <SummaryText>{formatText(level.conteudo.resumo)}</SummaryText>
      </ContentBox>
      <StartExercisesButton onClick={onStartExercises}>
        <BookOpen weight="bold" />
        Começar Exercícios
      </StartExercisesButton>
    </ContentWrapper>
  );
};
