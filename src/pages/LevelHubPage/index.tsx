import { BookOpen, PencilSimple } from 'phosphor-react';
import type { Materia, Nivel } from '../../interfaces';
import { Subtitle, Title } from '../../style/globalStyle';
import {
  AlignedBackButton,
  HubHeader,
  HubWrapper,
  OptionButton,
  OptionsContainer,
} from './style';

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
      <HubHeader>
        <AlignedBackButton onClick={onBack}>&larr; Voltar</AlignedBackButton>
        <Title
          style={{ border: 'none', paddingBottom: 0, marginBottom: '0.25rem' }}
        >
          {subject.nome}
        </Title>
        <Subtitle style={{ margin: 0 }}>{level.nome}</Subtitle>
      </HubHeader>

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
