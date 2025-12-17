import { db } from "./firebase.js";
import {
  doc, setDoc, getDoc,
  collection, query, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// UI
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const leaderboardEl = document.getElementById("leaderboard");

// ESP32 WebSocket
const ws = new WebSocket("ws://YOUR_ESP32_IP:81");

let playerName = "UNKNOWN";
let score = 0;
let totalTime = 0;
let timerInterval;

// Receive ESP32 data
ws.onmessage = (e) => {
  if (e.data.startsWith("PLAYER:")) {
    playerName = e.data.replace("PLAYER:", "");
  } else {
    selectAnswer(e.data);
  }
};

// SAMPLE QUESTIONS (already from Firebase in your system)
let currentQuestion = {
  question: "What does CPU stand for?",
  choices: ["Central Process Unit", "Central Processing Unit", "Computer Power Unit", "Control Processing Unit"],
  answer: "B"
};

showQuestion();

// Show question
function showQuestion() {
  questionEl.textContent = currentQuestion.question;
  choicesEl.innerHTML = "";

  currentQuestion.choices.forEach((c, i) => {
    const d = document.createElement("div");
    d.textContent = String.fromCharCode(65+i)+". "+c;
    d.className = "choice";
    d.onclick = () => selectAnswer(String.fromCharCode(65+i));
    choicesEl.appendChild(d);
  });

  startTimer();
}

// 10 sec answer timer
function startTimer() {
  let time = 10;
  timerEl.textContent = "Time: "+time;
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    time--;
    totalTime++;
    timerEl.textContent = "Time: "+time;
    if (time <= 0) {
      clearInterval(timerInterval);
      reveal(false);
    }
  },1000);
}

// Select answer
function selectAnswer(letter) {
  clearInterval(timerInterval);
  reveal(letter === currentQuestion.answer);
}

// Reveal result
function reveal(correct) {
  if (correct) {
    document.body.style.background = "green";
    score++;
    ws.send("GREEN");
  } else {
    document.body.style.background = "red";
    ws.send("RED");
  }

  scoreEl.textContent = "Score: "+score;

  setTimeout(() => {
    document.body.style.background = "white";
    saveScore();
  },1500);
}

// SAVE SCORE (NO DUPLICATES)
async function saveScore() {
  const ref = doc(db, "leaderboard", playerName);
  const snap = await getDoc(ref);

  if (!snap.exists() ||
     snap.data().score < score ||
     (snap.data().score === score && snap.data().time > totalTime)) {

    await setDoc(ref, {
      name: playerName,
      score: score,
      time: totalTime,
      updatedAt: new Date()
    });
  }

  loadLeaderboard();
}

// LOAD LEADERBOARD
async function loadLeaderboard() {
  leaderboardEl.innerHTML = "";

  const q = query(
    collection(db, "leaderboard"),
    orderBy("score","desc"),
    orderBy("time","asc"),
    limit(10)
  );

  const snap = await getDocs(q);
  let rank = 1;

  snap.forEach(doc => {
    let medal = rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":"";
    const d = doc.data();
    const li = document.createElement("li");
    li.textContent = `${medal} ${d.name} - ${d.score} pts (${d.time}s)`;
    leaderboardEl.appendChild(li);
    rank++;
  });
}
