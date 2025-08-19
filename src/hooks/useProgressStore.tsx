import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- TIPOS ---
type LevelProgress = {
  acertos: number;
  concluido: boolean;
  estrelas: number;
  tentativas: number; // Adicionamos o contador de tentativas
};

type UserProgress = {
  [materiaId: string]: {
    [nivelId: string]: LevelProgress;
  };
};

type ProgressState = {
  xp: number;
  progress: UserProgress;
  addXP: (amount: number) => void;
  // A função agora também recebe as tentativas
  completeLevel: (
    materiaId: string,
    nivelId: string,
    acertos: number,
    estrelas: number,
    tentativas: number
  ) => void;
  resetProgress: () => void;
  setProfile: (username: string, avatarSeed: string) => void;
  username: string | null;
  avatarSeed: string | null;
};

// --- GERENCIAMENTO DE ESTADO COM ZUSTAND ---
export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      username: null,
      avatarSeed: null,
      xp: 0,
      progress: {},
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      completeLevel: (materiaId, nivelId, acertos, estrelas, tentativas) =>
        set((state) => {
          const currentProgress = state.progress[materiaId]?.[nivelId];
          // Mantém a melhor pontuação (mais estrelas)
          const bestStars = Math.max(currentProgress?.estrelas || 0, estrelas);

          return {
            progress: {
              ...state.progress,
              [materiaId]: {
                ...state.progress[materiaId],
                [nivelId]: {
                  acertos,
                  concluido: true,
                  estrelas: bestStars,
                  tentativas, // Salva o novo número de tentativas
                },
              },
            },
          };
        }),
      resetProgress: () =>
        set({ xp: 0, progress: {}, username: null, avatarSeed: null }),
      setProfile: (username, avatarSeed) => set({ username, avatarSeed }),
    }),
    {
      name: 'studyquest-progress',
    }
  )
);
