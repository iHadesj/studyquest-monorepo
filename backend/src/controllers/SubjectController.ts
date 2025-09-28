import { Request, Response } from "express";
import materiasIndex from "../data/materias.json";
import { subjectDataMap } from "../GameManager";
import { Materia, Nivel } from "../interfaces";

export const getSubjectsList = (req: Request, res: Response) => {
  res.json(materiasIndex);
};

export const getSubjectDetails = (req: Request, res: Response) => {
  const { subjectId } = req.params;
  if (typeof subjectId !== "string") {
    res.status(400).json({ message: "Parâmetro subjectId inválido." });
    return;
  }
  const subjectData = subjectDataMap[subjectId];

  if (subjectData) {
    const subjectDataCopy: Materia = JSON.parse(JSON.stringify(subjectData));

    const sanitizedNiveis = subjectDataCopy.niveis.map((nivel: Nivel) => {
      // 1. CONTA os exercícios antes de remover
      const totalExercicios = nivel.exercicios ? nivel.exercicios.length : 0;

      // 2. REMOVE a lista de exercícios com as respostas
      delete (nivel as any).exercicios;

      // 3. RETORNA o nível com a contagem adicionada
      return { ...nivel, totalExercicios };
    });

    const sanitizedSubjectData = {
      ...subjectDataCopy,
      niveis: sanitizedNiveis,
    };

    res.json(sanitizedSubjectData);
  } else {
    res.status(404).json({ message: "Matéria não encontrada." });
  }
};
