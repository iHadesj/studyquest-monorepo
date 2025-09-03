import { create } from 'zustand';

// --- TIPOS ---
export type FirestoreUserData = {
  username: string | null;
  avatarSeed: string | null;
  xp: number;
  progress: UserProgress;
  userTag?: number;
  fullTag?: number;
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

// --- GERENCIAMENTO DE ESTADO COM ZUSTAND ---
export const useProgressStore = create<ProgressState>()((set) => ({
  username: null,
  avatarSeed: null,
  xp: 0,
  progress: {},
  userTag: undefined,
  fullTag: undefined,

  hydrateFromFirestore: (data) => {
    set({
      username: data.username,
      avatarSeed: data.avatarSeed,
      xp: data.xp,
      progress: data.progress,
      userTag: data.userTag,
      fullTag: data.fullTag,
    });
  },

  resetLocalStore: () =>
    set({
      xp: 0,
      progress: {},
      username: null,
      avatarSeed: null,
      userTag: undefined,
      fullTag: undefined,
    }),
}));
