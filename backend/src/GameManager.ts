import fs from "fs";
import path from "path";
import { Exercicio, Materia } from "./interfaces";

let allExercises: Exercicio[] = [];

const dataDir = path.join(__dirname, "data");
try {
  const subjectFiles = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".json"));

  for (const file of subjectFiles) {
    const filePath = path.join(dataDir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const subject: Materia = JSON.parse(fileContent);
    subject.niveis.forEach((level) => {
      allExercises.push(...level.exercicios);
    });
  }
  console.log(
    `✅ Carregadas ${allExercises.length} perguntas para o GameManager.`
  );
} catch (error) {
  console.error("❌ Erro ao carregar os dados das perguntas:", error);
}

export const getRandomQuestion = (): Exercicio | null => {
  if (allExercises.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * allExercises.length);
  return allExercises[randomIndex] ?? null;
};
