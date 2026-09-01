import { useState, useEffect, useMemo, type JSX } from 'react';
import { createGlobalStyle } from 'styled-components';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './config/firebase';
import {
  useProgressStore,
  type FirestoreUserData,
} from './hooks/useProgressStore';
import type { Materia, Nivel, UserProfileData } from './interfaces';
import { AuthPage } from './pages/AuthPage';
import { ProfileSetup } from './components/ProfileSetup';
import { TopBar } from './components/TopBar';
import { SubjectSelector } from './components/SubjectSelector';
import { LevelSelector } from './pages/LevelSelector';
import { LevelHubPage } from './pages/LevelHubPage';
import { ContentPage } from './pages/ContentPage';
import { ExercisePage } from './pages/ExercisePage';
import { BrainStorm } from './pages/BrainStorm';
import { MultiplayerLobbyPage } from './pages/MultiplayerLobbyPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ChatWindow } from './components/ChatWindow';
import { ModalUserPerfil } from './components/ModalUserPerfil';
import { InviteModal } from './components/InviteModal';
import { IncomingInviteModal } from './components/IncomingInviteModal';
import {
  AppContainer,
  BarWrapper,
  Footer,
  FooterCredit,
  FooterWrapper,
  FriendsButton,
  HomeButton,
  LoadingContainer,
  LoadingSpinner,
  MainContent,
  RankingButton,
} from './style/globalStyle';
import { House, Trophy, Users } from 'phosphor-react';
import { AnimatePresence, motion } from 'framer-motion';
import { socket } from './services/socket';
import { api } from './services/api';
import toast, { Toaster } from 'react-hot-toast';
import { calculateLevelInfo } from './style/level';
import { RankingPage } from './pages/Ranking';
import { FriendsList } from './components/FriendsList';
import { AuroraBackground } from './components/AuroraBackground';
import { theme } from './style/theme';
import { pageTransition } from './style/motion';

type SubjectInfo = Omit<Materia, 'niveis'>;
export type GamePlayer = { tag: string; score: number };

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: ${theme.font.sans};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-color: ${theme.color.bg};
    color: ${theme.color.text};
  }

  ::selection {
    background: rgba(124, 92, 255, 0.35);
    color: #fff;
  }

  /* Scrollbar combinando com o resto da interface. */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${theme.color.primary} transparent;
  }
  *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  *::-webkit-scrollbar-track {
    background: transparent;
  }
  *::-webkit-scrollbar-thumb {
    background: rgba(124, 92, 255, 0.45);
    border-radius: ${theme.radius.pill};
    border: 2px solid transparent;
    background-clip: content-box;
  }
  *::-webkit-scrollbar-thumb:hover {
    background: rgba(124, 92, 255, 0.7);
    background-clip: content-box;
  }

  button {
    font-family: inherit;
  }
`;

export default function App() {
  const [screen, setScreen] = useState('subject');
  const [isInitializing, setIsInitializing] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [subjectsList, setSubjectsList] = useState<SubjectInfo[]>([]);
  const [allSubjectsData, setAllSubjectsData] = useState<Materia[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Materia | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Nivel | null>(null);
  const [isFriendsListOpen, setIsFriendsListOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isIncomingInviteModalOpen, setIsIncomingInviteModalOpen] =
    useState(false);
  const [inviterTag, setInviterTag] = useState<string | null>(null);
  const [gameRoomId, setGameRoomId] = useState<string | null>(null);
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([]);
  const [activeChat, setActiveChat] = useState<UserProfileData | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [viewedUser, setViewedUser] = useState<UserProfileData | null>(null);

  const currentUserStoreData = useProgressStore((state) => state);
  const { hydrateFromFirestore, resetLocalStore } = useProgressStore();

  const currentUserProfile: UserProfileData = useMemo(() => {
    const { level } = calculateLevelInfo(currentUserStoreData.xp);
    return {
      ...currentUserStoreData,
      level: level,
    };
  }, [currentUserStoreData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  useEffect(() => {
    if (screen === 'exercise') setActiveChat(null);
  }, [screen]);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        resetLocalStore();
        if (socket.connected) socket.disconnect();
        setIsInitializing(false);
        return;
      }
      const userDocRef = doc(db, 'users', user.uid);
      unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          hydrateFromFirestore(docSnap.data() as FirestoreUserData);
        }
      });
      setIsInitializing(false);
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [hydrateFromFirestore, resetLocalStore]);

  useEffect(() => {
    const fullTag = currentUserStoreData.fullTag;
    const uid = currentUserStoreData.uid;

    if (!fullTag || !uid) {
      if (socket.connected) socket.disconnect();
      return;
    }

    const register = () => socket.emit('register', { fullTag, uid });

    const onIncomingInvite = ({ from }: { from: string }) => {
      setInviterTag(from);
      setIsIncomingInviteModalOpen(true);
    };

    const onGameStarted = ({
      roomId,
      players,
    }: {
      roomId: string;
      players?: GamePlayer[];
    }) => {
      setIsInviteModalOpen(false);
      setIsIncomingInviteModalOpen(false);
      // O lobby só monta depois deste evento, então ele nunca chegava a ouvir
      // o 'game_started'. Guardamos os jogadores aqui e passamos por prop.
      setGamePlayers(Array.isArray(players) ? players : []);
      setGameRoomId(roomId);
      setScreen('multiplayer_lobby');
    };

    const onInviteFailed = ({ message }: { message: string }) => {
      setIsIncomingInviteModalOpen(false);
      toast.error(message);
    };

    socket.on('connect', register);
    socket.on('incoming_invite', onIncomingInvite);
    socket.on('game_started', onGameStarted);
    socket.on('invite_failed', onInviteFailed);

    if (socket.connected) {
      // O evento 'connect' não dispara para uma conexão que já está de pé:
      // nesse caminho o register nunca era enviado e o usuário ficava
      // invisível para os amigos.
      register();
    } else {
      socket.connect();
    }

    // Remove só os próprios handlers. O socket.off('connect') sem argumento
    // derrubava qualquer outro listener de 'connect' registrado no app.
    return () => {
      socket.off('connect', register);
      socket.off('incoming_invite', onIncomingInvite);
      socket.off('game_started', onGameStarted);
      socket.off('invite_failed', onInviteFailed);
    };
  }, [currentUserStoreData.fullTag, currentUserStoreData.uid]);

  useEffect(() => {
    const fetchSubjectsList = async () => {
      try {
        const response = await api.get('/api/subjects');
        setSubjectsList(response.data);
      } catch (error) {
        console.error('Falha ao carregar a lista de matérias via API:', error);
      }
    };
    fetchSubjectsList();
  }, []);

  useEffect(() => {
    if (isUserModalOpen && viewedUser?.uid === currentUserProfile.uid) {
      setViewedUser(currentUserProfile);
    }
  }, [currentUserProfile, isUserModalOpen, viewedUser?.uid]);

  const handleSelectSubject = async (subjectInfo: SubjectInfo) => {
    try {
      const response = await api.get(`/api/subjects/${subjectInfo.id}`);
      setSelectedSubject(response.data);
      setScreen('level');
    } catch (error) {
      console.error(
        `Falha ao carregar a matéria ${subjectInfo.nome} via API:`,
        error
      );
    }
  };

  const handleOnStartBrainstorm = async () => {
    if (allSubjectsData.length > 0) {
      setScreen('brainstorm');
      return;
    }
    try {
      const subjectPromises = subjectsList.map((subjectInfo) =>
        api.get(`/api/subjects/${subjectInfo.id}`).then((res) => res.data)
      );
      const allSubjects = await Promise.all(subjectPromises);
      setAllSubjectsData(allSubjects as Materia[]);
      setScreen('brainstorm');
    } catch (error) {
      console.error(
        'Falha ao carregar dados para o Brainstorm via API:',
        error
      );
    }
  };

  const handleSelectLevel = (level: Nivel) => {
    setSelectedLevel(level);
    setScreen('hub');
  };

  const backToHome = () => {
    if (gameRoomId) {
      socket.emit('leave_game', { roomId: gameRoomId });
    }
    setSelectedSubject(null);
    setSelectedLevel(null);
    setScreen('subject');
    setGameRoomId(null);
  };

  const backToLevels = () => setScreen('level');
  const backToHub = () => setScreen('hub');

  const handleViewProfile = (userToShow: UserProfileData) => {
    setViewedUser(userToShow);
    setIsUserModalOpen(true);
  };

  const handleOpenMyProfile = () => {
    handleViewProfile(currentUserProfile);
  };

  const handleCloseProfile = () => {
    setIsUserModalOpen(false);
    setTimeout(() => setViewedUser(null), 300);
  };

  // As telas anteriores ao app (loading, login, setup) saem antes do shell,
  // então precisam trazer o GlobalStyle e o fundo animado por conta própria.
  if (isInitializing) {
    return (
      <>
        <GlobalStyle />
        <AuroraBackground />
        <LoadingContainer style={{ background: 'transparent' }}>
          <LoadingSpinner />
        </LoadingContainer>
      </>
    );
  }
  if (!firebaseUser) {
    return (
      <>
        <GlobalStyle />
        <AuroraBackground />
        <AuthPage />
      </>
    );
  }
  if (!currentUserStoreData.username) {
    return (
      <>
        <GlobalStyle />
        <AuroraBackground />
        <ProfileSetup />
      </>
    );
  }

  const renderScreen = (): JSX.Element => {
    const subjectSelectorProps = {
      subjects: subjectsList,
      onSelect: handleSelectSubject,
      onStartBrainstorm: handleOnStartBrainstorm,
      onStartMultiplayer: () => setIsInviteModalOpen(true),
    };

    switch (screen) {
      case 'ranking':
        return (
          <RankingPage onBack={backToHome} onViewProfile={handleViewProfile} />
        );
      case 'achievements':
        return <AchievementsPage onBack={backToHome} />;
      case 'multiplayer_lobby':
        return gameRoomId ? (
          <MultiplayerLobbyPage
            roomId={gameRoomId}
            initialPlayers={gamePlayers}
            onGoHome={backToHome}
          />
        ) : (
          <SubjectSelector {...subjectSelectorProps} />
        );
      case 'hub':
        return selectedSubject && selectedLevel ? (
          <LevelHubPage
            subject={selectedSubject}
            level={selectedLevel}
            onBack={backToLevels}
            onSelectStudy={() => setScreen('content')}
            onSelectPractice={() => setScreen('exercise')}
          />
        ) : (
          <SubjectSelector {...subjectSelectorProps} />
        );
      case 'content':
        return selectedSubject && selectedLevel ? (
          <ContentPage
            level={selectedLevel}
            onBack={backToHub}
            onStartExercises={() => setScreen('exercise')}
          />
        ) : (
          <SubjectSelector {...subjectSelectorProps} />
        );
      case 'brainstorm':
        return <BrainStorm onBack={backToHome} />;
      case 'exercise':
        return selectedSubject && selectedLevel ? (
          <ExercisePage
            subject={selectedSubject}
            level={selectedLevel}
            onBack={backToLevels}
          />
        ) : (
          <SubjectSelector {...subjectSelectorProps} />
        );
      case 'level':
        return selectedSubject ? (
          <LevelSelector
            subject={selectedSubject}
            onSelect={handleSelectLevel}
            onBack={backToHome}
          />
        ) : (
          <SubjectSelector {...subjectSelectorProps} />
        );
      default:
        return <SubjectSelector {...subjectSelectorProps} />;
    }
  };

  return (
    <>
      <GlobalStyle />
      <AuroraBackground />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(24, 24, 40, 0.92)',
            color: theme.color.text,
            border: `1px solid ${theme.color.strokeStrong}`,
            borderRadius: theme.radius.md,
            backdropFilter: 'blur(14px)',
            fontFamily: theme.font.sans,
            fontSize: '0.88rem',
          },
        }}
      />
      <BarWrapper>
        <TopBar onClick={handleOpenMyProfile} />
      </BarWrapper>
      <AppContainer>
        <MainContent>
          {/* Cada tela entra e sai com a mesma transição; a key é o que diz
              ao AnimatePresence que houve troca de página. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              variants={pageTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </MainContent>
      </AppContainer>
      <Footer>
        <FooterWrapper>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <RankingButton onClick={() => setScreen('ranking')}>
              <Trophy weight="bold" /> Ranking
            </RankingButton>
            {screen !== 'multiplayer_lobby' && screen !== 'exercise' && (
              <FriendsButton onClick={() => setIsFriendsListOpen(true)}>
                <Users weight="bold" /> Amigos
              </FriendsButton>
            )}
          </div>
          {screen !== 'subject' && (
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
      </Footer>
      <FriendsList
        isOpen={isFriendsListOpen}
        onClose={() => setIsFriendsListOpen(false)}
        onOpenChat={setActiveChat}
        onViewProfile={handleViewProfile}
      />
      {activeChat && (
        <ChatWindow friend={activeChat} onClose={() => setActiveChat(null)} />
      )}
      <ModalUserPerfil
        isOpen={isUserModalOpen}
        onClose={handleCloseProfile}
        user={viewedUser}
        onNavigateToAchievements={() => {
          handleCloseProfile();
          setScreen('achievements');
        }}
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
    </>
  );
}
