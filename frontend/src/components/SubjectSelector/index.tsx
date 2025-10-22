// SubjectSelector.tsx
import React from 'react';
import {
  Divide,
  Code,
  Atom,
  Flask,
  GlobeHemisphereWest,
  Scroll,
  Translate,
  Brain,
  MusicNotesSimple,
  Book,
  Leaf,
  TestTube,
  Sword,
  Timer,
  Question,
  Heart,
  Lightning,
} from 'phosphor-react';
import { Subtitle, Title } from '../../style/globalStyle';
import type { Materia } from '../../interfaces';
import { useProgressStore } from '../../hooks/useProgressStore';
import {
  BrainControls,
  BrainInfo,
  BrainstormContent,
  BrainstormDescription,
  BrainstormSection,
  BrainStormTitle,
  CategoryTitle,
  Container,
  LargeButton,
  Loader,
  LoaderWrapper,
  ProgressBarContainer,
  ProgressBarFill,
  ProgressLabel,
  Separator,
  SubjectCard,
  SubjectGrid,
} from './style';

type SubjectInfo = Omit<Materia, 'niveis'> & {
  categoria: string;
  iconName: string;
  qtdQuestoes?: number;
};

const hexToLuminance = (hex = '#000000') => {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum;
};
const getContrastText = (bg = '#000000') =>
  hexToLuminance(bg) > 0.55 ? '#0b0b0b' : '#ffffff';

const iconMap: { [key: string]: React.ReactNode } = {
  Divide: <Divide size={36} color="white" weight="light" />,
  Code: <Code size={36} color="white" weight="light" />,
  Atom: <Atom size={36} color="white" weight="light" />,
  Flask: <Flask size={36} color="white" weight="light" />,
  TestTube: <TestTube size={36} color="white" weight="light" />,
  Leaf: <Leaf size={36} color="white" weight="light" />,
  GlobeHemisphereWest: (
    <GlobeHemisphereWest size={36} color="white" weight="light" />
  ),
  Scroll: <Scroll size={36} color="white" weight="light" />,
  Translate: <Translate size={36} color="white" weight="light" />,
  Brain: <Brain size={36} color="white" weight="light" />,
  MusicNotesSimple: <MusicNotesSimple size={36} color="white" weight="light" />,
};
const getIcon = (iconName: string) =>
  iconMap[iconName] || <Book size={36} color="white" weight="light" />;

export const SubjectSelector: React.FC<{
  subjects: readonly SubjectInfo[];
  onSelect: (subject: SubjectInfo) => void;
  onStartBrainstorm: () => void;
  onStartMultiplayer: () => void;
}> = ({ subjects, onSelect, onStartBrainstorm, onStartMultiplayer }) => {
  const groupedSubjects = subjects.reduce((acc, subject) => {
    const category = subject.categoria || 'Outros';
    (acc[category] ||= []).push(subject);
    return acc;
  }, {} as Record<string, SubjectInfo[]>);

  const progress = useProgressStore((s) => s.progress);

  const computeCompletedLevels = (subjectId: string) => {
    const subjectProgress = progress?.[subjectId] ?? {};
    const completed = Object.values(subjectProgress).filter(
      (lvl: any) => lvl?.concluido
    ).length;
    return completed;
  };

  const computeCorrectAnswers = (subjectId: string) => {
    const subjectProgress = progress?.[subjectId] ?? {};

    const totalCorrect = Object.values(subjectProgress).reduce(
      (sum, lvl: any) => sum + (lvl?.acertos || 0),
      0
    );

    return totalCorrect;
  };

  const computeSubjectPercent = (subjectId: string, totalLevels = 3) => {
    const completed = computeCompletedLevels(subjectId);
    const total = Math.max(1, totalLevels);
    const raw = (completed / total) * 100;
    const percent = Math.round(Math.max(0, Math.min(100, raw)));
    return percent;
  };

  return (
    <Container>
      <Title>Bem-vindo ao StudyQuest!</Title>
      <Subtitle style={{ marginBottom: '2.2rem', color: '#c9d1d9' }}>
        Escolha uma matéria e bora detonar a curva de aprendizado.
      </Subtitle>

      {subjects.length === 0 ? (
        <LoaderWrapper>
          <Loader />
          <p style={{ color: '#b9bbbe', marginTop: '1rem' }}>
            Carregando matérias...
          </p>
        </LoaderWrapper>
      ) : (
        <>
          {Object.entries(groupedSubjects).map(
            ([category, subjectsInCategory]) => (
              <section key={category}>
                <CategoryTitle>{category}</CategoryTitle>
                <SubjectGrid>
                  {subjectsInCategory.map((subject, idx) => {
                    const totalLevels = 3;
                    const correctAnswers = computeCorrectAnswers(subject.id);
                    const completed = computeCompletedLevels(subject.id);
                    const percent = computeSubjectPercent(
                      subject.id,
                      totalLevels
                    );
                    const textColor = getContrastText(
                      subject.cor.bg || '#111827'
                    );
                    return (
                      <SubjectCard
                        key={subject.id}
                        onClick={() => onSelect(subject)}
                        bg={subject.cor.bg}
                        text={textColor}
                        aria-label={`${subject.nome} - ${percent}% completo`}
                        style={{ animationDelay: `${(idx % 6) * 35}ms` }}
                      >
                        <div className="top">
                          <div className="icon-wrap" aria-hidden>
                            {getIcon(subject.iconName)}
                          </div>

                          <div style={{ flex: 1 }}>
                            <h3>{subject.nome}</h3>
                            <div className="meta">
                              {completed}/{totalLevels} níveis •{' '}
                              {correctAnswers} acertos
                            </div>
                          </div>
                          <div style={{ marginLeft: 8, textAlign: 'right' }} />
                        </div>

                        <div
                          className="progress-wrap"
                          role="progressbar"
                          aria-valuenow={percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${subject.nome} progresso`}
                        >
                          <ProgressBarContainer>
                            <ProgressBarFill
                              $percent={percent}
                              $delay={idx * 100}
                            />
                          </ProgressBarContainer>
                          <ProgressLabel>
                            <span style={{ opacity: 0.9 }}>{percent}%</span>
                          </ProgressLabel>
                        </div>
                      </SubjectCard>
                    );
                  })}
                </SubjectGrid>
              </section>
            )
          )}
          <Separator />
        </>
      )}

      {/* A seção Brainstorm fica fora da checagem para ser um CTA de destaque */}
      <BrainstormSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <BrainstormContent>
          <BrainStormTitle>
            <Brain size={40} weight="bold" />
            Brainstorm
          </BrainStormTitle>

          <BrainstormDescription>
            Modo de quiz rápido e frenético contra o relógio. Ideal para testar
            seus conhecimentos sob pressão e ganhar XP bônus!
          </BrainstormDescription>

          <BrainControls>
            <LargeButton onClick={onStartBrainstorm}>
              <Brain size={18} weight="bold" />
              Solo
            </LargeButton>
            <LargeButton $variant="accent" onClick={onStartMultiplayer}>
              <Sword size={18} weight="bold" />
              Multiplayer
            </LargeButton>
          </BrainControls>
        </BrainstormContent>

        <BrainInfo>
          <h4>
            <Flask size={20} weight="bold" />
            Como funciona
          </h4>
          <ul>
            <li>
              <Timer size={20} /> <strong>60s</strong> por sessão
            </li>
            <li>
              <Question size={20} /> <strong>10s</strong> por pergunta
            </li>
            <li>
              <Heart size={20} /> <strong>3 vidas</strong> por jogo
            </li>
            <li>
              <Lightning size={20} /> Respostas rápidas dão{' '}
              <strong>XP bônus</strong>
            </li>
          </ul>
        </BrainInfo>
      </BrainstormSection>
    </Container>
  );
};
