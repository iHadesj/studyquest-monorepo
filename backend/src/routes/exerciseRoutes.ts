// src/routes/exerciseRoutes.ts
import { Router } from "express";
import { getExercises, submitAnswer } from "../controllers/ExerciseController";

const exerciseRoutes = Router();

exerciseRoutes.get("/:subjectId/:levelId", getExercises);
exerciseRoutes.post("/submit", submitAnswer);

export default exerciseRoutes;
