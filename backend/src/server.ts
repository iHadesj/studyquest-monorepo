// server.ts (agora sim, completo e com tudo funcionando)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { getRandomQuestion } from "./GameManager";
import { Exercicio } from "./interfaces";
import routes from "./routes/index";

import * as admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";
import exerciseRoutes from "./routes/exerciseRoutes";

dotenv.config();

const allowedOrigins: string[] = [
  "http://localhost:5173",
  "https://go-studyquest.vercel.app",
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

console.log("Origens permitidas (CORS):", allowedOrigins);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
});
const db = admin.firestore();
console.log("🔥 Conectado ao Firestore com sucesso!");

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(routes);
app.use("/api/exercises", exerciseRoutes);

const onlineUsers = new Map<string, string>();
const userTagsToUids = new Map<string, string>();
const friendSubscriptions = new Map<string, Set<string>>();

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

const normalizeAnswer = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
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

  let currentUserTag: string | null = null;
  let currentUserId: string | null = null;

  const notifySubscribers = (tag: string, status: "online" | "offline") => {
    const subscribers = friendSubscriptions.get(tag);
    if (subscribers) {
      subscribers.forEach((subscriberTag) => {
        const subscriberSocketId = onlineUsers.get(subscriberTag);
        if (subscriberSocketId) {
          io.to(subscriberSocketId).emit("friend_status_update", {
            tag,
            status,
          });
        }
      });
    }
  };

  socket.on(
    "register",
    ({ fullTag, uid }: { fullTag: string; uid: string }) => {
      onlineUsers.set(fullTag, socket.id);
      userTagsToUids.set(fullTag, uid);
      currentUserTag = fullTag;
      currentUserId = uid;
      console.log(
        `Jogador ${fullTag} (UID: ${uid}) registrado com o socket ID ${socket.id}`
      );
      notifySubscribers(fullTag, "online");
    }
  );

  socket.on(
    "subscribe_to_friends_status",
    ({ friendTags }: { friendTags: string[] }) => {
      if (!currentUserTag || !Array.isArray(friendTags)) {
        console.error(
          `[SUBSCRIBE-ERROR] Tentativa de subscribe sem estar registrado. Socket: ${socket.id}`
        );
        return;
      }

      console.log(
        `[SUBSCRIBE-INFO] ${currentUserTag} está pedindo o status de:`,
        friendTags
      );

      console.log(
        "[SUBSCRIBE-INFO] Mapa de usuários online no momento:",
        Array.from(onlineUsers.keys())
      );

      friendTags.forEach((friendTag) => {
        if (!friendSubscriptions.has(friendTag)) {
          friendSubscriptions.set(friendTag, new Set());
        }
        friendSubscriptions.get(friendTag)?.add(currentUserTag!);
      });

      const initialOnlineFriends = friendTags.filter((tag) => {
        const isOnline = onlineUsers.has(tag);
        console.log(
          `[SUBSCRIBE-CHECK] Verificando se "${tag}" está online... Resultado: ${isOnline}`
        );
        return isOnline;
      });

      console.log(
        `[SUBSCRIBE-RESULT] Enviando para ${currentUserTag} a lista de amigos online:`,
        initialOnlineFriends
      );
      socket.emit("initial_friends_status", initialOnlineFriends);
    }
  );
  socket.on(
    "unsubscribe_from_friends_status",
    ({ friendTags }: { friendTags: string[] }) => {
      if (!currentUserTag || !Array.isArray(friendTags)) return;
      friendTags.forEach((friendTag) => {
        friendSubscriptions.get(friendTag)?.delete(currentUserTag!);
      });
    }
  );

  socket.on(
    "private_message",
    async ({
      recipientTag,
      messageText,
    }: {
      recipientTag: string;
      messageText: string;
    }) => {
      if (!currentUserTag || !currentUserId) return;
      let recipientUid: string | undefined = userTagsToUids.get(recipientTag);
      if (!recipientUid) {
        try {
          const usersRef = db.collection("users");
          const q = await usersRef
            .where("fullTag", "==", recipientTag)
            .limit(1)
            .get();
          if (!q.empty) {
            recipientUid = q?.docs[0]?.id;
          }
        } catch (e) {
          console.error("Erro ao buscar UID do destinatário offline:", e);
          return;
        }
      }
      if (!recipientUid) {
        console.log(
          `Erro: não foi possível encontrar o UID de ${recipientTag}.`
        );
        return;
      }
      const participants = [currentUserId, recipientUid].sort();
      const chatId = participants.join("_");
      const messageData = {
        senderId: currentUserId,
        text: messageText,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };
      try {
        const chatRef = db.collection("chats").doc(chatId);
        await chatRef.collection("messages").add(messageData);
        await chatRef.set(
          {
            participants,
            lastMessage: {
              text: messageText,
              timestamp: messageData.timestamp,
            },
          },
          { merge: true }
        );
        const recipientSocketId = onlineUsers.get(recipientTag);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("new_message", {
            ...messageData,
            id: "temp-id-" + Date.now(),
            chatId: chatId,
          });
        }
      } catch (error) {
        console.error("Erro ao salvar mensagem no Firestore:", error);
      }
    }
  );

  socket.on(
    "fetch_chat_history",
    async ({ friendUid }: { friendUid: string }) => {
      if (!currentUserId) return;
      const participants = [currentUserId, friendUid].sort();
      const chatId = participants.join("_");
      try {
        const messagesRef = db
          .collection("chats")
          .doc(chatId)
          .collection("messages");
        const q = await messagesRef
          .orderBy("timestamp", "desc")
          .limit(50)
          .get();
        const history = q.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .reverse();
        socket.emit("chat_history", { chatId, messages: history });
      } catch (error) {
        console.error(`Erro ao buscar histórico do chat ${chatId}:`, error);
      }
    }
  );

  socket.on("invite_player", ({ inviteeTag }: { inviteeTag: string }) => {
    const inviterTag = currentUserTag;
    if (!inviterTag) return;
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
      const inviteeTag = currentUserTag;
      if (!inviteeTag) return;
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
    }
    if (room.players.every((p) => p.ready)) {
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
    if (currentUserTag) {
      onlineUsers.delete(currentUserTag);
      userTagsToUids.delete(currentUserTag);
      notifySubscribers(currentUserTag, "offline");
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
      }
    }
  });
});

const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}. Let's bora!`);
});
