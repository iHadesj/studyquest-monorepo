// server.ts (refatorado e corrigido)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { getRandomQuestion } from "./GameManager";
import { Exercicio } from "./interfaces";
import routes from "./routes/index";

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

const onlineUsers = new Map<string, string>(); // tag -> socketId

interface Player {
  tag: string;
  score: number;
  ready: boolean;
  socketId: string;
}

interface GameRoom {
  players: Player[];
  currentQuestion: Exercicio | null;
  questionTimer: NodeJS.Timeout | null;
  questionStartTime: number | null;
  questionAnswered: boolean;
  modeTimer?: NodeJS.Timeout | null;
  modeTimeLeft?: number | null;
  nextQuestionTimeout?: NodeJS.Timeout | null;
}
const gameRooms = new Map<string, GameRoom>();

const QUESTION_TIME_LIMIT_S = 15;
const NEXT_QUESTION_DELAY_MS = 3000;
const BASE_SCORE = 50;
const TIME_BONUS_MULTIPLIER = 10;
const MODE_DURATION_S = 60;

// utils
const normalizeAnswer = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, ""); // remove acentos

// Limpa todos os timers de uma sala (question, mode e nextQuestion timeout)
const safeClearAllTimers = (room: GameRoom) => {
  if (room.questionTimer) {
    clearInterval(room.questionTimer);
    room.questionTimer = null;
  }
  if (room.modeTimer) {
    clearInterval(room.modeTimer);
    room.modeTimer = null;
  }
  if (room.nextQuestionTimeout) {
    clearTimeout(room.nextQuestionTimeout);
    room.nextQuestionTimeout = null;
  }
};

const sendNextQuestion = (roomId: string) => {
  const room = gameRooms.get(roomId);
  if (!room) return;

  if (typeof room.modeTimeLeft === "number" && room.modeTimeLeft <= 0) {
    return;
  }

  if (room.questionTimer) {
    clearInterval(room.questionTimer);
    room.questionTimer = null;
  }

  const nextQuestion = getRandomQuestion();
  if (!nextQuestion) {
    safeClearAllTimers(room);
    io.to(roomId).emit("game_over", { finalScores: room.players });
    gameRooms.delete(roomId);
    console.log(`Sala ${roomId} finalizada — sem mais perguntas.`);
    return;
  }

  room.currentQuestion = nextQuestion;
  room.questionStartTime = Date.now();
  room.questionAnswered = false;

  const { respostaCorreta, ...questionForPlayers } = nextQuestion as any;
  io.to(roomId).emit("new_question", questionForPlayers);
  console.log(`Enviando nova pergunta para a sala ${roomId}`);

  let timeLeft = QUESTION_TIME_LIMIT_S;
  io.to(roomId).emit("timer_tick", { timeLeft });

  room.questionTimer = setInterval(() => {
    timeLeft -= 1;
    io.to(roomId).emit("timer_tick", { timeLeft });

    if (timeLeft <= 0) {
      if (room.questionTimer) {
        clearInterval(room.questionTimer);
        room.questionTimer = null;
      }

      if (!room.questionAnswered) {
        room.questionAnswered = true;
        io.to(roomId).emit("answer_result", {
          playerTag: "O TEMPO",
          isCorrect: false,
        });

        room.nextQuestionTimeout = setTimeout(() => {
          room.nextQuestionTimeout = null;
          sendNextQuestion(roomId);
        }, NEXT_QUESTION_DELAY_MS);
      }
    }
  }, 1000);
};

io.on("connection", (socket) => {
  console.log("✅ Novo jogador conectado! ID:", socket.id);

  socket.on("register", (fullTag: string) => {
    onlineUsers.set(fullTag, socket.id);
    console.log(`Jogador ${fullTag} registrado com o socket ID ${socket.id}`);
    socket.emit("registered", { tag: fullTag });
  });

  // --- CORREÇÃO ADICIONADA AQUI ---
  // Listener para quando o cliente pede a lista de amigos online
  socket.on(
    "get_online_friends",
    ({ friendTags }: { friendTags: string[] }) => {
      if (!Array.isArray(friendTags)) return;

      // Filtra a lista de amigos recebida, mantendo apenas aqueles que estão no nosso mapa de usuários online
      const onlineFriends = friendTags.filter((tag) => onlineUsers.has(tag));

      // Envia a lista de volta APENAS para o cliente que pediu
      socket.emit("online_friends", onlineFriends);
    }
  );
  // --- FIM DA CORREÇÃO ---

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
        const roomId = `game-${uuidv4()}`;

        const players: Player[] = [
          {
            tag: inviterTag,
            score: 0,
            ready: false,
            socketId: inviterSocketId,
          },
          { tag: inviteeTag, score: 0, ready: false, socketId: socket.id },
        ];

        gameRooms.set(roomId, {
          players,
          currentQuestion: null,
          questionTimer: null,
          questionStartTime: null,
          questionAnswered: true,
          modeTimer: null,
          modeTimeLeft: null,
          nextQuestionTimeout: null,
        });

        socket.join(roomId);
        io.sockets.sockets.get(inviterSocketId)?.join(roomId);

        io.to(roomId).emit("game_started", {
          roomId,
          players: gameRooms.get(roomId)?.players,
        });

        console.log(
          `Sala criada ${roomId} entre ${inviterTag} e ${inviteeTag}`
        );
      } else {
        io.to(inviterSocketId).emit("invite_declined", { from: inviteeTag });
      }
    }
  );

  socket.on("player_ready", ({ roomId }: { roomId: string }) => {
    const room = gameRooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.socketId === socket.id);
    if (player) {
      player.ready = true;
      console.log(`Jogador ${player.tag} está pronto na sala ${roomId}.`);
    }

    if (room.players.every((p) => p.ready)) {
      if (room.modeTimer) clearInterval(room.modeTimer);

      room.modeTimeLeft = MODE_DURATION_S;
      io.to(roomId).emit("mode_started", { duration: MODE_DURATION_S });

      room.modeTimer = setInterval(() => {
        if (typeof room.modeTimeLeft !== "number") return;
        room.modeTimeLeft!--;
        io.to(roomId).emit("mode_tick", { timeLeft: room.modeTimeLeft });

        if (room.modeTimeLeft! <= 0) {
          safeClearAllTimers(room);
          io.to(roomId).emit("game_over", { finalScores: room.players });
          gameRooms.delete(roomId);
          console.log(`Sala ${roomId} finalizada por tempo esgotado.`);
        }
      }, 1000);

      sendNextQuestion(roomId);
    }
  });

  socket.on(
    "submit_answer",
    ({ roomId, answer }: { roomId: string; answer: string }) => {
      const room = gameRooms.get(roomId);
      if (!room || room.questionAnswered) return;
      room.questionAnswered = true;

      if (room.questionTimer) {
        clearInterval(room.questionTimer);
        room.questionTimer = null;
      }

      if (!room.currentQuestion || !room.questionStartTime) return;

      const timeTakenMs = Date.now() - room.questionStartTime;
      const timeTakenS = Math.floor(timeTakenMs / 1000);

      const player = room.players.find((p) => p.socketId === socket.id);
      if (!player) return;

      const isCorrect =
        normalizeAnswer(room.currentQuestion.respostaCorreta) ===
        normalizeAnswer(answer || "");

      if (isCorrect) {
        const timeLeft = Math.max(0, QUESTION_TIME_LIMIT_S - timeTakenS);
        const timeBonus = timeLeft * TIME_BONUS_MULTIPLIER;
        player.score += BASE_SCORE + timeBonus;
        console.log(
          `Jogador ${player.tag} acertou! +${BASE_SCORE} base, +${timeBonus} bônus.`
        );
      } else {
        console.log(
          `Jogador ${player.tag} errou. Resp correta: ${room.currentQuestion.respostaCorreta}`
        );
      }

      io.to(roomId).emit("answer_result", { playerTag: player.tag, isCorrect });
      io.to(roomId).emit("update_score", room.players);

      if (room.nextQuestionTimeout) clearTimeout(room.nextQuestionTimeout);
      room.nextQuestionTimeout = setTimeout(() => {
        room.nextQuestionTimeout = null;
        sendNextQuestion(roomId);
      }, NEXT_QUESTION_DELAY_MS);
    }
  );

  socket.on("disconnect", () => {
    console.log("❌ Jogador desconectou. ID:", socket.id);

    for (const [tag, id] of [...onlineUsers.entries()]) {
      if (id === socket.id) {
        onlineUsers.delete(tag);
        console.log(`Jogador ${tag} removido dos online.`);
        break;
      }
    }

    for (const [roomId, room] of [...gameRooms.entries()]) {
      const disconnectedPlayer = room.players.find(
        (p) => p.socketId === socket.id
      );
      if (disconnectedPlayer) {
        io.to(roomId).emit("player_disconnected", {
          tag: disconnectedPlayer.tag,
        });
        safeClearAllTimers(room);
        gameRooms.delete(roomId);
        console.log(
          `Sala ${roomId} encerrada por desconexão (${disconnectedPlayer.tag}).`
        );
      }
    }
  });
});

const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}. Let's bora!`);
});
