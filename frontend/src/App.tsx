// App.tsx
import { useState, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
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
import { FriendsList } from './components/FriendsList';
import { AchievementsPage } from './pages/AchievementsPage';
import {
  AppContainer,
  Footer,
  MainContent,
  BarWrapper,
  FooterWrapper,
  RankingButton,
  FriendsButton,
  HomeButton,
  LoadingContainer,
  LoadingSpinner,
  FooterCredit,
} from './style/globalStyle';
import { House, Trophy, Users } from 'phosphor-react';
import { socket } from './services/socket';
import { IncomingInviteModal } from './components/IncomingInviteModal';
import { Toaster } from 'react-hot-toast';
import { ChatWindow } from './components/ChatWindow';

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

type FriendDetails = {
  uid: string;
  username: string;
  fullTag: string;
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
  const [isFriendsListOpen, setIsFriendsListOpen] = useState(false);
  const [inviterTag, setInviterTag] = useState<string | null>(null);
  const [gameRoomId, setGameRoomId] = useState<string | null>(null);

  const { fullTag, uid, username, hydrateFromFirestore, resetLocalStore } =
    useProgressStore();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [activeChat, setActiveChat] = useState<FriendDetails | null>(null);

  useEffect(() => {
    if (!fullTag || !uid) {
      if (socket.connected) socket.disconnect();
      return;
    }

    const onConnect = () => {
      console.log('Conectado ao servidor! Registrando como:', fullTag);
      socket.emit('register', { fullTag, uid });
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

    socket.on('connect', onConnect);
    socket.on('incoming_invite', onIncomingInvite);
    socket.on('invite_error', onInviteError);
    socket.on('game_started', onGameStarted);
    socket.on('invite_declined', onInviteDeclined);

    if (!socket.connected) socket.connect();

    return () => {
      console.log('Limpando listeners e desconectando o socket...');
      socket.off('connect', onConnect);
      socket.off('incoming_invite', onIncomingInvite);
      socket.off('invite_error', onInviteError);
      socket.off('game_started', onGameStarted);
      socket.off('invite_declined', onInviteDeclined);
      if (socket.connected) socket.disconnect();
    };
  }, [fullTag, uid]);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        resetLocalStore();
        setIsInitializing(false);
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);

      try {
        await user.getIdToken(true);

        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          hydrateFromFirestore(snap.data() as FirestoreUserData);
        } else {
          console.log('Usuário novo (sem doc). abrindo ProfileSetup...');
        }
      } catch (err: unknown) {
        console.error('Erro ao buscar doc do usuário:', err);
        if (
          typeof err === 'object' &&
          err !== null &&
          ('code' in err || 'message' in err)
        ) {
          const code = (err as { code?: string }).code;
          const message = (err as { message?: string }).message;
          if (
            code === 'permission-denied' ||
            (typeof message === 'string' &&
              message.includes('permission-denied'))
          ) {
            resetLocalStore();
          }
        }
      } finally {
        setIsInitializing(false);
      }

      unsubscribeFirestore = onSnapshot(
        userDocRef,
        (d) => {
          try {
            if (d.exists()) {
              hydrateFromFirestore(d.data() as FirestoreUserData);
            } else {
              console.warn('Doc do usuário não existe (onSnapshot).');
            }
          } catch (err) {
            console.error('Erro no snapshot do usuário (handler):', err);
          }
        },
        (snapshotErr: unknown) => {
          console.error('Erro no snapshot listener:', snapshotErr);
          if (
            typeof snapshotErr === 'object' &&
            snapshotErr !== null &&
            'code' in snapshotErr &&
            (snapshotErr as { code?: string }).code === 'permission-denied'
          ) {
            console.warn(
              'Sem permissão para escutar o doc do usuário. Abrindo setup.'
            );
            resetLocalStore();
          }
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
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
    // <-- 2. ADICIONA A NOVA ROTA
    if (screen === 'achievements') {
      return <AchievementsPage onBack={backToHome} />;
    }
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
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <BarWrapper>
        <TopBar onClick={() => setIsUserModalOpen(true)} />
      </BarWrapper>

      <AppContainer>
        <MainContent>{renderScreen()}</MainContent>
      </AppContainer>

      <Footer>
        <FooterWrapper>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <RankingButton onClick={() => setScreen('ranking')}>
              <Trophy weight="bold" /> Ranking
            </RankingButton>
            <FriendsButton onClick={() => setIsFriendsListOpen(true)}>
              <Users weight="bold" /> Amigos
            </FriendsButton>
          </div>

          {screen !== 'subject' && screen !== 'ranking' && (
            <HomeButton onClick={backToHome} title="Voltar ao menu principal">
              <House size={24} weight="bold" />
            </HomeButton>
          )}

          <FooterCredit>
            Desenvolvido por:{' '}
            <a
              href="https://github.com/iHadesJ"
              target="_blank"
              rel="noopener noreferrer"
            >
              Eduardo Alexandre
            </a>
          </FooterCredit>
        </FooterWrapper>
        <ModalUserPerfil
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onNavigateToAchievements={() => setScreen('achievements')}
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
        <FriendsList
          onOpenChat={(friend) => setActiveChat(friend)}
          isOpen={isFriendsListOpen}
          onClose={() => setIsFriendsListOpen(false)}
        />
        {activeChat && (
          <ChatWindow friend={activeChat} onClose={() => setActiveChat(null)} />
        )}
      </Footer>
    </>
  );
}
