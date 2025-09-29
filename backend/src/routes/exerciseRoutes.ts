// src/routes/exerciseRoutes.ts
import { Router } from "express";
import {
  getExercises,
  submitAnswer,
  getBrainstormExercises,
  submitBrainstormAnswer,
} from "../controllers/ExerciseController";

const exerciseRoutes = Router();

exerciseRoutes.get("/brainstorm/questions", getBrainstormExercises);
exerciseRoutes.post("/brainstorm/submit", submitBrainstormAnswer);

exerciseRoutes.get("/:subjectId/:levelId", getExercises);
exerciseRoutes.post("/submit", submitAnswer);

export default exerciseRoutes;
