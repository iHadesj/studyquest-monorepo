// backend/src/routes/subjectRoutes.ts
import { Router } from "express";
import {
  getSubjectsList,
  getSubjectDetails,
} from "../controllers/SubjectController";

const subjectRoutes = Router();

// Rota para pegar a lista de todas as matérias
subjectRoutes.get("/", getSubjectsList);

// Rota SEGURA para pegar os detalhes de UMA matéria (sem exercícios)
subjectRoutes.get("/:subjectId", getSubjectDetails);

export default subjectRoutes;
