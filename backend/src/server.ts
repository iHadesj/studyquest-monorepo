// backend/src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
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

// --- NOSSO "CADERNINHO" DE JOGADORES ONLINE ---
// Mapeia fullTag -> socket.id
const onlineUsers = new Map<string, string>();

// --- LÓGICA DO WEBSOCKET AQUI ---
io.on("connection", (socket) => {
  console.log("✅ Novo jogador conectado! ID:", socket.id);

  // 1. OUVINTE PARA REGISTRAR O JOGADOR
  socket.on("register", (fullTag: string) => {
    console.log(`Registrando jogador: ${fullTag} com o ID: ${socket.id}`);
    onlineUsers.set(fullTag, socket.id); // Adiciona no "caderninho"
  });

  // 2. OUVINTE PARA RECEBER O CONVITE
  socket.on("invite_player", ({ inviteeTag }: { inviteeTag: string }) => {
    // Quem está convidando?
    let inviterTag = "";
    // Procura no "caderninho" qual tag pertence a este socket.id
    for (const [tag, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        inviterTag = tag;
        break;
      }
    }

    console.log(`${inviterTag} está convidando ${inviteeTag}`);

    // O jogador convidado está online?
    const inviteeSocketId = onlineUsers.get(inviteeTag);
    if (inviteeSocketId) {
      console.log(`Jogador ${inviteeTag} encontrado. Enviando convite...`);
      // Envia um evento SÓ para o jogador convidado
      io.to(inviteeSocketId).emit("incoming_invite", { from: inviterTag });
    } else {
      console.log(`Jogador ${inviteeTag} não encontrado ou offline.`);
      // Avisa o cara que convidou que não deu bom
      socket.emit("invite_error", {
        message: `Jogador ${inviteeTag} não encontrado ou está offline.`,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Jogador desconectou. ID:", socket.id);
    // Remove o jogador do "caderninho" quando ele desconecta
    for (const [tag, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(tag);
        console.log(`Jogador ${tag} removido dos online.`);
        break;
      }
    }
  });
});

app.use(cors());
app.use(express.json());
app.use(routes);

const PORT = process.env.PORT || 3333;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}. Let's bora!`);
});
