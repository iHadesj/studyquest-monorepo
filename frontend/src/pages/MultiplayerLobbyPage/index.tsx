import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';

// Componentes globais que ainda usamos
import {
  Title,
  SubmitButton,
  BackButton,
  TextInput,
  QuestionText,
} from '../../style/globalStyle';

// Nossos novos componentes estilizados
import * as S from './style';

// Hooks e Serviços
import { socket } from '../../services/socket';
import { useProgressStore } from '../../hooks/useProgressStore';

// Ícones e Tipos
import { Timer, Trophy } from 'phosphor-react';
import type { Exercicio } from '../../interfaces';
import { Radio } from '@mui/material';

// --- Tipagens locais para o componente ---
type Player = { tag: string; score: number };
type RoundResult = { status: 'CERTO!' | 'ERRADO!'; points?: number };

interface MultiplayerLobbyPageProps {
  roomId: string;
  onGoHome: () => void;
}

export function MultiplayerLobbyPage({
  roomId,
  onGoHome,
}: MultiplayerLobbyPageProps) {
  // --- Estados do Componente ---
  const [currentQuestion, setCurrentQuestion] = useState<Omit<
    Exercicio,
    'respostaCorreta'
  > | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const { fullTag: myTag } = useProgressStore();

  // Estado para o feedback visual da rodada
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  // --- Memos para facilitar o acesso aos dados ---
  const me = useMemo(
    () => players.find((p) => p.tag === myTag),
    [players, myTag]
  );
  const opponent = useMemo(
    () => players.find((p) => p.tag !== myTag),
    [players, myTag]
  );

  // --- Efeito principal para comunicação com o Socket ---
  useEffect(() => {
    // NOTE: removi `players` das deps para evitar re-registrar listeners sempre que o placar muda

    const onTimerTick = ({ timeLeft: newTime }: { timeLeft: number }) =>
      setTimeLeft(newTime);

    const onNewQuestion = (question: Omit<Exercicio, 'respostaCorreta'>) => {
      setCurrentQuestion(question);
      setSelectedAnswer('');
      setHasAnswered(false);
      setRoundResult(null);
    };

    // agora usamos functional update pra comparar com o estado anterior com segurança
    const onUpdateScore = (updatedPlayers: Player[]) => {
      setPlayers((prevPlayers) => {
        const myOldScore = prevPlayers.find((p) => p.tag === myTag)?.score ?? 0;
        const myNewData = updatedPlayers.find((p) => p.tag === myTag);
        if (myNewData && myNewData.score > myOldScore) {
          const pointsGained = myNewData.score - myOldScore;
          setRoundResult({ status: 'CERTO!', points: pointsGained });
        }
        // substitui todo o array de players pelo que veio do servidor (padrão)
        return updatedPlayers;
      });
    };

    const onAnswerResult = ({
      playerTag,
      isCorrect,
    }: {
      playerTag: string;
      isCorrect: boolean;
    }) => {
      // Se chegou resultado e for nosso, e for errado, mostra ERRADO
      if (playerTag === myTag && !isCorrect) {
        setRoundResult({ status: 'ERRADO!' });
      }
      // Quando qualquer um responder (o server trava a pergunta), já bloqueia UI pra todo mundo
      setHasAnswered(true);
    };

    const onGameOver = ({ finalScores }: { finalScores: Player[] }) => {
      setPlayers(finalScores);
      setIsGameOver(true);
      setCurrentQuestion(null);
    };

    const onPlayerDisconnected = ({ tag }: { tag?: string }) => {
      // opcional: mostra mensagem, volta pra home, etc. Aqui só um console.
      console.warn('player disconnected:', tag);
    };

    // Registra todos os ouvintes (uma vez)
    socket.on('timer_tick', onTimerTick);
    socket.on('new_question', onNewQuestion);
    socket.on('update_score', onUpdateScore);
    socket.on('answer_result', onAnswerResult);
    socket.on('game_over', onGameOver);
    socket.on('player_disconnected', onPlayerDisconnected);

    // Avisa o servidor que estamos prontos (apenas quando componente monta / roomId muda)
    socket.emit('player_ready', { roomId });

    // Função de limpeza para remover os ouvintes
    return () => {
      socket.off('timer_tick', onTimerTick);
      socket.off('new_question', onNewQuestion);
      socket.off('update_score', onUpdateScore);
      socket.off('answer_result', onAnswerResult);
      socket.off('game_over', onGameOver);
      socket.off('player_disconnected', onPlayerDisconnected);
    };
    // dependências intencionais: re-executa se mudar de sala ou se meu tag mudar
  }, [roomId, myTag]);

  // --- Lógica para determinar o vencedor no fim do jogo ---
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

  // --- Handler para enviar a resposta ---
  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    socket.emit('submit_answer', { roomId, answer: selectedAnswer });
    setHasAnswered(true);
  };

  // --- Renderização da tela de Fim de Jogo ---
  if (isGameOver) {
    return (
      <S.LobbyWrapper>
        <S.GameOverScreen>
          <Trophy size={64} color="#f1c40f" weight="fill" />
          <Title>
            {winner?.tag === 'Empate!'
              ? 'O Duelo Empatou!'
              : `${winner?.tag} Venceu!`}
          </Title>
          <h2>Placar Final</h2>
          <S.Header style={{ width: '100%' }}>
            {players.map((p) => (
              <S.PlayerInfo key={p.tag} isMe={p.tag === myTag}>
                {p.tag === winner?.tag && <Trophy size={24} weight="fill" />}
                <span className="tag">{p.tag}</span>
                <span className="score">{p.score}</span>
              </S.PlayerInfo>
            ))}
          </S.Header>
          <BackButton
            onClick={onGoHome}
            style={{ position: 'static', margin: '1rem 0 0 0' }}
          >
            Voltar ao Menu Principal
          </BackButton>
        </S.GameOverScreen>
      </S.LobbyWrapper>
    );
  }

  return (
    <S.LobbyWrapper>
      <Title>Duelo Brainstorm!</Title>

      <S.Header>
        <S.PlayerInfo isMe>
          <span className="tag">{me?.tag ?? 'Você'}</span>
          <span className="score">{me?.score ?? 0}</span>
        </S.PlayerInfo>

        <S.CentralTimer
          timeLow={timeLeft <= 5}
          key={timeLeft}
          initial={{ scale: 1 }}
          animate={{ scale: timeLeft <= 5 ? 1.2 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Timer size={32} />
          {timeLeft}
        </S.CentralTimer>

        <S.PlayerInfo>
          <span className="tag">{opponent?.tag ?? 'Oponente'}</span>
          <span className="score">{opponent?.score ?? 0}</span>
        </S.PlayerInfo>
      </S.Header>

      <div style={{ position: 'relative', minHeight: '300px' }}>
        <AnimatePresence>
          {roundResult && (
            <S.FeedbackOverlay
              $isCorrect={roundResult.status === 'CERTO!'}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
            >
              <span className="status">{roundResult.status}</span>
              {roundResult.points && (
                <span className="points">+{roundResult.points} XP!</span>
              )}
            </S.FeedbackOverlay>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!currentQuestion ? (
            <S.WaitingText key="waiting">
              Aguardando o duelo começar...
            </S.WaitingText>
          ) : (
            <S.QuestionCard
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <QuestionText>{currentQuestion.pergunta}</QuestionText>

              {currentQuestion.tipo === 'multipla_escolha' && (
                <S.OptionsContainer>
                  {currentQuestion.opcoes?.map((option) => (
                    <S.StyledFormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                      checked={selectedAnswer === option}
                      onChange={(e) =>
                        setSelectedAnswer((e.target as HTMLInputElement).value)
                      }
                      disabled={hasAnswered}
                      $selected={selectedAnswer === option}
                    />
                  ))}
                </S.OptionsContainer>
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
            </S.QuestionCard>
          )}
        </AnimatePresence>
      </div>
    </S.LobbyWrapper>
  );
}
