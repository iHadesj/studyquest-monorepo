import { FirestoreUserData } from "./../../frontend/src/hooks/useProgressStore";
// src/interfaces/index.tsx

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
