import { BookOpen, PencilSimple } from 'phosphor-react';
import type { Materia, Nivel } from '../../interfaces';
import { BackButton, Subtitle, Title } from '../../style/globalStyle';
import { HubWrapper, OptionButton, OptionsContainer } from './style';

// --- COMPONENTE PRINCIPAL ---
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
  return (
    <HubWrapper>
      <BackButton onClick={onBack}>&larr; Voltar para Matérias</BackButton>
      <Title>{subject.nome}</Title>
      <Subtitle>{level.nome}</Subtitle>

      <OptionsContainer>
        <OptionButton onClick={onSelectStudy}>
          <BookOpen size={48} weight="light" />
          <h2>Estudar Conteúdo</h2>
        </OptionButton>

        <OptionButton onClick={onSelectPractice}>
          <PencilSimple size={48} weight="light" />
          <h2>Fazer Exercícios</h2>
        </OptionButton>
      </OptionsContainer>
    </HubWrapper>
  );
};
