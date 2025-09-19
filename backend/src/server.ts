// server.ts (refatorado)
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

  // Se o modo já acabou, não tenta enviar nada
  if (typeof room.modeTimeLeft === "number" && room.modeTimeLeft <= 0) {
    return;
  }

  // garante limpeza do timer anterior de pergunta
  if (room.questionTimer) {
    clearInterval(room.questionTimer);
    room.questionTimer = null;
  }

  const nextQuestion = getRandomQuestion();
  if (!nextQuestion) {
    // sem mais perguntas => fim de jogo
    safeClearAllTimers(room);
    io.to(roomId).emit("game_over", { finalScores: room.players });
    gameRooms.delete(roomId);
    console.log(`Sala ${roomId} finalizada — sem mais perguntas.`);
    return;
  }

  room.currentQuestion = nextQuestion;
  room.questionStartTime = Date.now();
  room.questionAnswered = false;

  // envia pergunta sem resposta correta
  const { respostaCorreta, ...questionForPlayers } = nextQuestion as any;
  io.to(roomId).emit("new_question", questionForPlayers);
  console.log(`Enviando nova pergunta para a sala ${roomId}`);

  let timeLeft = QUESTION_TIME_LIMIT_S;
  io.to(roomId).emit("timer_tick", { timeLeft });

  room.questionTimer = setInterval(() => {
    timeLeft -= 1;
    io.to(roomId).emit("timer_tick", { timeLeft });

    if (timeLeft <= 0) {
      // timeout: ninguém respondeu a tempo
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

        // agenda próxima pergunta (guardando o timeout para limpar se necessário)
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
    const prev = onlineUsers.get(fullTag);
    if (prev && prev !== socket.id) {
      console.log(`Tag ${fullTag} reconectou. Atualizando socketId.`);
    }
    onlineUsers.set(fullTag, socket.id);
    socket.emit("registered", { tag: fullTag });
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
        const roomId = `game-${uuidv4()}`;
        const inviterSocket = inviterSocketId;
        const inviteeSocket = socket.id;

        const players: Player[] = [
          {
            tag: inviterTag,
            score: 0,
            ready: false,
            socketId: inviterSocket,
          },
          {
            tag: inviteeTag,
            score: 0,
            ready: false,
            socketId: inviteeSocket,
          },
        ];

        gameRooms.set(roomId, {
          players,
          currentQuestion: null,
          questionTimer: null,
          questionStartTime: null,
          questionAnswered: true, // começa trancado até a primeira pergunta ser enviada
          modeTimer: null,
          modeTimeLeft: null,
          nextQuestionTimeout: null,
        });

        // juntar sockets na room
        socket.join(roomId);
        io.sockets.sockets.get(inviterSocketId)?.join(roomId);

        io.to(roomId).emit("game_started", {
          roomId,
          players: gameRooms.get(roomId)?.players,
        });

        console.log(
          `Sala criada ${roomId} entre ${inviterTag} (${inviterSocketId}) e ${inviteeTag} (${socket.id})`
        );
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
      // também atualiza socketId caso o player tenha reconectado com outro socket
      player.socketId = socket.id;
      console.log(`Jogador ${playerTag} está pronto na sala ${roomId}.`);
    }

    const allReady = room.players.every((p) => p.ready);
    if (allReady) {
      // proteção: se já existe um modeTimer, limpa antes de recriar
      if (room.modeTimer) {
        clearInterval(room.modeTimer);
        room.modeTimer = null;
      }

      room.modeTimeLeft = MODE_DURATION_S;
      io.to(roomId).emit("mode_started", { duration: MODE_DURATION_S });

      // emitir ticks do modo e finalizar a sala quando acabar
      room.modeTimer = setInterval(() => {
        if (typeof room.modeTimeLeft !== "number") return;
        room.modeTimeLeft!--;
        io.to(roomId).emit("mode_tick", { timeLeft: room.modeTimeLeft });

        if (room.modeTimeLeft! <= 0) {
          // finalizar jogo por tempo
          // limpa todos os timers associados à sala
          safeClearAllTimers(room);
          io.to(roomId).emit("game_over", { finalScores: room.players });
          gameRooms.delete(roomId);
          console.log(`Sala ${roomId} finalizada por tempo esgotado.`);
        }
      }, 1000);

      // manda a primeira pergunta
      sendNextQuestion(roomId);
    }
  });

  socket.on(
    "submit_answer",
    ({ roomId, answer }: { roomId: string; answer: string }) => {
      const room = gameRooms.get(roomId);

      // Se a sala não existe ou a pergunta JÁ FOI RESPONDIDA, ignora.
      if (!room || room.questionAnswered) {
        return;
      }
      // TRANCAR A PORTA imediatamente
      room.questionAnswered = true;

      // limpa timer da pergunta
      if (room.questionTimer) {
        clearInterval(room.questionTimer);
        room.questionTimer = null;
      }

      // Checagem de segurança pra garantir que os dados existem
      if (!room.currentQuestion || !room.questionStartTime) return;

      const timeTakenMs = Date.now() - room.questionStartTime;
      const timeTakenS = Math.floor(timeTakenMs / 1000);

      let playerTag = "";
      for (const [tag, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          playerTag = tag;
          break;
        }
      }

      const correct = normalizeAnswer(room.currentQuestion.respostaCorreta);
      const given = normalizeAnswer(answer || "");

      const isCorrect = correct === given;

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
      } else {
        console.log(
          `Jogador ${playerTag} errou. Resp correta: ${room.currentQuestion.respostaCorreta}`
        );
      }

      io.to(roomId).emit("answer_result", { playerTag, isCorrect });
      io.to(roomId).emit("update_score", room.players);

      // Inicia o ciclo para a próxima pergunta (só o primeiro que respondeu vai chegar aqui)
      if (room) {
        // garante que não acumule timeouts duplicados
        if (room.nextQuestionTimeout) {
          clearTimeout(room.nextQuestionTimeout);
          room.nextQuestionTimeout = null;
        }
        room.nextQuestionTimeout = setTimeout(() => {
          room.nextQuestionTimeout = null;
          sendNextQuestion(roomId);
        }, NEXT_QUESTION_DELAY_MS);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("❌ Jogador desconectou. ID:", socket.id);

    // remove do onlineUsers (se existir)
    for (const [tag, id] of [...onlineUsers.entries()]) {
      if (id === socket.id) {
        onlineUsers.delete(tag);
        console.log(`Jogador ${tag} removido dos online.`);
        break;
      }
    }

    // procurar salas que contenham esse socket e encerrar/limpar
    for (const [roomId, room] of [...gameRooms.entries()]) {
      const idx = room.players.findIndex((p) => p.socketId === socket.id);
      if (idx !== -1) {
        const disconnectedPlayer = room.players[idx];
        // notifica a sala
        io.to(roomId).emit("player_disconnected", {
          tag: disconnectedPlayer?.tag,
        });

        // limpa todos os timers e remove a sala
        safeClearAllTimers(room);
        gameRooms.delete(roomId);
        console.log(
          `Sala ${roomId} encerrada por desconexão (${disconnectedPlayer?.tag}).`
        );
      }
    }
  });
});

const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}. Let's bora!`);
});
