// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 REPLACE THESE WITH YOUR OWN FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDbzlVPocyVLCrc9eA-57hoLCv81SsSv1Q",
  authDomain: "it-quiz-game-49bb9.firebaseapp.com",
  projectId: "it-quiz-game-49bb9",
  storageBucket: "it-quiz-game-49bb9.firebasestorage.app",
  messagingSenderId: "699572416202",
  appId: "1:699572416202:web:650ed549b32569332b4e33"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
