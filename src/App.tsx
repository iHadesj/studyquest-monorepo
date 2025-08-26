import { useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './config/firebase';
import { ExercisePage } from './pages/ExercisePage';
import { LevelSelector } from './pages/LevelSelector';
import { SubjectSelector } from './components/SubjectSelector';
import {
  useProgressStore,
  type FirestoreUserData,
} from './hooks/useProgressStore';
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
import { House, Trophy } from 'phosphor-react';
import { AuthPage } from './pages/AuthPage';
import { RankingPage } from './pages/Ranking';
import { ModalUserPerfil } from './components/ModalUserPerfil';

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

// --- COMPONENTES ESTILIZADOS ---
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
    gap: 1rem;
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
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #4f5bd5;
  }

  @media (max-width: 480px) {
    position: static;
    transform: none;
    margin: 0 1rem;
  }
`;

const RankingButton = styled.button`
  background: none;
  border: none;
  color: #b9bbbe;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  &:hover {
    color: #ffffff;
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-left-color: #5865f2;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #36393f;
`;

export default function App() {
  const [screen, setScreen] = useState('subject');
  const [isInitializing, setIsInitializing] = useState(true);
  const [subjectsList, setSubjectsList] = useState<SubjectInfo[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Materia | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Nivel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  console.log(isLoading);

  const { username, hydrateFromFirestore, resetLocalStore } =
    useProgressStore();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);

      if (!user) {
        resetLocalStore();
        setIsInitializing(false); // <-- CHANGE THIS
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);

      const unsubscribeFirestore = onSnapshot(
        userDocRef,
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data() as FirestoreUserData;
            hydrateFromFirestore(userData);
          } else {
            hydrateFromFirestore({
              username: null,
              xp: 0,
              progress: {},
              avatarSeed: Math.random().toString(36).substring(7),
            });
          }
          setIsInitializing(false); // <-- CHANGE THIS
        },
        (error) => {
          console.error('Erro ao buscar dados do usuário:', error);
          setIsInitializing(false); // <-- AND CHANGE THIS
        }
      );

      return () => unsubscribeFirestore();
    });

    return () => unsubscribeAuth();
  }, [hydrateFromFirestore, resetLocalStore]);

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

  if (isInitializing) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  if (!firebaseUser) {
    return <AuthPage />;
  }

  if (!username) {
    return <ProfileSetup />;
  }

  const renderScreen = () => {
    if (screen === 'ranking') {
      return <RankingPage onBack={backToHome} />;
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
        <TopBar onClick={() => setIsModalOpen(true)} />
      </BarWrapper>

      <AppContainer>
        <MainContent>{renderScreen()}</MainContent>
      </AppContainer>

      <Footer>
        <FooterWrapper>
          <RankingButton onClick={() => setScreen('ranking')}>
            <Trophy weight="bold" /> Ranking
          </RankingButton>
          {screen !== 'subject' && screen !== 'ranking' && (
            <HomeButton onClick={backToHome} title="Voltar ao menu principal">
              <House size={24} weight="bold" />
            </HomeButton>
          )}
        </FooterWrapper>
        <ModalUserPerfil
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </Footer>
    </>
  );
}
