import { create } from 'zustand';

export type FirestoreUserData = {
  uid: string | null;
  username: string | null;
  avatarSeed: string | null;
  xp: number;
  progress: UserProgress;
  userTag?: number;
  fullTag?: string;
  friends?: string[];
  friendRequestsSent?: string[];
  friendRequestsReceived?: string[];
  unlockedAchievements?: string[];
};

type LevelProgress = {
  acertos: number;
  concluido: boolean;
  estrelas: number;
  tentativas: number;
};

type UserProgress = {
  [materiaId: string]: {
    [nivelId: string]: LevelProgress;
  };
};

type ProgressState = FirestoreUserData & {
  hydrateFromFirestore: (data: FirestoreUserData) => void;
  resetLocalStore: () => void;
};

export const useProgressStore = create<ProgressState>()((set) => ({
  uid: null,
  username: null,
  avatarSeed: null,
  xp: 0,
  progress: {},
  userTag: undefined,
  fullTag: undefined,
  friends: [],
  friendRequestsSent: [],
  friendRequestsReceived: [],
  unlockedAchievements: [],

  hydrateFromFirestore: (data) => {
    set({
      uid: data.uid,
      username: data.username,
      avatarSeed: data.avatarSeed,
      xp: data.xp,
      progress: data.progress,
      userTag: data.userTag,
      fullTag: data.fullTag,
      friends: data.friends || [],
      friendRequestsSent: data.friendRequestsSent || [],
      friendRequestsReceived: data.friendRequestsReceived || [],
      unlockedAchievements: data.unlockedAchievements || [],
    });
  },

  resetLocalStore: () =>
    set({
      uid: null,
      xp: 0,
      progress: {},
      username: null,
      avatarSeed: null,
      userTag: undefined,
      fullTag: undefined,
      friends: [],
      friendRequestsSent: [],
      friendRequestsReceived: [],
      unlockedAchievements: [],
    }),
}));
