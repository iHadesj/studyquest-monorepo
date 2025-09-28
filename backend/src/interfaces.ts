// src/interfaces.ts (NO BACKEND)

// Tipos que eram do frontend, agora definidos aqui para desacoplar.
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

// O tipo principal que a gente precisava.
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

// O resto das suas interfaces que já estavam aqui, sem mudança.
export interface Exercicio {
  id: number;
  tipo: "multipla_escolha" | "preenchimento";
  pergunta: string;
  opcoes?: readonly string[];
  respostaCorreta: string;
}

export interface Nivel {
  id: string;
  nome: string;
  xpPorAcerto: number;
  minAcertosParaDesbloquearProximo: number | null;
  conteudo: {
    titulo: string;
    resumo: string;
  };
  exercicios: readonly Exercicio[];
}

export interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  raridade: "bronze" | "prata" | "ouro";
  icon: string;
}

export interface Materia {
  id: string;
  nome: string;
  categoria: string;
  iconName: string;
  cor: {
    bg: string;
    hover: string;
    ring: string;
  };
  niveis: readonly Nivel[];
}

export type UserProfileData = FirestoreUserData & {
  level: number;
  rank?: number;
};
