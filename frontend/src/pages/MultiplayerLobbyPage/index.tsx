import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  Title,
  ExerciseBox,
  QuestionText,
  OptionLabel,
  RadioInput,
  SubmitButton,
  BackButton,
  TextInput,
} from '../../style/globalStyle';
import { socket } from '../../services/socket';
import { Timer, Trophy } from 'phosphor-react';
import { useProgressStore } from '../../hooks/useProgressStore';
import type { Exercicio } from '../../interfaces';

const LobbyWrapper = styled.div`
  max-width: 48rem;
  margin: 2rem auto;
  text-align: center;
`;

const Scoreboard = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  font-size: 1.5rem;
  background-color: #2f3136;
  padding: 1rem;
  border-radius: 8px;
`;

const PlayerTag = styled.span`
  max-width: 150px; // Largura máxima que o nome pode ocupar
  white-space: nowrap; // Impede que o nome quebre a linha
  overflow: hidden; // Esconde o que passar da largura máxima
  text-overflow: ellipsis; // Adiciona os "..." no final
`;

const PlayerScore = styled.div<{ isWinner?: boolean; isMe?: boolean }>`
  font-weight: ${(props) => (props.isMe || props.isWinner ? 'bold' : 'normal')};
  color: ${(props) =>
    props.isWinner ? '#f1c40f' : props.isMe ? '#5865f2' : 'white'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease-in-out;
  // Adiciona um flex-basis para ajudar na distribuição do espaço
  flex-basis: 45%;
  justify-content: center;
`;

const TimerDisplay = styled.div<{ timeLow: boolean }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props) => (props.timeLow ? '#ed4245' : 'white')};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const FeedbackText = styled.p`
  height: 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #faa61a;
  transition: opacity 0.3s ease-in-out;
`;

const GameOverScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background-color: #202225;
  border-radius: 8px;
  animation: fadeIn 0.5s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

type Player = { tag: string; score: number };

interface MultiplayerLobbyPageProps {
  roomId: string;
  onGoHome: () => void;
}

export function MultiplayerLobbyPage({
  roomId,
  onGoHome,
}: MultiplayerLobbyPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Omit<
    Exercicio,
    'respostaCorreta'
  > | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const { fullTag: myTag } = useProgressStore();

  useEffect(() => {
    // --- FUNÇÕES QUE OUVEM O SERVIDOR ---
    const onTimerTick = ({ timeLeft: newTime }: { timeLeft: number }) => {
      setTimeLeft(newTime);
    };

    const onNewQuestion = (question: Omit<Exercicio, 'respostaCorreta'>) => {
      console.log('Nova pergunta recebida:', question);
      setCurrentQuestion(question);
      setSelectedAnswer('');
      setFeedback('');
      setHasAnswered(false);
      setTimeLeft(15); // Reseta o timer visual
    };

    const onUpdateScore = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    };

    const onAnswerResult = ({
      playerTag,
      isCorrect,
    }: {
      playerTag: string;
      isCorrect: boolean;
    }) => {
      setFeedback(
        `${playerTag} respondeu... ${isCorrect ? 'CERTO!' : 'ERRADO!'}`
      );
      setHasAnswered(true);
    };

    const onGameOver = ({ finalScores }: { finalScores: Player[] }) => {
      setFeedback('FIM DE JOGO!');
      setPlayers(finalScores);
      setIsGameOver(true);
      setCurrentQuestion(null);
    };

    // --- REGISTRA TODOS OS OUVINTES ---
    socket.on('timer_tick', onTimerTick);
    socket.on('new_question', onNewQuestion);
    socket.on('update_score', onUpdateScore);
    socket.on('answer_result', onAnswerResult);
    socket.on('game_over', onGameOver);

    // AVISA O SERVIDOR QUE ESTA TELA CARREGOU E ESTAMOS PRONTOS
    socket.emit('player_ready', { roomId });

    // --- FUNÇÃO DE LIMPEZA ---
    return () => {
      socket.off('timer_tick', onTimerTick);
      socket.off('new_question', onNewQuestion);
      socket.off('update_score', onUpdateScore);
      socket.off('answer_result', onAnswerResult);
      socket.off('game_over', onGameOver);
    };
  }, [roomId]);

  const winner = useMemo(() => {
    if (!isGameOver) return null;
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    if (
      sortedPlayers.length > 1 &&
      sortedPlayers[0].score === sortedPlayers[1].score &&
      sortedPlayers[0].score > 0
    ) {
      return { tag: 'Empate!', score: sortedPlayers[0].score };
    }
    return sortedPlayers[0];
  }, [isGameOver, players]);

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    socket.emit('submit_answer', { roomId, answer: selectedAnswer });
    setHasAnswered(true);
  };

  if (isGameOver) {
    return (
      <LobbyWrapper>
        <GameOverScreen>
          <Trophy size={64} color="#f1c40f" weight="fill" />
          <Title>
            {winner?.tag === 'Empate!'
              ? 'O Duelo Empatou!'
              : `${winner?.tag} Venceu!`}
          </Title>
          <h2>Placar Final</h2>
          <Scoreboard style={{ width: '100%' }}>
            {players.map((p) => (
              <PlayerScore
                key={p.tag}
                isWinner={p.tag === winner?.tag}
                isMe={p.tag === myTag}
              >
                {p.tag === winner?.tag && <Trophy size={24} weight="fill" />}
                {p.tag}: {p.score}
              </PlayerScore>
            ))}
          </Scoreboard>
          <BackButton
            onClick={onGoHome}
            style={{ position: 'static', margin: '1rem 0 0 0' }}
          >
            Voltar ao Menu Principal
          </BackButton>
        </GameOverScreen>
      </LobbyWrapper>
    );
  }

  return (
    <LobbyWrapper>
      <Title>Duelo Brainstorm!</Title>

      <Scoreboard>
        {players.map((p) => (
          <PlayerScore key={p.tag} isMe={p.tag === myTag}>
            <PlayerTag>{p.tag}</PlayerTag>: {p.score}
          </PlayerScore>
        ))}
      </Scoreboard>

      {currentQuestion && (
        <TimerDisplay timeLow={timeLeft <= 5}>
          <Timer size={32} />
          {timeLeft}
        </TimerDisplay>
      )}

      <FeedbackText>{feedback}</FeedbackText>

      {!currentQuestion ? (
        <h2>Aguardando jogadores ficarem prontos...</h2>
      ) : (
        <ExerciseBox>
          <QuestionText>{currentQuestion.pergunta}</QuestionText>
          {currentQuestion.tipo === 'multipla_escolha' && (
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
                    checked={selectedAnswer === option}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={hasAnswered}
                  />
                  <span>{option}</span>
                </OptionLabel>
              ))}
            </div>
          )}
          {currentQuestion.tipo === 'preenchimento' && (
            <TextInput
              type="text"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              placeholder="Digite sua resposta aqui"
              disabled={hasAnswered}
              autoFocus
            />
          )}
          <SubmitButton
            onClick={handleAnswerSubmit}
            disabled={!selectedAnswer || hasAnswered}
            style={{ marginTop: '1.5rem' }}
          >
            Confirmar Resposta
          </SubmitButton>
        </ExerciseBox>
      )}
    </LobbyWrapper>
  );
}
