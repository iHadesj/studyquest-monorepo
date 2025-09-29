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
import subjectRoutes from "./routes/subjectRoutes";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://go-studyquest.vercel.app",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Não permitido pelo CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

const io = new Server(httpServer, {
  cors: corsOptions,
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
});
const db = admin.firestore();
console.log("🔥 Conectado ao Firestore com sucesso!");

app.use(express.json());
app.use(routes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/subjects", subjectRoutes);

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
const NEXT_QUESTION_DELAY_MS = 1500;
const BASE_SCORE = 50;
const TIME_BONUS_MULTIPLIER = 10;
const MODE_DURATION_S = 60;
const CONSOLATION_XP = 50;

const normalizeAnswer = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const safeClearAllTimers = (room: GameRoom) => {
  if (room.questionTimer) clearInterval(room.questionTimer);
  if (room.modeTimer) clearInterval(room.modeTimer);
  if (room.nextQuestionTimeout) clearTimeout(room.nextQuestionTimeout);
  room.questionTimer = null;
  room.modeTimer = null;
  room.nextQuestionTimeout = null;
};

const endGameByDisconnection = async (
  roomId: string,
  disconnectedSocketId: string
) => {
  const room = gameRooms.get(roomId);
  if (!room) return;

  const remainingPlayer = room.players.find(
    (p) => p.socketId !== disconnectedSocketId
  );
  const disconnectedPlayer = room.players.find(
    (p) => p.socketId === disconnectedSocketId
  );

  if (remainingPlayer) {
    io.to(remainingPlayer.socketId).emit("opponent_left", {
      message: `Seu oponente (${
        disconnectedPlayer?.tag || "Anônimo"
      }) desconectou.`,
      consolationXp: CONSOLATION_XP,
    });

    const winnerUid = userTagsToUids.get(remainingPlayer.tag);
    if (winnerUid) {
      try {
        const userDocRef = db.collection("users").doc(winnerUid);
        await userDocRef.update({
          xp: admin.firestore.FieldValue.increment(CONSOLATION_XP),
        });
        console.log(
          `+${CONSOLATION_XP} XP adicionado para ${remainingPlayer.tag} por W.O.`
        );
      } catch (error) {
        console.error("Erro ao adicionar XP de consolação:", error);
      }
    }
  }

  safeClearAllTimers(room);
  gameRooms.delete(roomId);
  console.log(`Sala ${roomId} encerrada devido à desconexão/abandono.`);
};

const sendNextQuestion = (roomId: string) => {
  const room = gameRooms.get(roomId);
  if (!room) return;
  if (typeof room.modeTimeLeft === "number" && room.modeTimeLeft <= 0) {
    return;
  }
  if (room.questionTimer) clearInterval(room.questionTimer);

  const nextQuestion = getRandomQuestion();
  if (!nextQuestion) {
    safeClearAllTimers(room);
    io.to(roomId).emit("game_over", { finalScores: room.players });
    gameRooms.delete(roomId);
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
      if (room.questionTimer) clearInterval(room.questionTimer);
      if (!room.questionAnswered) {
        room.questionAnswered = true;
        io.to(roomId).emit("answer_result", {
          playerTag: "O TEMPO",
          isCorrect: false,
        });
        room.nextQuestionTimeout = setTimeout(() => {
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
      notifySubscribers(fullTag, "online");
    }
  );

  socket.on(
    "subscribe_to_friends_status",
    ({ friendTags }: { friendTags: string[] }) => {
      if (!currentUserTag || !Array.isArray(friendTags)) return;
      friendTags.forEach((friendTag) => {
        if (!friendSubscriptions.has(friendTag)) {
          friendSubscriptions.set(friendTag, new Set());
        }
        friendSubscriptions.get(friendTag)?.add(currentUserTag!);
      });
      const initialOnlineFriends = friendTags.filter((tag) =>
        onlineUsers.has(tag)
      );
      socket.emit("initial_friends_status", initialOnlineFriends);
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
      const recipientUid = userTagsToUids.get(recipientTag);
      if (!recipientUid) return;

      const participants = [currentUserId, recipientUid].sort();
      const chatId = participants.join("_");
      const messageData = {
        senderId: currentUserId,
        text: messageText,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };
      const chatRef = db.collection("chats").doc(chatId);
      await chatRef.collection("messages").add(messageData);
    }
  );

  socket.on("invite_player", ({ inviteeTag }: { inviteeTag: string }) => {
    const inviterTag = currentUserTag;
    if (!inviterTag) return;
    const inviteeSocketId = onlineUsers.get(inviteeTag);
    if (inviteeSocketId) {
      io.to(inviteeSocketId).emit("incoming_invite", { from: inviterTag });
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
        });
        socket.join(roomId);
        io.sockets.sockets.get(inviterSocketId)?.join(roomId);
        io.to(roomId).emit("game_started", { roomId, players });
      }
    }
  );

  socket.on("player_ready", ({ roomId }: { roomId: string }) => {
    const room = gameRooms.get(roomId);
    if (!room) return;
    const player = room.players.find((p) => p.socketId === socket.id);
    if (player) player.ready = true;

    if (room.players.every((p) => p.ready)) {
      room.modeTimeLeft = MODE_DURATION_S;
      io.to(roomId).emit("mode_started", { duration: MODE_DURATION_S });
      room.modeTimer = setInterval(() => {
        if (room.modeTimeLeft === undefined) return;
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
      if (room.questionTimer) clearInterval(room.questionTimer);

      const { currentQuestion, questionStartTime } = room;
      if (!currentQuestion || !questionStartTime) return;

      const timeTakenMs = Date.now() - questionStartTime;
      const timeTakenS = Math.floor(timeTakenMs / 1000);
      const player = room.players.find((p) => p.socketId === socket.id);
      if (!player) return;

      const isCorrect =
        normalizeAnswer(currentQuestion.respostaCorreta) ===
        normalizeAnswer(answer || "");
      if (isCorrect) {
        const timeLeft = Math.max(0, QUESTION_TIME_LIMIT_S - timeTakenS);
        const timeBonus = timeLeft * TIME_BONUS_MULTIPLIER;
        player.score += BASE_SCORE + timeBonus;
      }

      io.to(roomId).emit("answer_result", { playerTag: player.tag, isCorrect });
      io.to(roomId).emit("update_score", room.players);

      if (room.nextQuestionTimeout) clearTimeout(room.nextQuestionTimeout);
      room.nextQuestionTimeout = setTimeout(
        () => sendNextQuestion(roomId),
        NEXT_QUESTION_DELAY_MS
      );
    }
  );

  socket.on("leave_game", ({ roomId }: { roomId: string }) => {
    endGameByDisconnection(roomId, socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Jogador desconectou. ID:", socket.id);
    if (currentUserTag) {
      onlineUsers.delete(currentUserTag);
      userTagsToUids.delete(currentUserTag);
      notifySubscribers(currentUserTag, "offline");
    }
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.some((p) => p.socketId === socket.id)) {
        endGameByDisconnection(roomId, socket.id);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}. Let's bora!`);
});
