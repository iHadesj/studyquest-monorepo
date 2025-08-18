import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { ExercisePage } from './pages/ExercisePage';
import { SubjectSelector } from './components/SubjectSelector';
import { XPBar } from './components/XPBar';
import { useProgressStore } from './hooks/useProgressStore';
import type { Materia, Nivel } from './interfaces';
import { LevelHubPage } from './pages/LevelHubPage';
import { ContentPage } from './pages/ContentPage';
import { AppContainer, Footer, MainContent } from './style/globalStyle';
import { LevelSelector } from './pages/LevelSelector';

// --- ESTILOS GLOBAIS ---
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Fira Code', monospace;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #36393f;
    color: #dcddde;
  }
`;

// --- TIPOS ---
// Este tipo representa a matéria sem os níveis, usado na tela de seleção.
// Garante que a interface Materia tenha as novas propriedades.
type SubjectInfo = Omit<Materia, 'niveis'> & {
  categoria: string;
  iconName: string;
};

// --- COMPONENTES ESTILIZADOS (Fora do App para melhor performance) ---
const ResetButton = styled.button`
  bottom: 1rem;
  right: 1rem;
  background-color: #ed4245; /* Vermelho Discord */
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #c7383a;
  }
`;

const FooterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  p {
    margin: 0;
    font-size: 0.875rem;
  }
  a {
    color: #5865f2; /* Azul Discord */
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
`;

export default function App() {
  const [screen, setScreen] = useState('subject');
  const [subjectsList, setSubjectsList] = useState<SubjectInfo[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Materia | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Nivel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { resetProgress } = useProgressStore();

  useEffect(() => {
    const fetchSubjectsList = async () => {
      try {
        const response = await fetch('/data/materias.json');
        const data = await response.json();
        setSubjectsList(data);
      } catch (error) {
        console.error('Falha ao carregar a lista de matérias:', error);
      }
    };
    fetchSubjectsList();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const handleSelectSubject = async (subjectInfo: SubjectInfo) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/data/${subjectInfo.id}.json`);
      const subjectDetails: Materia = await response.json();
      setSelectedSubject(subjectDetails);
      setScreen('level');
    } catch (error) {
      console.error(`Falha ao carregar a matéria ${subjectInfo.nome}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLevel = (level: Nivel) => {
    setSelectedLevel(level);
    setScreen('hub'); // Leva para a nova tela de escolha
  };

  // Funções de navegação para "voltar"
  const backToSubjects = () => {
    setSelectedSubject(null);
    setScreen('subject');
  };

  const backToLevels = () => {
    setScreen('level');
  };

  const backToHub = () => {
    setScreen('hub');
  };

  const renderScreen = () => {
    if (isLoading) {
      return (
        <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Carregando...</p>
      );
    }

    // Lógica de renderização com as novas telas
    if (screen === 'hub' && selectedSubject && selectedLevel) {
      return (
        <LevelHubPage
          subject={selectedSubject}
          level={selectedLevel}
          onBack={backToLevels}
          onSelectStudy={() => setScreen('content')}
          onSelectPractice={() => setScreen('exercise')}
        />
      );
    }

    if (screen === 'content' && selectedSubject && selectedLevel) {
      return (
        <ContentPage
          level={selectedLevel}
          onBack={backToHub}
          onStartExercises={() => setScreen('exercise')}
        />
      );
    }

    if (screen === 'exercise' && selectedSubject && selectedLevel) {
      return (
        <ExercisePage
          subject={selectedSubject}
          level={selectedLevel}
          onBack={backToHub}
        />
      );
    }

    if (screen === 'level' && selectedSubject) {
      return (
        <LevelSelector
          subject={selectedSubject}
          onSelect={handleSelectLevel}
          onBack={backToSubjects}
        />
      );
    }

    return (
      <SubjectSelector subjects={subjectsList} onSelect={handleSelectSubject} />
    );
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <XPBar />
        <MainContent>{renderScreen()}</MainContent>
      </AppContainer>
      <Footer>
        <FooterWrapper>
          <p>
            Desenvolvido por{' '}
            <a href="https://github.com/iHadesJ">Eduardo Alexandre</a>
          </p>
          <ResetButton onClick={resetProgress}>Resetar Progresso</ResetButton>
        </FooterWrapper>
      </Footer>
    </>
  );
}
