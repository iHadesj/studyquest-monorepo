// src/services/api.ts
import axios from 'axios';

const API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://studyquest-monorepo.onrender.com'
    : 'http://localhost:3333';

export const api = axios.create({
  baseURL: API_URL,
});
