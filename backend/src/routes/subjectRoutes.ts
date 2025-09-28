// backend/src/routes/subjectRoutes.ts
import { Router } from "express";
import materiasIndex from "../data/materias.json";
import { subjectDataMap } from "../GameManager";

const subjectRoutes = Router();

// Rota para pegar a lista de todas as matérias (o antigo materias.json)
subjectRoutes.get("/", (req, res) => {
  res.json(materiasIndex);
});

// Rota para pegar os detalhes completos de UMA matéria
subjectRoutes.get("/:subjectId", (req, res) => {
  const { subjectId } = req.params;
  const subjectData = subjectDataMap[subjectId];

  if (subjectData) {
    res.json(subjectData);
  } else {
    res.status(404).json({ message: "Matéria não encontrada." });
  }
});

export default subjectRoutes;
