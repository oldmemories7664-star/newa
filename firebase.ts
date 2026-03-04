
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCC00QsEZIPn8QgmapxYsK1ckSfIDyYbb0",
  authDomain: "prompt-ai-f8a81.firebaseapp.com",
  databaseURL: "https://prompt-ai-f8a81-default-rtdb.firebaseio.com",
  projectId: "prompt-ai-f8a81",
  storageBucket: "prompt-ai-f8a81.firebasestorage.app",
  messagingSenderId: "925858662846",
  appId: "1:925858662846:web:a875c64fc46a6cec2551ef",
  measurementId: "G-TTW2VGL52K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// API Key is exclusively retrieved from process.env.API_KEY in service calls.
