import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCjQZ01flinJneim2hNFUYnahxVZj2JCJo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aleyna-portfolio.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aleyna-portfolio",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aleyna-portfolio.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "721544647190",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:721544647190:web:e89514f5de9c4500fa1b37",
};

// Uygulama birden fazla kez initialize edilmesin
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
