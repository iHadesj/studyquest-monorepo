import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-keys';

const app = initializeApp(firebaseConfig);

// Exporta os serviços do Firebase que vamos usar
export const auth = getAuth(app);
export const db = getFirestore(app);
