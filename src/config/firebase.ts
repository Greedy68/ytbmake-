import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration - update via environment variables for production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForMidasApp123456789",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ymm-academy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ymm-academy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ymm-academy.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456789"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;
