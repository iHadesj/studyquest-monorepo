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
  exercicios: readonly Exercicio[];
  // Adicione outros campos se precisar
}

export interface Materia {
  id: string;
  nome: string;
  niveis: readonly Nivel[];
  // Adicione outros campos se precisar
}
