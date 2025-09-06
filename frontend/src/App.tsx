import { useState, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './config/firebase';
import {
  useProgressStore,
  type FirestoreUserData,
} from './hooks/useProgressStore';
import type { Materia, Nivel } from './interfaces';

import { ExercisePage } from './pages/ExercisePage';
import { LevelSelector } from './pages/LevelSelector';
import { SubjectSelector } from './components/SubjectSelector';
import { LevelHubPage } from './pages/LevelHubPage';
import { ContentPage } from './pages/ContentPage';
import { ProfileSetup } from './components/ProfileSetup';
import { TopBar } from './components/TopBar';
import { AuthPage } from './pages/AuthPage';
import { RankingPage } from './pages/Ranking';
import { BrainStorm } from './pages/BrainStorm';
import { MultiplayerLobbyPage } from './pages/MultiplayerLobbyPage';
import { ModalUserPerfil } from './components/ModalUserPerfil';
import { InviteModal } from './components/InviteModal';

import {
  AppContainer,
  Footer,
  MainContent,
  BarWrapper,
  FooterWrapper,
  RankingButton,
  HomeButton,
  LoadingContainer,
  LoadingSpinner,
} from './style/globalStyle';
import { House, Trophy } from 'phosphor-react';
import { socket } from './services/socket';
import { IncomingInviteModal } from './components/IncomingInviteModal';

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

type SubjectInfo = Omit<Materia, 'niveis'> & {
  categoria: string;
  iconName: string;
};

export default function App() {
  const [screen, setScreen] = useState('subject');
  const [isInitializing, setIsInitializing] = useState(true);
  const [subjectsList, setSubjectsList] = useState<SubjectInfo[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Materia | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Nivel | null>(null);
  const [allSubjectsData, setAllSubjectsData] = useState<Materia[]>([]);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isIncomingInviteModalOpen, setIsIncomingInviteModalOpen] =
    useState(false);
  const [inviterTag, setInviterTag] = useState<string | null>(null);
  const [gameRoomId, setGameRoomId] = useState<string | null>(null);

  const { fullTag, username, hydrateFromFirestore, resetLocalStore } =
    useProgressStore();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    // A gente só faz qualquer coisa se o usuário estiver logado e tiver uma fullTag
    if (fullTag) {
      // --- Define o que fazer em cada evento ---
      const onConnect = () => {
        console.log('Conectado ao servidor! Registrando como:', fullTag);
        socket.emit('register', fullTag); // Avisa o servidor quem nós somos
      };

      const onIncomingInvite = ({ from }: { from: string }) => {
        setInviterTag(from);
        setIsIncomingInviteModalOpen(true);
      };

      const onInviteError = ({ message }: { message: string }) => {
        alert(`Erro no convite: ${message}`);
      };

      const onGameStarted = ({ roomId }: { roomId: string }) => {
        setIsInviteModalOpen(false);
        setIsIncomingInviteModalOpen(false);
        setGameRoomId(roomId);
        setScreen('multiplayer_lobby');
      };

      const onInviteDeclined = ({ from }: { from: string }) => {
        alert(`O jogador ${from} recusou seu convite.`);
        setIsIncomingInviteModalOpen(false);
      };

      // --- Registra todos os "ouvintes" ---
      socket.on('connect', onConnect);
      socket.on('incoming_invite', onIncomingInvite);
      socket.on('invite_error', onInviteError);
      socket.on('game_started', onGameStarted);
      socket.on('invite_declined', onInviteDeclined);

      // --- Conecta ao servidor ---
      socket.connect();

      // --- Função de limpeza ---
      // Roda quando o usuário deslogar (fullTag mudar para null)
      return () => {
        console.log('Limpando listeners e desconectando o socket...');
        socket.off('connect', onConnect);
        socket.off('incoming_invite', onIncomingInvite);
        socket.off('invite_error', onInviteError);
        socket.off('game_started', onGameStarted);
        socket.off('invite_declined', onInviteDeclined);
        socket.disconnect();
      };
    }
  }, [fullTag]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        resetLocalStore();
        setIsInitializing(false);
        return;
      }
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          hydrateFromFirestore(doc.data() as FirestoreUserData);
        }
        setIsInitializing(false);
      });
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
    try {
      const response = await fetch(`/data/${subjectInfo.id}.json`);
      const subjectDetails: Materia = await response.json();
      setSelectedSubject(subjectDetails);
      setScreen('level');
    } catch (error) {
      console.error(`Falha ao carregar a matéria ${subjectInfo.nome}:`, error);
    }
  };

  const handleOnStartBrainstorm = async () => {
    if (allSubjectsData.length > 0) {
      setScreen('brainstorm');
      return;
    }
    try {
      const subjectPromises = subjectsList.map((subjectInfo) =>
        fetch(`/data/${subjectInfo.id}.json`).then((res) => res.json())
      );
      const allSubjects = await Promise.all(subjectPromises);
      setAllSubjectsData(allSubjects as Materia[]);
      setScreen('brainstorm');
    } catch (error) {
      console.error('Falha ao carregar dados para o modo Brainstorm:', error);
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
    setGameRoomId(null);
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
    if (screen === 'multiplayer_lobby' && gameRoomId) {
      return <MultiplayerLobbyPage roomId={gameRoomId} onGoHome={backToHome} />;
    }
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
    if (screen === 'brainstorm') {
      return <BrainStorm subjects={allSubjectsData} onBack={backToHome} />;
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
      <SubjectSelector
        onStartBrainstorm={handleOnStartBrainstorm}
        subjects={subjectsList}
        onSelect={handleSelectSubject}
        onStartMultiplayer={() => setIsInviteModalOpen(true)}
      />
    );
  };

  return (
    <>
      <GlobalStyle />
      <BarWrapper>
        <TopBar onClick={() => setIsUserModalOpen(true)} />
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
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
        />
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
        <IncomingInviteModal
          isOpen={isIncomingInviteModalOpen}
          inviterTag={inviterTag}
          onClose={() => setIsIncomingInviteModalOpen(false)}
        />
      </Footer>
    </>
  );
}
