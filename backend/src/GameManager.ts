import fs from "fs";
import path from "path";
import { Exercicio, Materia } from "./interfaces";

interface SubjectInfo {
  id: string;
}

let allExercises: Exercicio[] = [];

try {
  console.log("Iniciando carregamento de perguntas...");

  const indexPath = path.join(__dirname, "data", "materias.json");

  if (fs.existsSync(indexPath)) {
    const indexFileContent = fs.readFileSync(indexPath, "utf-8");
    const subjects: SubjectInfo[] = JSON.parse(indexFileContent);

    for (const subjectInfo of subjects) {
      const subjectFileName = `${subjectInfo.id}.json`;
      const subjectFilePath = path.join(__dirname, "data", subjectFileName);

      if (fs.existsSync(subjectFilePath)) {
        const subjectFileContent = fs.readFileSync(subjectFilePath, "utf-8");
        const subjectData: Materia = JSON.parse(subjectFileContent);

        if (subjectData.niveis) {
          subjectData.niveis.forEach((level) => {
            if (level.exercicios) {
              allExercises.push(...level.exercicios);
            }
          });
        }
      } else {
        console.warn(
          `AVISO: Arquivo da matéria "${subjectFileName}" não encontrado.`
        );
      }
    }
  } else {
    console.error(
      '❌ ERRO CRÍTICO: Arquivo "materias.json" não encontrado na pasta src/data.'
    );
  }

  if (allExercises.length > 0) {
    console.log(
      `✅ Carregadas ${allExercises.length} perguntas para o GameManager.`
    );
  } else {
    console.error(
      "❌ NENHUMA PERGUNTA FOI CARREGADA. Verifique os arquivos JSON e o materias.json."
    );
  }
} catch (error) {
  console.error("❌ Erro crítico ao carregar os dados das perguntas:", error);
}

export const getRandomQuestion = (): Exercicio | null => {
  if (allExercises.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * allExercises.length);
  return allExercises[randomIndex] ?? null;
};
