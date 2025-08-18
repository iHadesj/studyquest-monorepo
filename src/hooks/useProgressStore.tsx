import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- TIPOS ---
type UserProgress = {
  [materiaId: string]: {
    [nivelId: string]: {
      acertos: number;
      concluido: boolean;
      estrelas: number;
    };
  };
};

type ProgressState = {
  xp: number;
  progress: UserProgress;
  addXP: (amount: number) => void;

  completeLevel: (
    materiaId: string,
    nivelId: string,
    acertos: number,
    estrelas: number
  ) => void;
  resetProgress: () => void;
};

// --- GERENCIAMENTO DE ESTADO COM ZUSTAND ---
export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      xp: 0,
      progress: {},
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      completeLevel: (materiaId, nivelId, acertos, estrelas) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [materiaId]: {
              ...state.progress[materiaId],
              [nivelId]: {
                acertos,
                concluido: true,
                estrelas,
              },
            },
          },
        })),
      resetProgress: () => set({ xp: 0, progress: {} }),
    }),
    {
      name: 'studyquest-progress',
    }
  )
);
