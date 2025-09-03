import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBv8eIrGZW6Mc-kfoegkuRc_bSdcH6nUiI',
  authDomain: 'studyquest-app.firebaseapp.com',
  projectId: 'studyquest-app',
  storageBucket: 'studyquest-app.firebasestorage.app',
  messagingSenderId: '287105047992',
  appId: '1:287105047992:web:8cfe6a64a30525bcd9434d',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
