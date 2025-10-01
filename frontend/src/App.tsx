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
import { socket } from './services/socket';
import { api } from './services/api';
import { Toaster } from 'react-hot-toast';
import { calculateLevelInfo } from './style/level';
import { RankingPage } from './pages/Ranking';
import { FriendsList } from './components/FriendsList';

type SubjectInfo = Omit<Materia, 'niveis'>;

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Fira Code', monospace;
    scrollbar-color: #5865f2 #202225;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-user-select: none; 
    -ms-user-select: none; 
    user-select: none; 
    background-color: #36393f;
    color: #dcddde;
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
    if (!currentUserStoreData.fullTag || !currentUserStoreData.uid) {
      if (socket.connected) socket.disconnect();
      return;
    }
    if (!socket.connected) {
      socket.connect();
    }
    socket.on('connect', () => {
      socket.emit('register', {
        fullTag: currentUserStoreData.fullTag,
        uid: currentUserStoreData.uid,
      });
    });
    socket.on('incoming_invite', ({ from }: { from: string }) => {
      setInviterTag(from);
      setIsIncomingInviteModalOpen(true);
    });
    socket.on('game_started', ({ roomId }: { roomId: string }) => {
      setIsInviteModalOpen(false);
      setIsIncomingInviteModalOpen(false);
      setGameRoomId(roomId);
      setScreen('multiplayer_lobby');
    });

    return () => {
      socket.off('connect');
      socket.off('incoming_invite');
      socket.off('game_started');
      if (socket.connected) socket.disconnect();
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
  if (!currentUserStoreData.username) {
    return <ProfileSetup />;
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
          <MultiplayerLobbyPage roomId={gameRoomId} onGoHome={backToHome} />
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
      <Toaster
        position="top-center"
        toastOptions={{ style: { background: '#333', color: '#fff' } }}
      />
      <BarWrapper>
        <TopBar onClick={handleOpenMyProfile} />
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
