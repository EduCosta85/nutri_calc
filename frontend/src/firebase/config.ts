import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase Configuration
 * 
 * Required environment variables (create frontend/.env.local with these):
 * - VITE_FIREBASE_API_KEY: Your Firebase API key
 * - VITE_FIREBASE_AUTH_DOMAIN: your-project.firebaseapp.com
 * - VITE_FIREBASE_PROJECT_ID: your-project-id
 * - VITE_FIREBASE_STORAGE_BUCKET: your-project.appspot.com
 * - VITE_FIREBASE_MESSAGING_SENDER_ID: Your messaging sender ID
 * - VITE_FIREBASE_APP_ID: Your app ID
 * 
 * Get these from: Firebase Console > Project Settings > General > Your apps
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
