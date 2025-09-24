import { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import type { Exercicio, Materia } from '../../interfaces';
import { Heart, Timer, XCircle } from 'phosphor-react';

import {
  ExerciseBox,
  QuestionText,
  RadioInput,
  OptionLabel,
  TextInput,
  ContinueButton,
  Title,
  Subtitle,
} from '../../style/globalStyle';

import {
  StormWrapper,
  StatsBar,
  StatItem,
  TimerBarContainer,
  TimerBarProgress,
  FeedbackText,
  StartScreen,
} from './style';

const GAME_DURATION = 60; // 1 minuto
const QUESTION_TIME_LIMIT = 15; // 15 segundos
const INITIAL_LIVES = 3;
const BASE_XP_PER_CORRECT_ANSWER = 20;
const STREAK_MULTIPLIER_BONUS = 0.5;

interface BrainStormProps {
  subjects: Materia[];
  onBack: () => void;
}

export function BrainStorm({ subjects, onBack }: BrainStormProps) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>(
    'idle'
  );
  const [mainTimeLeft, setMainTimeLeft] = useState(GAME_DURATION);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [totalXp, setTotalXp] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<'time' | 'lives' | null>(
    null
  );
  const [streak, setStreak] = useState(0);

  console.log(mainTimeLeft);

  // Estados da pergunta atual
  const [currentQuestion, setCurrentQuestion] = useState<Exercicio | null>(
    null
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{
    message: string;
    correct: boolean;
  } | null>(null);

  const allExercises = useMemo(() => {
    return subjects.flatMap((subject) =>
      subject.niveis.flatMap((level) => level.exercicios)
    );
  }, [subjects]);

  const pickNextQuestion = useCallback(() => {
    setUserAnswer('');
    setFeedback(null);
    setQuestionTimeLeft(QUESTION_TIME_LIMIT);
    if (allExercises.length > 0) {
      const randomIndex = Math.floor(Math.random() * allExercises.length);
      setCurrentQuestion(allExercises[randomIndex]);
    }
  }, [allExercises]);

  const endGame = useCallback(
    async (reason: 'time' | 'lives') => {
      setGameOverReason(reason);
      setGameState('finished');
      const user = auth.currentUser;
      if (user && totalXp > 0) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          await updateDoc(userDocRef, { xp: increment(totalXp) });
        } catch (error) {
          console.error('Erro ao salvar XP bônus:', error);
        }
      }
    },
    [totalXp]
  );

  useEffect(() => {
    if (gameState !== 'playing') return;

    const mainTimer = setInterval(() => {
      setMainTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(mainTimer);
          endGame('time');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const questionTimer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          setStreak(0);
          setLives((l) => l - 1);
          setFeedback({ message: 'Tempo esgotado!', correct: false });
          setTimeout(pickNextQuestion, 1500);
          return QUESTION_TIME_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(mainTimer);
      clearInterval(questionTimer);
    };
  }, [gameState, pickNextQuestion, endGame]);

  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      endGame('lives');
    }
  }, [lives, gameState, endGame]);

  const startGame = () => {
    setLives(INITIAL_LIVES);
    setTotalXp(0);
    setGameOverReason(null);
    setStreak(0);
    setMainTimeLeft(GAME_DURATION);
    setGameState('playing');
    pickNextQuestion();
  };

  const handleAnswerSubmit = () => {
    if (!currentQuestion || feedback) return;
    const isCorrect =
      userAnswer.trim().toLowerCase() ===
      currentQuestion.respostaCorreta.trim().toLowerCase();

    if (isCorrect) {
      const timeBonus = questionTimeLeft;
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
    setTimeout(pickNextQuestion, 1500);
  };
  if (gameState === 'idle') {
    return (
      <StormWrapper>
        <StartScreen>
          <Title>Modo Brainstorm!</Title>
          <Subtitle as="p">
            Teste seus conhecimentos contra o relógio. Você tem{' '}
            <strong>{GAME_DURATION} segundos</strong> e{' '}
            <strong>{INITIAL_LIVES} vidas</strong>. Responda cada pergunta em
            até <strong>{QUESTION_TIME_LIMIT} segundos</strong>. Quanto mais
            rápido, mais XP você ganha!
          </Subtitle>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '1rem',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <ContinueButton
              style={{ marginTop: '0px' }}
              variant="primary"
              onClick={startGame}
            >
              Começar!
            </ContinueButton>
            <ContinueButton
              style={{ marginTop: '0px' }}
              variant="secondary"
              onClick={onBack}
            >
              Cancelar
            </ContinueButton>
          </div>
        </StartScreen>
      </StormWrapper>
    );
  }

  if (gameState === 'finished') {
    const playerWon = totalXp > 0;
    return (
      <StormWrapper>
        {playerWon ? (
          <>
            <Title>Desafio Concluído!</Title>
            <Subtitle>Você ganhou um total de</Subtitle>
            <Title as="h2" style={{ fontSize: '2rem', color: '#43b581' }}>
              {totalXp} XP Bônus!
            </Title>
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
            <p style={{ color: '#b9bbbe', marginTop: '1rem' }}>
              Não desanime, tente novamente!
            </p>
          </>
        )}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <ContinueButton variant="primary" onClick={startGame}>
            Jogar Novamente
          </ContinueButton>
          <ContinueButton variant="secondary" onClick={onBack}>
            Voltar ao Menu
          </ContinueButton>
        </div>
      </StormWrapper>
    );
  }

  return (
    <StormWrapper>
      <StatsBar style={{ justifyContent: 'center' }}>
        <StatItem>
          <Timer size={20} />
          <strong>{mainTimeLeft}s</strong>
        </StatItem>
      </StatsBar>
      <StatsBar>
        <StatItem>
          <strong>
            {Array(Math.max(0, lives))
              .fill(0)
              .map((_, index) => (
                <Heart key={index} weight="fill" color="#ed4245" size={24} />
              ))}
          </strong>
        </StatItem>
        <StatItem>
          🔥 Combo: <strong>{streak}x</strong>
        </StatItem>
        <StatItem>
          XP: <strong>{totalXp}</strong>
        </StatItem>
      </StatsBar>

      <TimerBarContainer>
        <TimerBarProgress
          percentage={(questionTimeLeft / QUESTION_TIME_LIMIT) * 100}
        />
      </TimerBarContainer>

      {feedback && (
        <FeedbackText isCorrect={feedback.correct}>
          {feedback.message}
        </FeedbackText>
      )}

      {currentQuestion && (
        <ExerciseBox
          style={{ minHeight: '130px', opacity: feedback ? 0.5 : 1 }}
        >
          <QuestionText>{currentQuestion.pergunta}</QuestionText>
          {currentQuestion.tipo === 'multipla_escolha' &&
            currentQuestion.opcoes && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {currentQuestion.opcoes.map((option) => (
                  <OptionLabel key={option}>
                    <RadioInput
                      type="radio"
                      name={`ex-${currentQuestion.id}`}
                      value={option}
                      checked={userAnswer === option}
                      onChange={(e) => setUserAnswer(e.target.value)}
                    />
                    <span>{option}</span>
                  </OptionLabel>
                ))}
              </div>
            )}
          {currentQuestion.tipo === 'preenchimento' && (
            <TextInput
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Digite sua resposta"
            />
          )}
        </ExerciseBox>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <ContinueButton
          variant="primary"
          onClick={handleAnswerSubmit}
          disabled={!userAnswer || !!feedback}
        >
          Responder
        </ContinueButton>
        <ContinueButton variant="secondary" onClick={onBack}>
          Cancelar
        </ContinueButton>
      </div>
    </StormWrapper>
  );
}
