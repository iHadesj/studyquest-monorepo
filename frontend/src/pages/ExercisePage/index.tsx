import { useState, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import {
  BackButton,
  ContinueButton,
  ExerciseBox,
  ModalContent,
  ModalOverlay,
  QuestionText,
  Subtitle,
  Title,
  TitleExercise,
} from '../../style/globalStyle';
import {
  useProgressStore,
  type FirestoreUserData,
} from '../../hooks/useProgressStore';
import { CheckCircleIcon, XCircleIcon } from '../../style/icons';
import type { Exercicio, Materia, Nivel } from '../../interfaces';
import { Star } from 'phosphor-react';
import { verificarEdesbloquearConquistas } from '../../services/achievements';

const shake = keyframes`
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
`;

const ExerciseContainer = styled.div`
  max-width: 48rem;
  margin: 0 auto;
`;

const QuestionCounter = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #b9bbbe;
  margin-bottom: 2rem;
`;

const OptionLabel = styled(motion.label)<{
  $status: 'correct' | 'incorrect' | 'default';
}>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #36393f;
  border-radius: 4px;
  border: 2px solid #40444b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    ${({ $status }) => $status === 'default' && `border-color: #5865f2;`}
  }

  ${({ $status }) =>
    $status === 'correct' &&
    css`
      background-color: #43b581;
      border-color: #3aa570;
      color: white;
      transform: scale(1.02);
    `}

  ${({ $status }) =>
    $status === 'incorrect' &&
    css`
      background-color: #ed4245;
      border-color: #d83c3e;
      color: white;
      animation: ${shake} 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    `}
`;

const RadioInput = styled.input`
  margin-right: 0.75rem;
  accent-color: #5865f2;
`;

const ActionButton = styled.button`
  background-color: #5865f2;
  color: #ffffff;
  font-family: 'Fira Code', monospace;
  font-weight: bold;
  padding: 0.75rem 3rem;
  border-radius: 4px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 2rem;

  &:disabled {
    background-color: #40444b;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #4f5bd5;
  }
`;

const StarsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const ResultsModal = ({ results, totalQuestions, onBack }: any) => {
  return (
    <ModalOverlay>
      <ModalContent>
        {results.passou ? <CheckCircleIcon /> : <XCircleIcon />}
        <Title as="h2" style={{ fontSize: '1.875rem', marginTop: '1rem' }}>
          {results.passou ? 'Nível Concluído!' : 'Tente Novamente!'}
        </Title>
        <StarsContainer>
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              size={40}
              color={i <= results.estrelas ? '#f1c40f' : '#72767d'}
              weight="fill"
            />
          ))}
        </StarsContainer>
        <Subtitle as="p" style={{ fontSize: '1rem', marginBottom: 0 }}>
          Você acertou {results.acertos} de {totalQuestions} perguntas.
        </Subtitle>
        <ContinueButton onClick={onBack}>Continuar Jornada</ContinueButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export const ExercisePage = ({
  subject,
  level,
  onBack,
}: {
  subject: Materia;
  level: Nivel;
  onBack: () => void;
}) => {
  const [exercises, setExercises] = useState<Exercicio[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const [allAnswers, setAllAnswers] = useState<
    { exercise: Exercicio; answer: string }[]
  >([]);

  const [finalResults, setFinalResults] = useState({
    acertos: 0,
    estrelas: 0,
    passou: false,
  });

  useEffect(() => {
    const multipleChoice = level.exercicios.filter(
      (ex) => ex.tipo === 'multipla_escolha'
    );
    const shuffled = [...multipleChoice].sort(() => 0.5 - Math.random());
    setExercises(shuffled.slice(0, 10));
  }, [level.exercicios]);

  const currentQuestion = exercises[currentQuestionIndex];

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;

    setAllAnswers((prev) => [
      ...prev,
      { exercise: currentQuestion, answer: selectedAnswer },
    ]);
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exercises.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    let correctCount = 0;
    allAnswers.forEach((item) => {
      if (
        item.answer.trim().toLowerCase() ===
        item.exercise.respostaCorreta.trim().toLowerCase()
      ) {
        correctCount++;
      }
    });

    const totalQuestions = exercises.length;
    const percentage =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    let estrelas = 0;
    if (percentage === 100) estrelas = 3;
    else if (percentage >= 60) estrelas = 2;
    else if (correctCount > 0) estrelas = 1;

    const passou =
      level.minAcertosParaDesbloquearProximo !== null &&
      correctCount >= level.minAcertosParaDesbloquearProximo;

    setFinalResults({ acertos: correctCount, estrelas, passou });

    const userDocRef = doc(db, 'users', user.uid);
    const progressPath = `progress.${subject.id}.${level.id}`;

    const xpGanhos = correctCount * level.xpPorAcerto;

    verificarEdesbloquearConquistas('GANHOU_XP', {
      novoXpTotal: useProgressStore.getState().xp + xpGanhos,
    });
    if (passou) {
      verificarEdesbloquearConquistas('CONCLUIU_NIVEL', {
        acertos: correctCount,
        total: totalQuestions,
      });
    }

    try {
      const userDoc = await getDoc(userDocRef);
      const currentProgress = userDoc.data()?.progress?.[subject.id]?.[
        level.id
      ] || { acertos: 0, tentativas: 0, estrelas: 0, concluido: false };

      await updateDoc(userDocRef, {
        xp: increment(xpGanhos),
        [progressPath]: {
          acertos: Math.max(currentProgress.acertos, correctCount),
          concluido: currentProgress.concluido || passou,
          estrelas: Math.max(currentProgress.estrelas, estrelas),
          tentativas: increment(1),
        },
      });

      const updatedDoc = await getDoc(userDocRef);
      if (updatedDoc.exists()) {
        useProgressStore
          .getState()
          .hydrateFromFirestore(updatedDoc.data() as FirestoreUserData);
      }
    } catch (error) {
      console.error('Deu ruim pra salvar o progresso, chefe:', error);
    }

    setShowResultsModal(true);
  };

  if (showResultsModal) {
    return (
      <ResultsModal
        results={finalResults}
        totalQuestions={exercises.length}
        onBack={onBack}
      />
    );
  }

  if (exercises.length === 0) {
    return (
      <ExerciseContainer>
        <BackButton onClick={onBack}>&larr; Voltar</BackButton>
        <TitleExercise>Carregando...</TitleExercise>
        <p style={{ textAlign: 'center' }}>
          Nenhum exercício de múltipla escolha encontrado pra esse nível.
        </p>
      </ExerciseContainer>
    );
  }

  return (
    <ExerciseContainer>
      <BackButton onClick={onBack}>&larr; Voltar</BackButton>
      <TitleExercise as="h2" style={{ border: 'none', padding: 0 }}>
        Exercícios: {level.nome}
      </TitleExercise>
      <QuestionCounter>
        Questão {currentQuestionIndex + 1} de {exercises.length}
      </QuestionCounter>

      <ExerciseBox>
        <QuestionText>{currentQuestion.pergunta}</QuestionText>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {currentQuestion.opcoes?.map((option) => {
            let status: 'correct' | 'incorrect' | 'default' = 'default';
            if (isAnswered) {
              if (option === currentQuestion.respostaCorreta) {
                status = 'correct';
              } else if (option === selectedAnswer) {
                status = 'incorrect';
              }
            }
            return (
              <OptionLabel key={option} $status={status}>
                <RadioInput
                  type="radio"
                  name={`ex-${currentQuestion.id}`}
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={isAnswered}
                />
                <span>{option}</span>
              </OptionLabel>
            );
          })}
        </div>
      </ExerciseBox>

      <div style={{ textAlign: 'center' }}>
        {isAnswered ? (
          <ActionButton onClick={handleNextQuestion}>
            {currentQuestionIndex < exercises.length - 1
              ? 'Próxima Questão'
              : 'Finalizar'}
          </ActionButton>
        ) : (
          <ActionButton onClick={handleCheckAnswer} disabled={!selectedAnswer}>
            Verificar Resposta
          </ActionButton>
        )}
      </div>
    </ExerciseContainer>
  );
};
