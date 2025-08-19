import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { ExercisePage } from './pages/ExercisePage';
import { LevelSelector } from './pages/LevelSelector';
import { SubjectSelector } from './components/SubjectSelector';
import { useProgressStore } from './hooks/useProgressStore';
import type { Materia, Nivel } from './interfaces';
import { LevelHubPage } from './pages/LevelHubPage';
import { ContentPage } from './pages/ContentPage';
import {
  AppContainer,
  Footer,
  MainContent,
  BarWrapper,
} from './style/globalStyle';
import { ProfileSetup } from './components/ProfileSetup';
import { TopBar } from './components/TopBar';
import { House } from 'phosphor-react';

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
type SubjectInfo = Omit<Materia, 'niveis'> & {
  categoria: string;
  iconName: string;
};

const ResetButton = styled.button`
  background-color: #ed4245;
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
  position: relative;
  p {
    margin: 0;
    font-size: 0.875rem;
  }
  a {
    color: #5865f2;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 480px) {
    justify-content: center;
    p {
      display: none;
    }
  }
`;

const HomeButton = styled.button`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #5865f2;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    background-color: #4f5bd5;
  }

  @media (max-width: 480px) {
    position: static;
    transform: none;
    margin: 0 1rem;
  }
`;

export default function App() {
  const [screen, setScreen] = useState('subject');
  const [subjectsList, setSubjectsList] = useState<SubjectInfo[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Materia | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Nivel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { resetProgress, username } = useProgressStore();

  useEffect(() => {
    if (username) {
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
    }
  }, [username]);

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
    setScreen('hub');
  };

  const backToHome = () => {
    setSelectedSubject(null);
    setSelectedLevel(null);
    setScreen('subject');
  };

  const backToLevels = () => {
    setScreen('level');
  };

  const backToHub = () => {
    setScreen('hub');
  };

  if (!username) {
    return <ProfileSetup />;
  }

  const renderScreen = () => {
    if (isLoading) {
      return (
        <p style={{ textAlign: 'center', fontSize: '1.5rem' }}>Carregando...</p>
      );
    }
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
          onBack={backToHome}
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

      <BarWrapper>
        <TopBar />
      </BarWrapper>

      <AppContainer>
        <MainContent>{renderScreen()}</MainContent>
      </AppContainer>

      <Footer>
        <FooterWrapper>
          <p>
            Desenvolvido por{' '}
            <a href="https://github.com/iHadesJ">Eduardo Alexandre</a>
          </p>

          {screen !== 'subject' && (
            <HomeButton onClick={backToHome} title="Voltar ao menu principal">
              <House size={24} weight="bold" />
            </HomeButton>
          )}

          <ResetButton onClick={resetProgress}>Resetar Progresso</ResetButton>
        </FooterWrapper>
      </Footer>
    </>
  );
}
