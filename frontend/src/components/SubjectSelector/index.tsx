import React from 'react';
import styled, { keyframes } from 'styled-components';
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
} from 'phosphor-react';
import { Subtitle, Title } from '../../style/globalStyle';
import type { Materia } from '../../interfaces';
import { useProgressStore } from '../../hooks/useProgressStore';

// --- TIPOS ---
type SubjectInfo = Omit<Materia, 'niveis'> & {
  categoria: string;
  iconName: string;
};

// --- COMPONENTES ESTILIZADOS ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CategoryTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: bold;
  color: #ffffff;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #40444b;
  text-align: left;
`;

const SubjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const SubjectCard = styled.button<{ color: Materia['cor'] }>`
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.18);
  transition: all 0.18s;
  cursor: pointer;
  background-color: ${(props) => props.color.bg};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 0.5rem;
  min-height: 140px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.28);
  }

  .icon-row {
    display: flex;
    justify-content: center;
  }

  h3 {
    font-family: 'Fira Code', monospace;
    font-size: 1.15rem;
    font-weight: 700;
    color: white;
    margin: 0.25rem 0 0.5rem 0;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.18);
    text-align: center;
  }
`;

const ProgressBarContainer = styled.div`
  height: 10px;
  width: 100%;
  background: rgba(0, 0, 0, 0.14);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.12);
`;

const ProgressBarFill = styled.div<{ percent: number }>`
  width: ${(p) => Math.max(0, Math.min(100, p.percent))}%;
  height: 100%;
  /*  background: linear-gradient(
    90deg,
    rgba(67, 181, 129, 1),
    rgba(88, 101, 242, 1)
  ); */
  background: white;
  transition: width 400ms cubic-bezier(0.2, 0.9, 0.2, 1);
`;

/* PROGRESS LABEL ROW */
const ProgressRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.45rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
`;

const BrainstormSection = styled.section`
  margin-top: 2rem;
  padding-top: 2.5rem;
  border-top: 1px solid #40444b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const BrainstormButton = styled.button`
  background: linear-gradient(45deg, #7289da, #43b581);
  color: white;
  font-size: 1.3rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 1rem 1.4rem;
  }
`;

const MultiplayerButton = styled(BrainstormButton)`
  background: linear-gradient(45deg, #f04747, #faa61a);
`;

const BrainstormInfoCard = styled.div`
  background-color: #202225;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  text-align: left;
  border: 1px solid #40444b;

  h4 {
    margin-top: 0;
    font-size: 1.25rem;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    color: #b9bbbe;
    line-height: 1.6;
  }

  ul {
    padding-left: 20px;
    margin-bottom: 0;
    color: #b9bbbe;
    line-height: 1.6;
  }

  li::marker {
    color: #7289da;
  }
`;

export const TitleBrainStorm = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
  text-align: center;
  border-bottom: 2px solid #40444b;
  padding-bottom: 0.5rem;
  letter-spacing: -1px;
  animation: ${fadeIn} 0.5s ease-out;
  @media (max-width: 480px) {
    font-size: 1.85rem;
  }
`;

// --- ICON MAP (mantive) ---
const iconMap: { [key: string]: React.ReactNode } = {
  Divide: <Divide size={48} color="white" weight="light" />,
  Code: <Code size={48} color="white" weight="light" />,
  Atom: <Atom size={48} color="white" weight="light" />,
  Flask: <Flask size={48} color="white" weight="light" />,
  TestTube: <TestTube size={48} color="white" weight="light" />,
  Leaf: <Leaf size={48} color="white" weight="light" />,
  GlobeHemisphereWest: (
    <GlobeHemisphereWest size={48} color="white" weight="light" />
  ),
  Scroll: <Scroll size={48} color="white" weight="light" />,
  Translate: <Translate size={48} color="white" weight="light" />,
  Brain: <Brain size={48} color="white" weight="light" />,
  MusicNotesSimple: <MusicNotesSimple size={48} color="white" weight="light" />,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || <Book size={48} color="white" weight="light" />;
};

// --- COMPONENTE PRINCIPAL ---
export const SubjectSelector = ({
  subjects,
  onSelect,
  onStartBrainstorm,
  onStartMultiplayer,
}: {
  subjects: readonly SubjectInfo[];
  onSelect: (subject: SubjectInfo) => void;
  onStartBrainstorm: () => void;
  onStartMultiplayer: () => void;
}) => {
  const groupedSubjects = subjects.reduce((acc, subject) => {
    const category = subject.categoria || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(subject);
    return acc;
  }, {} as { [key: string]: SubjectInfo[] });

  const progress = useProgressStore((s) => s.progress);

  const computeSubjectPercent = (subjectId: string) => {
    const subjectProgress = progress?.[subjectId] ?? {};
    const levelEntries = Object.values(subjectProgress);

    if (levelEntries.length === 0) return 0;

    const completed = levelEntries.filter((lvl: any) => lvl?.concluido).length;
    const percent = Math.round((completed / levelEntries.length) * 100);
    return percent;
  };

  return (
    <div>
      <Title>Bem-vindo ao StudyQuest!</Title>
      <Subtitle style={{ marginBottom: '5rem' }}>
        Escolha uma matéria para começar sua jornada.
      </Subtitle>

      {Object.entries(groupedSubjects).map(([category, subjectsInCategory]) => (
        <section key={category}>
          <CategoryTitle>{category}</CategoryTitle>
          <SubjectGrid>
            {subjectsInCategory.map((subject) => {
              const percent = computeSubjectPercent(subject.id);
              return (
                <SubjectCard
                  key={subject.id}
                  onClick={() => onSelect(subject)}
                  color={subject.cor}
                  aria-label={`${subject.nome} - ${percent}% completo`}
                >
                  <div className="icon-row">{getIcon(subject.iconName)}</div>
                  <h3>{subject.nome}</h3>

                  <ProgressBarContainer>
                    <ProgressBarFill percent={percent} />
                  </ProgressBarContainer>

                  <ProgressRow>
                    <span style={{ opacity: 0.95 }}>{percent}%</span>
                  </ProgressRow>
                </SubjectCard>
              );
            })}
          </SubjectGrid>
        </section>
      ))}

      <BrainstormSection>
        <TitleBrainStorm>Brainstorm</TitleBrainStorm>
        <BrainstormInfoCard
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <BrainstormButton onClick={onStartBrainstorm}>
            <Brain size={32} weight="light" />
            Solo
          </BrainstormButton>
          <MultiplayerButton onClick={onStartMultiplayer}>
            <Sword size={32} weight="light" />
            Multiplayer
          </MultiplayerButton>
        </BrainstormInfoCard>

        <BrainstormInfoCard>
          <h4>
            <Flask size={24} weight="light" /> O que é o Modo Brainstorm?
          </h4>
          <p>
            Um desafio de ritmo acelerado para testar seus conhecimentos gerais!
            Responda o máximo de perguntas que puder de todas as matérias antes
            que o tempo acabe.
          </p>
          <ul>
            <li>
              Você tem <strong>60 segundos</strong> no total.
            </li>
            <li>
              Cada pergunta tem um limite de <strong>10 segundos</strong>.
            </li>
            <li>
              Você começa com <strong>3 vidas</strong>.
            </li>
            <li>
              Respostas rápidas e corretas rendem <strong>mais XP bônus</strong>
              !
            </li>
          </ul>
        </BrainstormInfoCard>
      </BrainstormSection>
    </div>
  );
};
