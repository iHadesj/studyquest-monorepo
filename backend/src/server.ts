import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
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

const onlineUsers = new Map<string, string>();

interface GameRoom {
  players: { tag: string; score: number; ready: boolean }[];
  currentQuestion: Exercicio | null;
  questionTimer: NodeJS.Timeout | null;
  questionStartTime: number | null;
  questionAnswered: boolean; // <<< MUDANÇA 1: Nosso novo cadeado de segurança
}
const gameRooms = new Map<string, GameRoom>();

const QUESTION_TIME_LIMIT_S = 15;
const NEXT_QUESTION_DELAY_MS = 3000;
const BASE_SCORE = 50;
const TIME_BONUS_MULTIPLIER = 10;

const sendNextQuestion = (roomId: string) => {
  const room = gameRooms.get(roomId);
  if (!room) return;

  if (room.questionTimer) {
    clearInterval(room.questionTimer);
  }

  const nextQuestion = getRandomQuestion();
  if (nextQuestion) {
    room.currentQuestion = nextQuestion;
    room.questionStartTime = Date.now();
    room.questionAnswered = false; // <<< MUDANÇA 2: Destranca o cadeado para a nova rodada
    const { respostaCorreta, ...questionForPlayers } = nextQuestion;

    io.to(roomId).emit("new_question", questionForPlayers);
    console.log(`Enviando nova pergunta para a sala ${roomId}`);

    let timeLeft = QUESTION_TIME_LIMIT_S;
    io.to(roomId).emit("timer_tick", { timeLeft });

    room.questionTimer = setInterval(() => {
      timeLeft -= 1;
      io.to(roomId).emit("timer_tick", { timeLeft });

      if (timeLeft <= 0) {
        clearInterval(room.questionTimer!);

        // Só emite o resultado de tempo esgotado se a pergunta não tiver sido respondida ainda
        if (!room.questionAnswered) {
          room.questionAnswered = true; // Tranca pra evitar qualquer outra resposta
          io.to(roomId).emit("answer_result", {
            playerTag: "O TEMPO",
            isCorrect: false,
          });
          // Espera um pouco e manda a próxima pergunta
          setTimeout(() => sendNextQuestion(roomId), NEXT_QUESTION_DELAY_MS);
        }
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
          questionTimer: null,
          questionStartTime: null,
          questionAnswered: true, // <<< MUDANÇA 3: Começa trancado até a primeira pergunta ser enviada
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

      // <<< MUDANÇA 4: A NOVA LÓGICA DE TRAVA ANTI-RACE CONDITION >>>
      // Se a sala não existe ou a pergunta JÁ FOI RESPONDIDA, ignora.
      if (!room || room.questionAnswered) {
        return;
      }
      // Se a checagem passou, a primeira coisa que a gente faz é TRANCAR A PORTA.
      room.questionAnswered = true;

      // Agora a lógica do jogo pode rodar segura
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

      // Inicia o ciclo para a próxima pergunta (só o primeiro que respondeu vai chegar aqui)
      setTimeout(() => sendNextQuestion(roomId), NEXT_QUESTION_DELAY_MS);
    }
  );

  socket.on("disconnect", () => {
    console.log("❌ Jogador desconectou. ID:", socket.id);
    for (const [tag, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(tag);
        console.log(`Jogador ${tag} removido dos online.`);
        // Futuramente: Adicionar lógica para encerrar a sala se um jogador desconectar no meio da partida.
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}. Let's bora!`);
});
