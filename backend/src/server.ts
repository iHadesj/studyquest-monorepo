import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { getRandomQuestion } from "./GameManager";
import { Exercicio } from "./interfaces";
import routes from "./routes";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(routes);

const onlineUsers = new Map<string, string>();

interface GameRoom {
  players: { tag: string; score: number; ready: boolean }[];
  currentQuestion: Exercicio | null;
  questionTimer: NodeJS.Timeout | null;
  questionStartTime: number | null; // <-- Para guardar quando a pergunta começou
}
const gameRooms = new Map<string, GameRoom>();

const QUESTION_TIME_LIMIT_S = 15;
const NEXT_QUESTION_DELAY_MS = 3000;
const BASE_SCORE = 50; // Pontos base por acertar
const TIME_BONUS_MULTIPLIER = 10; // Pontos extras por cada segundo restante

const sendNextQuestion = (roomId: string) => {
  const room = gameRooms.get(roomId);
  if (!room) return;

  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
  }

  const nextQuestion = getRandomQuestion();
  if (nextQuestion) {
    room.currentQuestion = nextQuestion;
    room.questionStartTime = Date.now(); // <-- Guarda o "carimbo de tempo" do início
    const { respostaCorreta, ...questionForPlayers } = nextQuestion;

    io.to(roomId).emit("new_question", questionForPlayers);
    io.to(roomId).emit("timer_tick", { timeLeft: QUESTION_TIME_LIMIT_S }); // Envia o tempo inicial pro front
    console.log(`Enviando nova pergunta para a sala ${roomId}`);

    // Timer para caso ninguém responda a tempo
    room.questionTimer = setTimeout(() => {
      io.to(roomId).emit("answer_result", {
        playerTag: "O TEMPO",
        isCorrect: false,
      });
      setTimeout(() => sendNextQuestion(roomId), NEXT_QUESTION_DELAY_MS);
    }, QUESTION_TIME_LIMIT_S * 1000);
  } else {
    io.to(roomId).emit("game_over", { finalScores: room.players });
    gameRooms.delete(roomId);
  }
};

io.on("connection", (socket) => {
  // ... (register, invite_player, e disconnect continuam iguais)

  socket.on(
    "invite_response",
    ({ inviterTag, accepted }: { inviterTag: string; accepted: boolean }) => {
      const inviterSocketId = onlineUsers.get(inviterTag);
      if (!inviterSocketId) return;

      let inviteeTag = "";
      for (const [tag, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          inviteeTag = tag;
          break;
        }
      }

      if (accepted) {
        const roomId = `game-${inviterSocketId}-${socket.id}`;
        gameRooms.set(roomId, {
          players: [
            { tag: inviterTag, score: 0, ready: false },
            { tag: inviteeTag, score: 0, ready: false },
          ],
          currentQuestion: null,
          questionTimer: null,
          questionStartTime: null, // <-- Inicializa o novo campo
        });

        socket.join(roomId);
        io.sockets.sockets.get(inviterSocketId)?.join(roomId);

        io.to(roomId).emit("game_started", {
          roomId,
          players: gameRooms.get(roomId)?.players,
        });
      } else {
        io.to(inviterSocketId).emit("invite_declined", { from: inviteeTag });
      }
    }
  );

  socket.on("player_ready", ({ roomId }: { roomId: string }) => {
    const room = gameRooms.get(roomId);
    if (!room) return;

    let playerTag = "";
    for (const [tag, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        playerTag = tag;
        break;
      }
    }

    const player = room.players.find((p) => p.tag === playerTag);
    if (player) {
      player.ready = true;
      console.log(`Jogador ${playerTag} está pronto na sala ${roomId}.`);
    }

    const allReady = room.players.every((p) => p.ready);
    if (allReady) {
      console.log(`Todos prontos na sala ${roomId}. Começando o jogo...`);
      sendNextQuestion(roomId);
    }
  });

  // ==========================================================
  // >>>>> OUVINTE submit_answer COM PONTUAÇÃO DINÂMICA <<<<<
  // ==========================================================
  socket.on(
    "submit_answer",
    ({ roomId, answer }: { roomId: string; answer: string }) => {
      const room = gameRooms.get(roomId);
      // Trava para evitar respostas duplas na mesma pergunta
      if (!room || !room.currentQuestion || !room.questionStartTime) return;

      // Para o timer de "tempo esgotado" assim que a primeira resposta chega
      if (room.questionTimer) {
        clearTimeout(room.questionTimer);
        room.questionTimer = null;
      }

      const timeTakenMs = Date.now() - room.questionStartTime;
      const timeTakenS = Math.floor(timeTakenMs / 1000);

      // Trava a pergunta para que não possa ser respondida de novo
      room.questionStartTime = null;

      let playerTag = "";
      for (const [tag, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          playerTag = tag;
          break;
        }
      }

      const isCorrect =
        room.currentQuestion.respostaCorreta.toLowerCase() ===
        answer.toLowerCase();

      if (isCorrect) {
        const player = room.players.find((p) => p.tag === playerTag);
        if (player) {
          const timeLeft = Math.max(0, QUESTION_TIME_LIMIT_S - timeTakenS);
          const timeBonus = timeLeft * TIME_BONUS_MULTIPLIER;
          player.score += BASE_SCORE + timeBonus;
          console.log(
            `Jogador ${playerTag} acertou! +${BASE_SCORE} base, +${timeBonus} bônus.`
          );
        }
      }

      io.to(roomId).emit("answer_result", { playerTag, isCorrect });
      io.to(roomId).emit("update_score", room.players);

      // Inicia o ciclo para a próxima pergunta
      setTimeout(() => sendNextQuestion(roomId), NEXT_QUESTION_DELAY_MS);
    }
  );

  socket.on("disconnect", () => {
    // ... (lógica do disconnect continua a mesma)
  });
});

const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}. Let's bora!`);
});
