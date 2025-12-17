// main.js
import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const spinnerEl = document.getElementById("spinner");
const spinBtn = document.getElementById("spinBtn");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");

let questions = [];
let currentQuestionIndex = 0;
let currentScore = 0;
let answerTimer;
let suspenseTimer;

const categories = ["Programming","Networking","Hardware","Cybersecurity","Databases"];

// Spinner button
spinBtn.addEventListener("click", () => {
  let i = 0;
  const spinInterval = setInterval(() => {
    spinnerEl.textContent = categories[i % categories.length];
    i++;
  }, 100);

  setTimeout(async () => {
    clearInterval(spinInterval);
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    spinnerEl.textContent = "Selected: " + selectedCategory;
    await loadCategoryQuestions(selectedCategory);
  }, 2000);
});

// Load questions from Firebase
async function loadCategoryQuestions(category) {
  const snapshot = await getDocs(collection(db, `categories/${category}/questions`));
  questions = [];
  snapshot.forEach(doc => questions.push(doc.data()));
  currentQuestionIndex = 0;
  currentScore = 0;
  scoreEl.textContent = `Score: ${currentScore}`;
  showQuestion();
}

// Show question
function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    questionEl.textContent = "🎉 Quiz Finished!";
    choicesEl.innerHTML = "";
    timerEl.textContent = "";
    return;
  }

  const q = questions[currentQuestionIndex];
  questionEl.textContent = q.question;
  choicesEl.innerHTML = "";

  q.choices.forEach((choice, i) => {
    const div = document.createElement("div");
    div.textContent = String.fromCharCode(65 + i) + ": " + choice; // A, B, C, D
    div.className = "choice";
    div.id = String.fromCharCode(65 + i);
    choicesEl.appendChild(div);

    // Add click listener (simulate ESP32 button)
    div.addEventListener("click", () => selectAnswer(div.id));
  });

  startAnswerTimer();
}

// 10s timer to answer
function startAnswerTimer() {
  let time = 10;
  timerEl.textContent = `Time left: ${time}s`;
  clearInterval(answerTimer);
  answerTimer = setInterval(() => {
    time--;
    timerEl.textContent = `Time left: ${time}s`;
    if (time <= 0) {
      clearInterval(answerTimer);
      selectAnswer(null); // no answer selected
    }
  }, 1000);
}

// Handle answer selection
function selectAnswer(selected) {
  clearInterval(answerTimer);

  const q = questions[currentQuestionIndex];

  // Highlight selected choice
  if (selected) {
    document.getElementById(selected).classList.add("highlight");
  }

  // 5s suspense before showing correct/incorrect
  let suspense = 5;
  suspenseTimer = setInterval(() => {
    suspense--;
    timerEl.textContent = `Revealing answer in: ${suspense}s`;
    if (suspense <= 0) {
      clearInterval(suspenseTimer);
      revealAnswer(selected, q.answer);
    }
  }, 1000);
}

// Reveal answer
function revealAnswer(selected, correct) {
  // Flash background
  if (selected === correct) {
    document.body.style.backgroundColor = "green";
    currentScore++;
  } else {
    document.body.style.backgroundColor = "red";
  }

  scoreEl.textContent = `Score: ${currentScore}`;

  // Highlight correct answer
  if (correct) {
    const correctDiv = document.getElementById(correct);
    if (correctDiv) correctDiv.style.border = "3px solid gold";
  }

  setTimeout(() => {
    document.body.style.backgroundColor = "white";
    currentQuestionIndex++;
    showQuestion();
  }, 1500);
}
