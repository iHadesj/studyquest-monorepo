import { Exercicio, Materia } from "./interfaces";

import materiasIndex from "./data/materias.json";

import biologiaDataRaw from "./data/biologia.json";
import cienciasDataRaw from "./data/ciencias.json";
import filosofiaDataRaw from "./data/filosofia.json";
import fisicaDataRaw from "./data/fisica.json";
import geografiaDataRaw from "./data/geografia.json";
import historiaDataRaw from "./data/historia.json";
import inglesDataRaw from "./data/ingles.json";
import matematicaDataRaw from "./data/matematica.json";
import musicaDataRaw from "./data/musica.json";
import programacaoDataRaw from "./data/programacao.json";
import quimicaDataRaw from "./data/quimica.json";

const biologiaData = biologiaDataRaw as unknown as Materia;
const cienciasData = cienciasDataRaw as unknown as Materia;
const filosofiaData = filosofiaDataRaw as unknown as Materia;
const fisicaData = fisicaDataRaw as unknown as Materia;
const geografiaData = geografiaDataRaw as unknown as Materia;
const historiaData = historiaDataRaw as unknown as Materia;
const inglesData = inglesDataRaw as unknown as Materia;
const matematicaData = matematicaDataRaw as unknown as Materia;
const musicaData = musicaDataRaw as unknown as Materia;
const programacaoData = programacaoDataRaw as unknown as Materia;
const quimicaData = quimicaDataRaw as unknown as Materia;

export const subjectDataMap: { [key: string]: Materia } = {
  biologia: biologiaData,
  ciencias: cienciasData,
  filosofia: filosofiaData,
  fisica: fisicaData,
  geografia: geografiaData,
  historia: historiaData,
  ingles: inglesData,
  matematica: matematicaData,
  musica: musicaData,
  programacao: programacaoData,
  quimica: quimicaData,
};

const loadAllExercises = (): Exercicio[] => {
  const exercises: Exercicio[] = [];
  try {
    for (const subjectInfo of materiasIndex) {
      const subjectData = subjectDataMap[subjectInfo.id];
      if (subjectData && subjectData.niveis) {
        subjectData.niveis.forEach((level) => {
          if (level.exercicios) {
            const exercisesWithSubject = level.exercicios.map((ex) => ({
              ...ex,
              subjectId: subjectInfo.id,
            }));
            exercises.push(...exercisesWithSubject);
          }
        });
      }
    }
  } catch (error) {
    console.error(
      "❌ Erro crítico ao processar os dados das perguntas:",
      error
    );
    return [];
  }
  return exercises;
};

export const getRandomQuestion = (): Exercicio | null => {
  const allExercises = loadAllExercises();
  const multipleChoiceExercises = allExercises.filter(
    (ex) => ex.tipo === "multipla_escolha"
  );

  if (multipleChoiceExercises.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(
    Math.random() * multipleChoiceExercises.length
  );
  return multipleChoiceExercises[randomIndex] ?? null;
};

export const getRandomQuestions = (count: number): Exercicio[] => {
  const allExercises = loadAllExercises();
  const multipleChoiceExercises = allExercises.filter(
    (ex) => ex.tipo === "multipla_escolha"
  );

  if (multipleChoiceExercises.length === 0) {
    return [];
  }

  const shuffled = [...multipleChoiceExercises].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export { loadAllExercises };
