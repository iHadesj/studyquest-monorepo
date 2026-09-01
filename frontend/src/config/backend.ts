// Fonte única da URL do backend.
//
// Antes cada arquivo resolvia isso do seu jeito: api.ts usava
// process.env.NODE_ENV (que não existe no browser sob o Vite) e socket.ts
// usava só VITE_BACKEND_URL com fallback pra localhost. Sem a env definida na
// Vercel, o app publicado abria WebSocket contra localhost:3333.

const PRODUCTION_URL = 'https://studyquest-monorepo.onrender.com';
const LOCAL_URL = 'http://localhost:3333';

const fromEnv = import.meta.env.VITE_BACKEND_URL?.trim();

export const BACKEND_URL =
  fromEnv || (import.meta.env.DEV ? LOCAL_URL : PRODUCTION_URL);
