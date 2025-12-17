import { db } from "./firebase.js";
import {
  doc,
  onSnapshot,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");

let score = 0;
let currentAnswer = "B"; // sample correct answer

const controlRef = doc(db, "game", "control");

// 🔥 LISTEN TO ESP32
onSnapshot(controlRef, (snap) => {
  if (!snap.exists()) return;

  const data = snap.data();
  if (data.button) {
    selectAnswer(data.button);
    updateDoc(controlRef, { button: "" });
  }
});

// SHOW QUESTION
questionEl.textContent = "What does CPU stand for?";
choicesEl.innerHTML = `
  <div class="choice">A. Central Process Unit</div>
  <div class="choice">B. Central Processing Unit</div>
  <div class="choice">C. Computer Power Unit</div>
  <div class="choice">D. Control Processing Unit</div>
`;
scoreEl.textContent = "Score: 0";

// ANSWER LOGIC
function selectAnswer(btn) {
  if (btn === currentAnswer) {
    document.body.style.background = "green";
    score++;
    updateDoc(controlRef, { result: "GREEN" });
  } else {
    document.body.style.background = "red";
    updateDoc(controlRef, { result: "RED" });
  }

  scoreEl.textContent = "Score: " + score;

  setTimeout(() => {
    document.body.style.background = "white";
  }, 1000);
}
