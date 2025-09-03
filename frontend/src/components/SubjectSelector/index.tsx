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
  Sword,
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

// --- NOVOS COMPONENTES ESTILIZADOS PARA O BRAINSTORM ---
const BrainstormSection = styled.section`
  margin-top: 5rem;
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

      {/* --- 3. NOVA SEÇÃO ADICIONADA ABAIXO --- */}
      <BrainstormSection>
        <BrainstormButton onClick={onStartBrainstorm}>
          <Brain size={32} weight="light" />
          Brainstorm
        </BrainstormButton>
        <MultiplayerButton onClick={onStartMultiplayer}>
          <Sword size={32} weight="light" />
          Multiplayer
        </MultiplayerButton>
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
