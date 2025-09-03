// src/services/socket.ts
import { io } from 'socket.io-client';

// O endereço do nosso servidor back-end
const URL = 'http://localhost:3333';

// Cria a instância do socket.
// O 'autoConnect: false' é importante pra gente ter controle
// de quando a conexão realmente começa.
export const socket = io(URL, {
  autoConnect: false,
});
