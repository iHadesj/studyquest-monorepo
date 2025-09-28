import { BookOpen } from 'phosphor-react';
import { type Variants } from 'framer-motion';
import type { Nivel } from '../../interfaces';
import { BackButton, Title } from '../../style/globalStyle';
import { ContentWrapper, StartExercisesButton, ContentCard } from './style';

const formatText = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

export const ContentPage = ({
  level,
  onBack,
  onStartExercises,
}: {
  level: Nivel;
  onBack: () => void;
  onStartExercises: () => void;
}) => {
  const contentParagraphs = level.conteudo.resumo
    .split('\n')
    .filter((p) => p.trim() !== '');

  return (
    <ContentWrapper>
      <BackButton onClick={onBack}>&larr; Voltar</BackButton>
      <Title
        as="h1"
        style={{
          textAlign: 'left',
          border: 'none',
          padding: 0,
          marginBottom: '2rem',
        }}
      >
        {level.conteudo.titulo}
      </Title>

      {contentParagraphs.map((paragraph, index) => (
        <ContentCard
          key={index}
          custom={index}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          dangerouslySetInnerHTML={{ __html: formatText(paragraph) }}
        />
      ))}

      <StartExercisesButton onClick={onStartExercises}>
        <BookOpen weight="bold" />
        Bora pros Exercícios!
      </StartExercisesButton>
    </ContentWrapper>
  );
};
