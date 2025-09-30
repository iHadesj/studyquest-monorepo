// src/pages/BrainStorm/index.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exercicio } from '../../interfaces';
import { Heart, Timer, XCircle, Question, Trophy } from 'phosphor-react';
import {
  ExerciseBox,
  QuestionText,
  RadioInput,
  OptionLabel,
  ContinueButton,
  Title,
  Subtitle,
  LoadingSpinner,
} from '../../style/globalStyle';
import * as S from './style';
import { api } from '../../services/api';
import { verificarEdesbloquearConquistas } from '../../services/achievements';

const GAME_DURATION = 60;
const QUESTION_TIME_LIMIT = 15;
const INITIAL_LIVES = 3;
const BASE_XP_PER_CORRECT_ANSWER = 20;
const STREAK_MULTIPLIER_BONUS = 0.5;

interface BrainStormProps {
  onBack: () => void;
}

export function BrainStorm({ onBack }: BrainStormProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>(
    'idle'
  );
  const [allExercises, setAllExercises] = useState<Exercicio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mainTimeLeft, setMainTimeLeft] = useState(GAME_DURATION);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [totalXp, setTotalXp] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<'time' | 'lives' | null>(
    null
  );
  const [streak, setStreak] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Exercicio | null>(
    null
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    correct: boolean;
  } | null>(null);

  const mainTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchBrainstormExercises = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/exercises/brainstorm/questions');
        const multipleChoice = response.data.filter(
          (ex: any) => ex.tipo === 'multipla_escolha'
        );
        setAllExercises(multipleChoice);
      } catch (error) {
        console.error('Falha ao carregar exercícios para o Brainstorm:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBrainstormExercises();
  }, []);

  const pickNextQuestion = useCallback(() => {
    setUserAnswer('');
    setFeedback(null);
    setIsAnswered(false);
    setQuestionTimeLeft(QUESTION_TIME_LIMIT);
    if (allExercises.length > 0) {
      const randomIndex = Math.floor(Math.random() * allExercises.length);
      setCurrentQuestion(allExercises[randomIndex]);
    } else {
      setGameState('idle');
    }
  }, [allExercises]);

  const endGame = useCallback(
    async (reason: 'time' | 'lives') => {
      setGameState('finished');
      setGameOverReason(reason);
      if (mainTimerRef.current) clearInterval(mainTimerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

      verificarEdesbloquearConquistas('JOGOU_BRAINSTORM');

      const user = auth.currentUser;
      if (user && totalXp > 0) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { xp: increment(totalXp) });
      }
    },
    [totalXp]
  );

  useEffect(() => {
    if (gameState !== 'playing') return;

    mainTimerRef.current = setInterval(() => {
      setMainTimeLeft((prev) => {
        if (prev <= 1) {
          endGame('time');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (!isAnswered) {
      questionTimerRef.current = setInterval(() => {
        setQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            setStreak(0);
            setLives((l) => l - 1);
            setFeedback({ message: 'Tempo esgotado!', correct: false });
            setIsAnswered(true);
            // Agenda a próxima questão no timeout do jogo
            feedbackTimeoutRef.current = setTimeout(pickNextQuestion, 1500);
            return QUESTION_TIME_LIMIT;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    }

    return () => {
      if (mainTimerRef.current) clearInterval(mainTimerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [gameState, pickNextQuestion, endGame, isAnswered]);

  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      endGame('lives');
    }
  }, [lives, gameState, endGame]);

  const startGame = () => {
    if (allExercises.length === 0) return;
    setLives(INITIAL_LIVES);
    setTotalXp(0);
    setGameOverReason(null);
    setStreak(0);
    setMainTimeLeft(GAME_DURATION);
    setGameState('playing');
    pickNextQuestion();
  };

  const handleAnswerSubmit = async () => {
    if (!currentQuestion || isAnswered) return;

    setIsAnswered(true);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    try {
      const response = await api.post('/api/exercises/brainstorm/submit', {
        exerciseId: currentQuestion.id,
        userAnswer: userAnswer,
      });

      const { isCorrect } = response.data;
      if (isCorrect) {
        const timeBonus = Math.floor(questionTimeLeft / 2);
        const currentMultiplier = 1 + streak * STREAK_MULTIPLIER_BONUS;
        const xpGained = Math.round(
          (BASE_XP_PER_CORRECT_ANSWER + timeBonus) * currentMultiplier
        );
        setTotalXp((prev) => prev + xpGained);
        setStreak((prev) => prev + 1);
        setFeedback({
          message: `+${xpGained} XP! Combo x${streak + 1}`,
          correct: true,
        });
      } else {
        setStreak(0);
        setLives((prev) => prev - 1);
        setFeedback({ message: 'Incorreto!', correct: false });
      }
    } catch (error) {
      console.error('Erro ao submeter resposta do Brainstorm:', error);
      setFeedback({
        message: 'Erro ao enviar. Tente de novo.',
        correct: false,
      });
    } finally {
      feedbackTimeoutRef.current = setTimeout(pickNextQuestion, 1500);
    }
  };

  if (gameState === 'idle') {
    return (
      <S.StormWrapper>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <S.CardContainer>
            <Title>Brainstorm Solo</Title>
            <Subtitle>
              Teste seus conhecimentos contra o relógio. Responda o máximo que
              puder antes que o tempo ou suas vidas acabem!
            </Subtitle>
            <S.StatsGrid>
              <S.StatCard>
                <S.IconCircle bg="linear-gradient(180deg,#60a5fa,#3182ce)">
                  <Timer size={24} color="white" weight="bold" />
                </S.IconCircle>
                <div>
                  <strong style={{ fontSize: '1.05rem' }}>Tempo Total</strong>
                  <div style={{ fontSize: '0.9rem', color: '#c7d2de' }}>
                    {GAME_DURATION} segundos
                  </div>
                </div>
              </S.StatCard>
              <S.StatCard>
                <S.IconCircle bg="linear-gradient(180deg,#f472b6,#c026d3)">
                  <Heart size={24} color="white" weight="bold" />
                </S.IconCircle>
                <div>
                  <strong style={{ fontSize: '1.05rem' }}>Vidas</strong>
                  <div style={{ fontSize: '0.9rem', color: '#c7d2de' }}>
                    {INITIAL_LIVES} chances
                  </div>
                </div>
              </S.StatCard>
              <S.StatCard>
                <S.IconCircle bg="linear-gradient(180deg,#43b581,#2f855a)">
                  <Question size={24} color="white" weight="bold" />
                </S.IconCircle>
                <div>
                  <strong style={{ fontSize: '1.05rem' }}>Bônus</strong>
                  <div style={{ fontSize: '0.9rem', color: '#c7d2de' }}>
                    XP por velocidade e combos
                  </div>
                </div>
              </S.StatCard>
            </S.StatsGrid>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                width: '100%',
                maxWidth: '400px',
                marginTop: '1rem',
              }}
            >
              <ContinueButton
                variant="primary"
                onClick={startGame}
                disabled={allExercises.length === 0}
              >
                Começar
              </ContinueButton>
              <ContinueButton variant="secondary" onClick={onBack}>
                Voltar
              </ContinueButton>
            </div>
          </S.CardContainer>
        )}
      </S.StormWrapper>
    );
  }

  if (gameState === 'finished') {
    return (
      <S.StormWrapper>
        <S.CardContainer>
          {totalXp > 0 ? (
            <>
              <Trophy size={64} color="#f1c40f" weight="fill" />
              <Title>Desafio Concluído!</Title>
              <Subtitle>Você ganhou um total de</Subtitle>
              <strong style={{ fontSize: '2rem', color: '#43b581' }}>
                {totalXp} XP Bônus!
              </strong>
            </>
          ) : (
            <>
              {gameOverReason === 'time' && <Timer size={64} color="#ed4245" />}
              {gameOverReason === 'lives' && (
                <XCircle size={64} color="#ed4245" />
              )}
              <Title>Fim de Jogo!</Title>
              <Subtitle>
                {gameOverReason === 'time'
                  ? 'O tempo acabou!'
                  : 'Você ficou sem vidas.'}
              </Subtitle>
            </>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <ContinueButton variant="primary" onClick={startGame}>
              Jogar Novamente
            </ContinueButton>
            <ContinueButton variant="secondary" onClick={onBack}>
              Voltar ao Menu
            </ContinueButton>
          </div>
        </S.CardContainer>
      </S.StormWrapper>
    );
  }

  return (
    <S.StormWrapper>
      <S.GameHeader>
        <S.MainTimer>
          <Timer size={32} />
          {mainTimeLeft}s
        </S.MainTimer>

        <S.StatsContainer>
          <S.StatItem>
            {Array(Math.max(0, lives))
              .fill(0)
              .map((_, i) => (
                <Heart key={i} weight="fill" color="#ed4245" size={28} />
              ))}
          </S.StatItem>
          <S.StatItem>🔥 {streak}x</S.StatItem>
          <S.StatItem>XP: {totalXp}</S.StatItem>
        </S.StatsContainer>
      </S.GameHeader>

      <S.TimerBarContainer>
        <S.TimerBarProgress
          percentage={(questionTimeLeft / QUESTION_TIME_LIMIT) * 100}
        />
      </S.TimerBarContainer>

      {feedback ? (
        <S.FeedbackText $isCorrect={feedback.correct}>
          {feedback.message}
        </S.FeedbackText>
      ) : (
        <div style={{ height: '30px' }} />
      )}

      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', maxWidth: '600px' }}
          >
            <ExerciseBox
              style={{
                opacity: isAnswered ? 0.6 : 1,
                minHeight: '270px',
              }}
            >
              <QuestionText>{currentQuestion.pergunta}</QuestionText>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {currentQuestion.opcoes?.map((option) => (
                  <OptionLabel key={option}>
                    <RadioInput
                      type="radio"
                      name={`ex-${currentQuestion.id}`}
                      value={option}
                      checked={userAnswer === option}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={isAnswered}
                    />
                    <span>{option}</span>
                  </OptionLabel>
                ))}
              </div>
            </ExerciseBox>
          </motion.div>
        )}
      </AnimatePresence>

      <ContinueButton
        variant="primary"
        onClick={handleAnswerSubmit}
        disabled={!userAnswer || isAnswered}
        style={{
          backgroundColor: '#43b581', // Mudei a cor pra combinar com a UI
        }}
      >
        Responder
      </ContinueButton>
    </S.StormWrapper>
  );
}
