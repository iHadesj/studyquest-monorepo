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
  questionInterval: NodeJS.Timeout | null;
}
const gameRooms = new Map<string, GameRoom>();

const QUESTION_TIME_LIMIT = 15;

const sendNextQuestion = (roomId: string) => {
  const room = gameRooms.get(roomId);
  if (!room) return;

  if (room.questionInterval) {
    clearInterval(room.questionInterval);
  }

  const nextQuestion = getRandomQuestion();
  if (nextQuestion) {
    room.currentQuestion = nextQuestion;
    const { respostaCorreta, ...questionForPlayers } = nextQuestion;
    io.to(roomId).emit("new_question", questionForPlayers);
    console.log(`Enviando nova pergunta para a sala ${roomId}`);

    let timeLeft = QUESTION_TIME_LIMIT;
    room.questionInterval = setInterval(() => {
      io.to(roomId).emit("timer_tick", { timeLeft });
      timeLeft--;

      if (timeLeft < 0) {
        clearInterval(room.questionInterval!);
        io.to(roomId).emit("answer_result", {
          playerTag: "O TEMPO",
          isCorrect: false,
        });
        io.to(roomId).emit("update_score", room.players);
        setTimeout(() => sendNextQuestion(roomId), 3000);
      }
    }, 1000);
  } else {
    io.to(roomId).emit("game_over", { finalScores: room.players });
    gameRooms.delete(roomId);
  }
};

io.on("connection", (socket) => {
  console.log("✅ Novo jogador conectado! ID:", socket.id);

  socket.on("register", (fullTag: string) => {
    console.log(`Registrando jogador: ${fullTag} com o ID: ${socket.id}`);
    onlineUsers.set(fullTag, socket.id);
  });

  socket.on("invite_player", ({ inviteeTag }: { inviteeTag: string }) => {
    let inviterTag = "";
    for (const [tag, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        inviterTag = tag;
        break;
      }
    }
    const inviteeSocketId = onlineUsers.get(inviteeTag);
    if (inviteeSocketId) {
      io.to(inviteeSocketId).emit("incoming_invite", { from: inviterTag });
    } else {
      socket.emit("invite_error", {
        message: `Jogador ${inviteeTag} não encontrado ou está offline.`,
      });
    }
  });

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
          questionInterval: null,
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

  socket.on(
    "submit_answer",
    ({ roomId, answer }: { roomId: string; answer: string }) => {
      const room = gameRooms.get(roomId);
      if (!room || !room.currentQuestion) return;

      if (room.questionInterval) {
        clearInterval(room.questionInterval);
        room.questionInterval = null;
      }

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
          player.score += 100;
        }
      }

      io.to(roomId).emit("answer_result", { playerTag, isCorrect });
      io.to(roomId).emit("update_score", room.players);

      setTimeout(() => sendNextQuestion(roomId), 3000);
    }
  );

  socket.on("disconnect", () => {
    console.log("❌ Jogador desconectou. ID:", socket.id);
    for (const [tag, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(tag);
        console.log(`Jogador ${tag} removido dos online.`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}. Let's bora!`);
});
