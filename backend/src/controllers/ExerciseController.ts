import { Request, Response } from "express";
import { z } from "zod";
import {
  subjectDataMap,
  findExerciseById,
  getRandomQuestions,
} from "../GameManager";

const submitAnswerSchema = z.object({
  subjectId: z.string(),
  levelId: z.string(),
  exerciseId: z.union([z.string(), z.number()]),
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

  const { levelId, exerciseId, userAnswer } = validation.data;

  const exercise = findExerciseById(exerciseId);

  if (!exercise) {
    console.error(`Exercício não encontrado com ID: ${exerciseId}`);
    return res.status(404).json({ message: "Exercício não encontrado." });
  }

  const isCorrect =
    exercise.respostaCorreta.trim().toLowerCase() ===
    userAnswer.trim().toLowerCase();

  if (isCorrect) {
    return res.json({ isCorrect: true });
  } else {
    return res.json({
      isCorrect: false,
      correctAnswer: exercise.respostaCorreta,
    });
  }
};

export const getBrainstormExercises = async (req: Request, res: Response) => {
  const exercises = getRandomQuestions(50);

  const exercisesSanitized = exercises.map((ex: any) => {
    const { respostaCorreta, ...exerciseForStudent } = ex;
    return exerciseForStudent;
  });

  return res.json(exercisesSanitized);
};
