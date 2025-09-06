// backend/src/server.ts
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

// --- GERENCIAMENTO DE ESTADO DO SERVIDOR ---

// "Caderninho" de jogadores online: Mapeia fullTag -> socket.id
const onlineUsers = new Map<string, string>();

// Interface para definir a estrutura de uma sala de jogo
interface GameRoom {
  players: { tag: string; score: number }[];
  currentQuestion: Exercicio | null;
  questionInterval: NodeJS.Timeout | null;
}
// "Caderninho" das salas de jogo ativas: Mapeia roomId -> GameRoom
const gameRooms = new Map<string, GameRoom>();

const QUESTION_TIME_LIMIT = 15;

const sendNextQuestion = (roomId: string) => {
  const room = gameRooms.get(roomId);
  if (!room) return;

  // Limpa o cronômetro anterior, se existir
  if (room.questionInterval) {
    clearInterval(room.questionInterval);
  }

  const nextQuestion = getRandomQuestion();
  if (nextQuestion) {
    room.currentQuestion = nextQuestion;
    const { respostaCorreta, ...questionForPlayers } = nextQuestion;
    io.to(roomId).emit("new_question", questionForPlayers);
    console.log(`Enviando nova pergunta para a sala ${roomId}`);

    // --- LÓGICA DO CRONÔMETRO ---
    let timeLeft = QUESTION_TIME_LIMIT;
    room.questionInterval = setInterval(() => {
      io.to(roomId).emit("timer_tick", { timeLeft });
      timeLeft--;

      if (timeLeft < 0) {
        clearInterval(room.questionInterval!);
        io.to(roomId).emit("answer_result", {
          playerTag: "O TEMPO",
          isCorrect: false, // Ninguém acertou
        });
        io.to(roomId).emit("update_score", room.players); // Reenvia o placar
        // Manda a próxima pergunta depois de um tempinho
        setTimeout(() => sendNextQuestion(roomId), 3000);
      }
    }, 1000); // A cada 1 segundo
  } else {
    io.to(roomId).emit("game_over", { finalScores: room.players });
    gameRooms.delete(roomId);
  }
};

// --- LÓGICA PRINCIPAL DO WEBSOCKET ---
io.on("connection", (socket) => {
  console.log("✅ Novo jogador conectado! ID:", socket.id);

  // OUVINTE PARA REGISTRAR O JOGADOR QUANDO ELE CONECTA
  socket.on("register", (fullTag: string) => {
    console.log(`Registrando jogador: ${fullTag} com o ID: ${socket.id}`);
    onlineUsers.set(fullTag, socket.id);
  });

  // OUVINTE PARA QUANDO UM JOGADOR CONVIDA OUTRO
  socket.on("invite_player", ({ inviteeTag }: { inviteeTag: string }) => {
    let inviterTag = "";
    for (const [tag, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        inviterTag = tag;
        break;
      }
    }

    console.log(`${inviterTag} está convidando ${inviteeTag}`);
    const inviteeSocketId = onlineUsers.get(inviteeTag);

    if (inviteeSocketId) {
      console.log(`Jogador ${inviteeTag} encontrado. Enviando convite...`);
      io.to(inviteeSocketId).emit("incoming_invite", { from: inviterTag });
    } else {
      console.log(`Jogador ${inviteeTag} não encontrado ou offline.`);
      socket.emit("invite_error", {
        message: `Jogador ${inviteeTag} não encontrado ou está offline.`,
      });
    }
  });

  // OUVINTE PARA A RESPOSTA DE UM CONVITE
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
        console.log(`${inviteeTag} ACEITOU o convite de ${inviterTag}.`);
        const roomId = `game-${inviterSocketId}-${socket.id}`;

        gameRooms.set(roomId, {
          players: [
            { tag: inviterTag, score: 0 },
            { tag: inviteeTag, score: 0 },
          ],
          currentQuestion: null,
          questionInterval: null,
        });

        socket.join(roomId);
        io.sockets.sockets.get(inviterSocketId)?.join(roomId);
        console.log(
          `Sala ${roomId} criada para ${inviterTag} e ${inviteeTag}.`
        );

        io.to(roomId).emit("game_started", {
          roomId,
          players: gameRooms.get(roomId)?.players,
        });

        const firstQuestion = getRandomQuestion();
        if (firstQuestion) {
          gameRooms.get(roomId)!.currentQuestion = firstQuestion;
          setTimeout(() => {
            const { respostaCorreta, ...questionForPlayers } = firstQuestion;
            io.to(roomId).emit("new_question", questionForPlayers);
            console.log(`Enviando a primeira pergunta para a sala ${roomId}`);
          }, 3000);
        }
      } else {
        console.log(`${inviteeTag} RECUSOU o convite de ${inviterTag}.`);
        io.to(inviterSocketId).emit("invite_declined", { from: inviteeTag });
      }
    }
  );

  // OUVINTE PARA QUANDO UM JOGADOR ENVIA UMA RESPOSTA
  socket.on(
    "submit_answer",
    ({ roomId, answer }: { roomId: string; answer: string }) => {
      const room = gameRooms.get(roomId);
      if (!room || !room.currentQuestion) return;

      let timeLeft = 0;

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

      room.currentQuestion = null;
      const nextQuestion = getRandomQuestion();
      if (nextQuestion) {
        room.currentQuestion = nextQuestion;
        setTimeout(() => {
          const { respostaCorreta, ...questionForPlayers } = nextQuestion;
          io.to(roomId).emit("new_question", questionForPlayers);
        }, 3000);
      } else {
        io.to(roomId).emit("game_over", { finalScores: room.players });
        gameRooms.delete(roomId); // Limpa a sala
      }
      setTimeout(() => sendNextQuestion(roomId), 3000);
    }
  );

  // OUVINTE PARA QUANDO O JOGADOR DESCONECTA
  socket.on("disconnect", () => {
    console.log("❌ Jogador desconectou. ID:", socket.id);
    for (const [tag, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(tag);
        console.log(`Jogador ${tag} removido dos online.`);
        // Aqui também teríamos que avisar o oponente se ele estivesse em um jogo
        break;
      }
    }
  });
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}. Let's bora!`);
});
