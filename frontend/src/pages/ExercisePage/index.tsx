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
  XPDisplayModal,
} from '../../style/globalStyle';
import {
  useProgressStore,
  type FirestoreUserData,
} from '../../hooks/useProgressStore';
import { CheckCircleIcon, StarIcon, XCircleIcon } from '../../style/icons';
import type { Exercicio, Materia, Nivel } from '../../interfaces';
import { Star } from 'phosphor-react';
import { verificarEdesbloquearConquistas } from '../../services/achievements';
import { api } from '../../services/api';

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

const BonusXPText = styled.p`
  font-size: 1rem;
  font-weight: bold;
  color: #43b581;
  margin: 0;
`;

const WrongAnswersContainer = styled.div`
  margin-top: 1.5rem;
  text-align: left;
  max-height: 150px;
  overflow-y: auto;
  background-color: #202225;
  padding: 1rem;
  border-radius: 4px;
`;

const WrongAnswerItem = styled.div`
  & + & {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #40444b;
  }
  p {
    margin: 0.25rem 0;
  }
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

        {results.passou && (
          <>
            <XPDisplayModal style={{ marginTop: '1.5rem' }}>
              <StarIcon />
              <span>+{results.xpGanhos} XP Ganhos</span>
            </XPDisplayModal>
            {results.bonusXP > 0 && (
              <BonusXPText>+{results.bonusXP} XP Bônus!</BonusXPText>
            )}
          </>
        )}

        {results.wrongAnswers.length > 0 && (
          <WrongAnswersContainer>
            <h4 style={{ marginTop: 0 }}>Questões para revisar:</h4>
            {results.wrongAnswers.map((q: any) => (
              <WrongAnswerItem key={q.id}>
                <p>
                  <strong>Pergunta:</strong> {q.pergunta}
                </p>
                <p style={{ color: '#ed4245' }}>
                  <strong>Sua resposta:</strong> {q.userAnswer}
                </p>
                <p style={{ color: '#43b581' }}>
                  <strong>Resposta correta:</strong> {q.correctAnswer}
                </p>
              </WrongAnswerItem>
            ))}
          </WrongAnswersContainer>
        )}

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
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [allUserAnswers, setAllUserAnswers] = useState<
    {
      exercise: Exercicio;
      answer: string;
      isCorrect: boolean;
      correctAnswer?: string;
    }[]
  >([]);
  const [finalResults, setFinalResults] = useState<any>(null);

  const progress = useProgressStore((state) => state.progress);

  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(
          `/api/exercises/${subject.id}/${level.id}`
        );
        const multipleChoice = response.data.filter(
          (ex: any) => ex.tipo === 'multipla_escolha'
        );
        const shuffled = [...multipleChoice].sort(() => 0.5 - Math.random());
        setExercises(shuffled.slice(0, 10));
      } catch (error) {
        console.error('Falha ao buscar exercícios:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExercises();
  }, [subject.id, level.id]);

  const currentQuestion = exercises[currentQuestionIndex];

  const handleCheckAnswer = async () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);

    try {
      const response = await api.post('/api/exercises/submit', {
        subjectId: subject.id,
        levelId: level.id,
        exerciseId: currentQuestion.id,
        userAnswer: selectedAnswer,
      });

      const { isCorrect, correctAnswer } = response.data;

      setAllUserAnswers((prev) => [
        ...prev,
        {
          exercise: currentQuestion,
          answer: selectedAnswer,
          isCorrect: isCorrect,
          correctAnswer: correctAnswer,
        },
      ]);
    } catch (error) {
      console.error('Erro ao submeter resposta:', error);
    }
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

    // <<< MUDANÇA PRINCIPAL AQUI >>>
    const levelProgress = progress[subject.id]?.[level.id];
    const tentativasFeitas = levelProgress?.tentativas || 0;
    const ehUltimaTentativa = tentativasFeitas + 1 >= 3;

    const correctCount = allUserAnswers.filter((a) => a.isCorrect).length;

    // O gabarito só é montado se for a última tentativa!
    const wrongAnswersList = ehUltimaTentativa
      ? allUserAnswers
          .filter((a) => !a.isCorrect)
          .map((a) => ({
            ...a.exercise,
            userAnswer: a.answer,
            correctAnswer: a.correctAnswer,
          }))
      : [];

    const totalQuestions = exercises.length;
    const percentage =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    let estrelas = 0;
    let bonusXP = 0;

    if (percentage === 100) {
      estrelas = 3;
      bonusXP = 50;
    } else if (percentage >= 60) {
      estrelas = 2;
      bonusXP = 25;
    } else if (correctCount > 0) {
      estrelas = 1;
      bonusXP = 10;
    }

    const xpGanhos = correctCount * level.xpPorAcerto;
    const totalXp = xpGanhos + bonusXP;
    const passou =
      level.minAcertosParaDesbloquearProximo !== null &&
      correctCount >= level.minAcertosParaDesbloquearProximo;

    setFinalResults({
      acertos: correctCount,
      xpGanhos,
      bonusXP,
      estrelas,
      passou,
      wrongAnswers: wrongAnswersList,
    });

    const userDocRef = doc(db, 'users', user.uid);
    const progressPath = `progress.${subject.id}.${level.id}`;

    verificarEdesbloquearConquistas('GANHOU_XP', {
      novoXpTotal: useProgressStore.getState().xp + totalXp,
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
        xp: increment(totalXp),
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
      console.error('Erro ao salvar o progresso:', error);
    }

    setShowResultsModal(true);
  };

  if (isLoading) {
    return (
      <ExerciseContainer>
        <BackButton onClick={onBack}>&larr; Voltar</BackButton>
        <TitleExercise>Carregando...</TitleExercise>
        <p style={{ textAlign: 'center' }}>
          Buscando as questões no servidor... 🥋
        </p>
      </ExerciseContainer>
    );
  }

  if (showResultsModal) {
    return (
      <ResultsModal
        results={finalResults}
        totalQuestions={exercises.length}
        onBack={onBack}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <ExerciseContainer>
        <BackButton onClick={onBack}>&larr; Voltar</BackButton>
        <TitleExercise>Opa!</TitleExercise>
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
            const lastAnswer = allUserAnswers[allUserAnswers.length - 1];
            if (isAnswered && lastAnswer) {
              if (lastAnswer.isCorrect && option === selectedAnswer) {
                status = 'correct';
              } else if (!lastAnswer.isCorrect && option === selectedAnswer) {
                status = 'incorrect';
              } else if (
                !lastAnswer.isCorrect &&
                option === lastAnswer.correctAnswer
              ) {
                status = 'correct';
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
              : 'Ver Resultado'}
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
