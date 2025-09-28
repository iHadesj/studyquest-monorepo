// backend/src/controllers/SubjectController.ts
import { Request, Response } from "express";
import materiasIndex from "../data/materias.json";
import { subjectDataMap } from "../GameManager";
import { Materia, Nivel, Exercicio } from "../interfaces";

export const getSubjectsList = (req: Request, res: Response) => {
  // Retorna apenas a lista de matérias, sem os detalhes
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
    // AQUI ESTÁ A MÁGICA DA SEGURANÇA
    // Criamos uma cópia do objeto para não alterar o original no servidor
    const subjectDataCopy: Materia = JSON.parse(JSON.stringify(subjectData));

    // Iteramos em cada nível da matéria para limpar os exercícios
    const sanitizedNiveis = subjectDataCopy.niveis.map((nivel: Nivel) => {
      // Apagamos completamente a chave 'exercicios'
      // O frontend vai buscar isso depois na rota segura /api/exercises
      delete (nivel as any).exercicios;
      return nivel;
    });

    // Montamos o objeto final só com o conteúdo e os níveis (sem exercícios)
    const sanitizedSubjectData = {
      ...subjectDataCopy,
      niveis: sanitizedNiveis,
    };

    res.json(sanitizedSubjectData);
  } else {
    res.status(404).json({ message: "Matéria não encontrada." });
  }
};
