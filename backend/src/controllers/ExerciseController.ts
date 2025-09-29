import { Request, Response } from "express";
import { z } from "zod";
// Usamos a lista completa de exercícios que já é carregada no GameManager
import {
  getRandomQuestions,
  subjectDataMap,
  allExercises,
} from "../GameManager";

// Schema para exercícios normais
const submitAnswerSchema = z.object({
  subjectId: z.string(),
  levelId: z.string(),
  exerciseId: z.number(),
  userAnswer: z.string(),
});

// Schema só para o Brainstorm, mais simples
const brainstormSubmitSchema = z.object({
  exerciseId: z.number(),
  userAnswer: z.string(),
});

export const getExercises = async (req: Request, res: Response) => {
  const { subjectId, levelId } = req.params;
  if (typeof subjectId !== "string") {
    return res.status(400).json({ message: "Parâmetro subjectId inválido." });
  }
  const subjectData = subjectDataMap[subjectId];

  if (!subjectData) {
    return res.status(404).json({ message: "Matéria não encontrada." });
  }

  const level = subjectData.niveis.find((l: any) => l.id === levelId);

  if (!level) {
    return res.status(404).json({ message: "Nível não encontrado." });
  }

  const exercisesSanitized = level.exercicios.map((ex: any) => {
    const { respostaCorreta, ...exerciseForStudent } = ex;
    return exerciseForStudent;
  });

  return res.json(exercisesSanitized);
};

export const submitAnswer = async (req: Request, res: Response) => {
  const validation = submitAnswerSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ message: "Requisição inválida." });
  }

  const { subjectId, levelId, exerciseId, userAnswer } = validation.data;
  const subjectData = subjectDataMap[subjectId];

  if (!subjectData) {
    return res.status(404).json({ message: "Matéria não encontrada." });
  }

  const level = subjectData.niveis.find((l: any) => l.id === levelId);
  const exercise = level?.exercicios.find((ex: any) => ex.id === exerciseId);

  if (!exercise) {
    return res.status(404).json({ message: "Exercício não encontrado." });
  }

  const isCorrect =
    exercise.respostaCorreta.trim().toLowerCase() ===
    userAnswer.trim().toLowerCase();

  if (isCorrect) {
    return res.json({ isCorrect: true });
  } else {
    // Se errou, a gente devolve o gabarito junto!
    return res.json({
      isCorrect: false,
      correctAnswer: exercise.respostaCorreta,
    });
  }
};

export const getBrainstormExercises = async (req: Request, res: Response) => {
  const exercises = getRandomQuestions(50);

  // Remove o gabarito antes de enviar
  const exercisesSanitized = exercises.map((ex: any) => {
    const { respostaCorreta, ...exerciseForStudent } = ex;
    return exerciseForStudent;
  });

  return res.json(exercisesSanitized);
};

// Função controller para a submissão do Brainstorm
export const submitBrainstormAnswer = async (req: Request, res: Response) => {
  const validation = brainstormSubmitSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ message: "Requisição inválida." });
  }

  const { exerciseId, userAnswer } = validation.data;

  // Encontra o exercício na lista geral de todos os exercícios
  const exercise = allExercises.find((ex) => ex.id === exerciseId);

  if (!exercise) {
    return res
      .status(404)
      .json({ message: "Exercício do Brainstorm não encontrado." });
  }

  const isCorrect =
    exercise.respostaCorreta.trim().toLowerCase() ===
    userAnswer.trim().toLowerCase();

  return res.json({ isCorrect });
};
