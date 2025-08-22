import React from 'react';
import styled from 'styled-components';
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
} from 'phosphor-react';
import { Subtitle, Title } from '../../style/globalStyle';
import type { Materia } from '../../interfaces';

// --- TIPOS ---
type SubjectInfo = Omit<Materia, 'niveis'> & {
  categoria: string;
  iconName: string;
};

// --- COMPONENTES ESTILIZADOS ---
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
  padding: 1.5rem;
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  cursor: pointer;
  background-color: ${(props) => props.color.bg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.3);
  }

  h3 {
    font-family: 'Fira Code', monospace;
    font-size: 1.25rem;
    font-weight: bold;
    color: white;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

// --- LÓGICA DE ÍCONES ---
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
}: {
  subjects: readonly SubjectInfo[];
  onSelect: (subject: SubjectInfo) => void;
}) => {
  const groupedSubjects = subjects.reduce((acc, subject) => {
    const category = subject.categoria || 'Outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(subject);
    return acc;
  }, {} as { [key: string]: SubjectInfo[] });

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
            {subjectsInCategory.map((subject) => (
              <SubjectCard
                key={subject.id}
                onClick={() => onSelect(subject)}
                color={subject.cor}
              >
                {getIcon(subject.iconName)}
                <h3>{subject.nome}</h3>
              </SubjectCard>
            ))}
          </SubjectGrid>
        </section>
      ))}
    </div>
  );
};
