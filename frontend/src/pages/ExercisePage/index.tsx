import { useState, useEffect } from 'react';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import {
  BackButton,
  ContinueButton,
  ModalContent,
  ModalOverlay,
} from '../../style/globalStyle';
import {
  useProgressStore,
  type FirestoreUserData,
} from '../../hooks/useProgressStore';
import type { Exercicio, Materia, Nivel } from '../../interfaces';
import {
  Star,
  CheckCircle,
  XCircle,
  Lightning,
  Sparkle,
  ArrowClockwise,
} from 'phosphor-react';
import { verificarEdesbloquearConquistas } from '../../services/achievements';
import { api } from '../../services/api';
import { parseText } from '../../utils/utils';
import { theme } from '../../style/theme';
import { spring } from '../../style/motion';
import * as S from './style';

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];

const ResultsModal = ({ results, totalQuestions, onBack }: any) => {
  const ok = results.passou;
  return (
    <ModalOverlay>
      <ModalContent>
        <S.ResultIcon $ok={ok}>
          {ok ? (
            <CheckCircle size={34} weight="fill" />
          ) : (
            <XCircle size={34} weight="fill" />
          )}
        </S.ResultIcon>

        <h2
          style={{
            margin: 0,
            fontSize: '1.4rem',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            color: theme.color.text,
          }}
        >
          {ok ? 'Nível concluído' : 'Ainda não foi dessa vez'}
        </h2>

        <S.StarsContainer>
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              size={30}
              color={i <= results.estrelas ? theme.color.gold : '#3a3a4a'}
              weight="fill"
            />
          ))}
        </S.StarsContainer>

        <S.ScoreLine>
          Você acertou <strong>{results.acertos}</strong> de{' '}
          <strong>{totalQuestions}</strong> questões.
        </S.ScoreLine>

        {ok && (
          <S.RewardRow>
            <S.RewardChip $accent={theme.color.primarySoft}>
              <Sparkle size={14} weight="fill" />+{results.xpGanhos} XP
            </S.RewardChip>
            {results.bonusXP > 0 && (
              <S.RewardChip $accent={theme.color.success}>
                <Lightning size={14} weight="fill" />+{results.bonusXP} bônus
              </S.RewardChip>
            )}
          </S.RewardRow>
        )}

        {results.wrongAnswers.length > 0 && (
          <S.ReviewSection>
            <h4>
              <ArrowClockwise size={13} weight="bold" />
              Questões para revisar
            </h4>
            <S.ReviewList>
              {results.wrongAnswers.map((q: any) => (
                <S.ReviewItem key={q.id}>
                  <p className="pergunta">{q.pergunta}</p>
                  <div className="linha">
                    <span className="rotulo">Você:</span>
                    <span className="errada">{q.userAnswer}</span>
                  </div>
                  <div className="linha">
                    <span className="rotulo">Correta:</span>
                    <span className="certa">{q.correctAnswer}</span>
                  </div>
                </S.ReviewItem>
              ))}
            </S.ReviewList>
          </S.ReviewSection>
        )}

        <ContinueButton variant="primary" onClick={onBack}>
          Voltar para a trilha
        </ContinueButton>
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
  // Trava o botão "Próxima" enquanto a correção da resposta está no ar. Sem
  // isso dava pra avançar antes do allUserAnswers receber a resposta atual,
  // e ela sumia da contagem final.
  const [isChecking, setIsChecking] = useState(false);
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

  // --- MUDANÇA 1: Novo estado para o feedback da rodada ---
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean;
    correctAnswer?: string;
  } | null>(null);

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

  // --- MUDANÇA 2: Lógica de verificação atualizada ---
  const handleCheckAnswer = async () => {
    if (!selectedAnswer || isChecking) return;

    setIsAnswered(true);
    setIsChecking(true);

    try {
      const response = await api.post('/api/exercises/submit', {
        subjectId: subject.id,
        levelId: level.id,
        exerciseId: currentQuestion.id,
        userAnswer: selectedAnswer,
      });

      const { isCorrect, correctAnswer } = response.data;

      // Guarda o resultado da API no novo estado
      setLastAnswerResult({ isCorrect, correctAnswer });

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
      setLastAnswerResult({ isCorrect: false }); // Garante que a UI reaja mesmo com erro
    } finally {
      setIsChecking(false);
    }
  };

  // --- MUDANÇA 3: Limpando o estado de feedback ---
  const handleNextQuestion = () => {
    if (isChecking) return;
    // Limpa o resultado da resposta anterior
    setLastAnswerResult(null);

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

    const correctCount = allUserAnswers.filter((a) => a.isCorrect).length;

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

    const userDocRef = doc(db, 'users', user.uid);
    const progressPath = `progress.${subject.id}.${level.id}`;

    // Lê o progresso salvo ANTES de decidir qualquer coisa: o número de
    // tentativas vem do banco, não do store (que pode estar defasado).
    let currentProgress = {
      acertos: 0,
      tentativas: 0,
      estrelas: 0,
      concluido: false,
    };
    try {
      const userDoc = await getDoc(userDocRef);
      currentProgress = {
        ...currentProgress,
        ...(userDoc.data()?.progress?.[subject.id]?.[level.id] ?? {}),
      };
    } catch (error) {
      console.error('Erro ao ler o progresso atual:', error);
    }

    const tentativas = (currentProgress.tentativas || 0) + 1;
    const ehUltimaTentativa = tentativas >= 3;

    const wrongAnswersList = ehUltimaTentativa
      ? allUserAnswers
          .filter((a) => !a.isCorrect)
          .map((a) => ({
            ...a.exercise,
            userAnswer: a.answer,
            correctAnswer: a.correctAnswer,
          }))
      : [];

    setFinalResults({
      acertos: correctCount,
      xpGanhos,
      bonusXP,
      estrelas,
      passou,
      wrongAnswers: wrongAnswersList,
    });

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
      await updateDoc(userDocRef, {
        xp: increment(totalXp),
        [progressPath]: {
          acertos: Math.max(currentProgress.acertos, correctCount),
          concluido: currentProgress.concluido || passou,
          estrelas: Math.max(currentProgress.estrelas, estrelas),
          // Valor absoluto, não increment(): este update substitui o mapa
          // inteiro em progressPath, e o transform do increment era aplicado
          // depois disso, sempre partindo do zero. Resultado: tentativas
          // ficava travado em 1 para sempre.
          tentativas,
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
      <S.ExerciseContainer>
        <BackButton onClick={onBack}>&larr; Voltar</BackButton>
        <S.QuestionCard>
          <S.ScoreLine>Buscando as questões no servidor...</S.ScoreLine>
        </S.QuestionCard>
      </S.ExerciseContainer>
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
      <S.ExerciseContainer>
        <BackButton onClick={onBack}>&larr; Voltar</BackButton>
        <S.QuestionCard>
          <S.ScoreLine>
            Nenhum exercício de múltipla escolha encontrado para este nível.
          </S.ScoreLine>
        </S.QuestionCard>
      </S.ExerciseContainer>
    );
  }

  const total = exercises.length;
  const progresso = ((currentQuestionIndex + 1) / total) * 100;

  return (
    <S.ExerciseContainer>
      <BackButton onClick={onBack}>&larr; Voltar</BackButton>

      <S.ExerciseHeader>
        <div className="topo">
          <h2 className="titulo">
            {subject.nome} · {level.nome}
          </h2>
          <span className="contador">
            {currentQuestionIndex + 1} de {total}
          </span>
        </div>
        <S.ProgressTrack>
          <S.ProgressFill
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </S.ProgressTrack>
      </S.ExerciseHeader>

      <S.QuestionCard
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <S.QuestionText>{parseText(currentQuestion.pergunta)}</S.QuestionText>

        <S.OptionsList>
          {currentQuestion.opcoes?.map((option, i) => {
            let status: 'correct' | 'incorrect' | 'default' = 'default';

            if (isAnswered && lastAnswerResult) {
              if (option === selectedAnswer) {
                status = lastAnswerResult.isCorrect ? 'correct' : 'incorrect';
              } else if (
                option === lastAnswerResult.correctAnswer &&
                !lastAnswerResult.isCorrect
              ) {
                status = 'correct';
              }
            }

            return (
              <S.OptionRow
                key={option}
                $status={status}
                $selected={selectedAnswer === option}
              >
                <input
                  type="radio"
                  name={`ex-${currentQuestion.id}`}
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={isAnswered}
                />
                <span className="letra">{LETRAS[i] ?? i + 1}</span>
                <span>{option}</span>
                {status !== 'default' && (
                  <span className="marca">
                    {status === 'correct' ? (
                      <CheckCircle size={20} weight="fill" />
                    ) : (
                      <XCircle size={20} weight="fill" />
                    )}
                  </span>
                )}
              </S.OptionRow>
            );
          })}
        </S.OptionsList>
      </S.QuestionCard>

      <S.ActionBar>
        {isAnswered ? (
          <S.ActionButton onClick={handleNextQuestion} disabled={isChecking}>
            {currentQuestionIndex < total - 1
              ? 'Próxima questão'
              : 'Ver resultado'}
          </S.ActionButton>
        ) : (
          <S.ActionButton onClick={handleCheckAnswer} disabled={!selectedAnswer}>
            Verificar resposta
          </S.ActionButton>
        )}
      </S.ActionBar>
    </S.ExerciseContainer>
  );
};
