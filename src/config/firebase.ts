import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// CORREÇÃO: Usando `import.meta.env` para aceder às variáveis de ambiente do Vite
const firebaseConfig = {
  apiKey: 'AIzaSyBv8eIrGZW6Mc-kfoegkuRc_bSdcH6nUiI',
  authDomain: 'studyquest-app.firebaseapp.com',
  projectId: 'studyquest-app',
  storageBucket: 'studyquest-app.firebasestorage.app',
  messagingSenderId: '287105047992',
  appId: '1:287105047992:web:8cfe6a64a30525bcd9434d',
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços do Firebase que vamos usar
export const auth = getAuth(app);
export const db = getFirestore(app);
