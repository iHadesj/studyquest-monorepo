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
  cors: {
    origin: "*", // LIBERA TUDO
    methods: ["GET", "POST"],
  },
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
  // Impede que um segundo "player_ready" crie um modeTimer paralelo, e que a
  // mesma partida seja encerrada duas vezes.
  started: boolean;
  finished: boolean;
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

// Resolve o uid a partir da tag: primeiro no cache em memória, depois no
// Firestore. Antes o cache só era preenchido no "register" e apagado no
// disconnect, então qualquer ação envolvendo alguém offline falhava calada.
const resolveUidByTag = async (tag: string): Promise<string | null> => {
  const cached = userTagsToUids.get(tag);
  if (cached) return cached;
  try {
    const snap = await db
      .collection("users")
      .where("fullTag", "==", tag)
      .limit(1)
      .get();
    const first = snap.docs[0];
    if (!first) return null;
    const uid = first.id;
    userTagsToUids.set(tag, uid);
    return uid;
  } catch (error) {
    console.error(`Erro ao resolver uid da tag ${tag}:`, error);
    return null;
  }
};

const grantXp = async (tag: string, amount: number) => {
  if (amount <= 0) return;
  const uid = await resolveUidByTag(tag);
  if (!uid) return;
  try {
    await db
      .collection("users")
      .doc(uid)
      .update({ xp: admin.firestore.FieldValue.increment(amount) });
    console.log(`+${amount} XP adicionado para ${tag}.`);
  } catch (error) {
    console.error(`Erro ao adicionar XP para ${tag}:`, error);
  }
};

// Encerra a sala e distribui o XP do duelo. Cada jogador leva o próprio placar
// como XP — antes o placar de uma partida normal era simplesmente descartado.
const finishGame = async (roomId: string) => {
  const room = gameRooms.get(roomId);
  if (!room || room.finished) return;
  room.finished = true;

  safeClearAllTimers(room);
  const finalScores = room.players.map((p) => ({ ...p }));
  io.to(roomId).emit("game_over", { finalScores });
  gameRooms.delete(roomId);

  await Promise.all(finalScores.map((p) => grantXp(p.tag, p.score)));
};

const endGameByDisconnection = async (
  roomId: string,
  disconnectedSocketId: string
) => {
  const room = gameRooms.get(roomId);
  if (!room || room.finished) return;
  room.finished = true;

  const remainingPlayer = room.players.find(
    (p) => p.socketId !== disconnectedSocketId
  );
  const disconnectedPlayer = room.players.find(
    (p) => p.socketId === disconnectedSocketId
  );

  safeClearAllTimers(room);
  gameRooms.delete(roomId);
  console.log(`Sala ${roomId} encerrada devido à desconexão/abandono.`);

  if (remainingPlayer) {
    io.to(remainingPlayer.socketId).emit("opponent_left", {
      message: `Seu oponente (${
        disconnectedPlayer?.tag || "Anônimo"
      }) desconectou.`,
      consolationXp: CONSOLATION_XP,
    });
    await grantXp(remainingPlayer.tag, CONSOLATION_XP + remainingPlayer.score);
  }
};

const sendNextQuestion = (roomId: string) => {
  const room = gameRooms.get(roomId);
  if (!room || room.finished) return;
  if (typeof room.modeTimeLeft === "number" && room.modeTimeLeft <= 0) {
    return;
  }
  if (room.questionTimer) clearInterval(room.questionTimer);

  const nextQuestion = getRandomQuestion();
  if (!nextQuestion) {
    void finishGame(roomId);
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
      room.questionTimer = null;
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
      if (!fullTag || !uid) return;
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

  // O front já emitia este evento ao fechar a lista de amigos, mas não havia
  // handler nenhum: as inscrições só cresciam, para sempre.
  socket.on(
    "unsubscribe_from_friends_status",
    ({ friendTags }: { friendTags: string[] }) => {
      if (!currentUserTag || !Array.isArray(friendTags)) return;
      friendTags.forEach((friendTag) => {
        const subscribers = friendSubscriptions.get(friendTag);
        if (!subscribers) return;
        subscribers.delete(currentUserTag!);
        if (subscribers.size === 0) friendSubscriptions.delete(friendTag);
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
      const text = typeof messageText === "string" ? messageText.trim() : "";
      if (!text) return;

      const recipientUid = await resolveUidByTag(recipientTag);
      if (!recipientUid) return;

      const participants = [currentUserId, recipientUid].sort();
      const chatId = participants.join("_");
      const messageData = {
        senderId: currentUserId,
        text,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };
      try {
        const chatRef = db.collection("chats").doc(chatId);
        await chatRef.collection("messages").add(messageData);
      } catch (error) {
        console.error("Erro ao salvar mensagem privada:", error);
      }
    }
  );

  socket.on("invite_player", ({ inviteeTag }: { inviteeTag: string }) => {
    const inviterTag = currentUserTag;
    if (!inviterTag || inviterTag === inviteeTag) return;
    const inviteeSocketId = onlineUsers.get(inviteeTag);
    if (inviteeSocketId) {
      io.to(inviteeSocketId).emit("incoming_invite", { from: inviterTag });
    }
  });

  socket.on(
    "invite_response",
    ({ inviterTag, accepted }: { inviterTag: string; accepted: boolean }) => {
      const inviteeTag = currentUserTag;
      if (!inviteeTag || !accepted) return;

      const inviterSocketId = onlineUsers.get(inviterTag);
      // O socket do convidante pode ter caído entre o convite e a resposta.
      // Sem esta checagem a sala nascia com um jogador que nunca entraria
      // nela, e o duelo travava esperando o "player_ready" dele.
      const inviterSocket = inviterSocketId
        ? io.sockets.sockets.get(inviterSocketId)
        : undefined;
      if (!inviterSocketId || !inviterSocket) {
        socket.emit("invite_failed", {
          message: "O jogador que te convidou não está mais disponível.",
        });
        return;
      }

      const roomId = `game-${uuidv4()}`;
      const players: Player[] = [
        { tag: inviterTag, score: 0, ready: false, socketId: inviterSocketId },
        { tag: inviteeTag, score: 0, ready: false, socketId: socket.id },
      ];
      gameRooms.set(roomId, {
        players,
        currentQuestion: null,
        questionTimer: null,
        questionStartTime: null,
        questionAnswered: true,
        started: false,
        finished: false,
      });
      socket.join(roomId);
      inviterSocket.join(roomId);
      io.to(roomId).emit("game_started", { roomId, players });
    }
  );

  socket.on("player_ready", ({ roomId }: { roomId: string }) => {
    const room = gameRooms.get(roomId);
    if (!room || room.finished) return;

    const player = room.players.find((p) => p.socketId === socket.id);
    if (player) player.ready = true;

    // Um "player_ready" repetido (re-render do lobby, reconexão) criava um
    // segundo modeTimer sem limpar o primeiro: o relógio da partida corria em
    // dobro e o game_over disparava duas vezes. Agora só re-sincroniza.
    if (room.started) {
      socket.emit("mode_started", {
        duration: room.modeTimeLeft ?? MODE_DURATION_S,
      });
      socket.emit("update_score", room.players);
      return;
    }
    if (!room.players.every((p) => p.ready)) return;

    room.started = true;
    room.modeTimeLeft = MODE_DURATION_S;
    io.to(roomId).emit("mode_started", { duration: MODE_DURATION_S });
    room.modeTimer = setInterval(() => {
      if (typeof room.modeTimeLeft !== "number") return;
      room.modeTimeLeft -= 1;
      io.to(roomId).emit("mode_tick", { timeLeft: room.modeTimeLeft });
      if (room.modeTimeLeft <= 0) {
        void finishGame(roomId);
      }
    }, 1000);
    sendNextQuestion(roomId);
  });

  socket.on(
    "submit_answer",
    ({ roomId, answer }: { roomId: string; answer: string }) => {
      const room = gameRooms.get(roomId);
      if (!room || room.finished || room.questionAnswered) return;

      const { currentQuestion, questionStartTime } = room;
      const player = room.players.find((p) => p.socketId === socket.id);
      // Estas validações precisam vir ANTES de marcar a rodada como
      // respondida. Saindo por um return depois disso, a pergunta ficava
      // travada para sempre e nenhuma próxima era agendada.
      if (!currentQuestion || !questionStartTime || !player) return;

      room.questionAnswered = true;
      if (room.questionTimer) clearInterval(room.questionTimer);
      room.questionTimer = null;

      const timeTakenMs = Date.now() - questionStartTime;
      const timeTakenS = Math.floor(timeTakenMs / 1000);

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
    void endGameByDisconnection(roomId, socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Jogador desconectou. ID:", socket.id);
    if (currentUserTag) {
      // Só limpa se este socket ainda for o dono da tag. Com duas abas abertas
      // (ou durante uma reconexão) o socket antigo derrubava o novo, e o
      // usuário aparecia offline mesmo estando conectado.
      if (onlineUsers.get(currentUserTag) === socket.id) {
        onlineUsers.delete(currentUserTag);
        notifySubscribers(currentUserTag, "offline");
      }
      // Remove as inscrições feitas por este usuário, senão o Map cresce
      // indefinidamente enquanto o servidor estiver de pé.
      for (const [tag, subscribers] of friendSubscriptions.entries()) {
        subscribers.delete(currentUserTag);
        if (subscribers.size === 0) friendSubscriptions.delete(tag);
      }
    }
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.some((p) => p.socketId === socket.id)) {
        void endGameByDisconnection(roomId, socket.id);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}. Let's bora!`);
});
