import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDFx1eTHhL1yZ18j1h2VkTO7tsU5KlcvM",
  authDomain: "nutricalc-98ed3.firebaseapp.com",
  projectId: "nutricalc-98ed3",
  storageBucket: "nutricalc-98ed3.firebasestorage.app",
  messagingSenderId: "516315990176",
  appId: "1:516315990176:web:cb0ea4a989df6736f4e1c5",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
