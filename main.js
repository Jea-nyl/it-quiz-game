import { db } from "./firebase.js";
import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const categoryEl = document.getElementById("category");
const counterEl = document.getElementById("counter");

const controlRef = doc(db, "game", "control");

let score = 0;
let canAnswer = false;
let currentAnswer = "";
let questionNumber = 0;
const TOTAL_QUESTIONS = 10;

let answerTimer;
let suspenseTimer;

const categories = ["Programming","Networking","Hardware","Cybersecurity","Databases"];

const questions = {
  Programming: {
    q: "What does CPU stand for?",
    choices: ["Central Process Unit","Central Processing Unit","Computer Power Unit","Control Processing Unit"],
    answer: "B"
  },
  Networking: {
    q: "Which device connects networks?",
    choices: ["Router","RAM","CPU","SSD"],
    answer: "A"
  },
  Hardware: {
    q: "Which stores data permanently?",
    choices: ["RAM","Cache","SSD","Register"],
    answer: "C"
  },
  Cybersecurity: {
    q: "What protects a system from hackers?",
    choices: ["Firewall","Monitor","Keyboard","Speaker"],
    answer: "A"
  },
  Databases: {
    q: "SQL is mainly used for?",
    choices: ["Gaming","Drawing","Data storage","Animation"],
    answer: "C"
  }
};

// 🔊 Play category sound
function playCategorySound(cat){
  const audio = document.getElementById("sound-" + cat);
  if(audio){ audio.currentTime = 0; audio.play();}
}

// 🎯 Spin category
function spinCategory(){
  if(questionNumber >= TOTAL_QUESTIONS){ showFinalScreen(); return; }

  canAnswer = false;
  questionNumber++;
  counterEl.textContent = `Question ${questionNumber} / ${TOTAL_QUESTIONS}`;

  let i = 0;
  const spin = setInterval(()=>{
    categoryEl.textContent = "🎯 " + categories[i % categories.length];
    i++;
  }, 100);

  setTimeout(()=>{
    clearInterval(spin);
    const cat = categories[Math.floor(Math.random()*categories.length)];
    categoryEl.textContent = "Category: " + cat;
    playCategorySound(cat);
    loadQuestion(cat);
  }, 2000);
}

// Load question
function loadQuestion(cat){
  const q = questions[cat];
  currentAnswer = q.answer;
  questionEl.textContent = q.q;
  choicesEl.innerHTML = "";
  q.choices.forEach((c,i)=>{
    const d = document.createElement("div");
    d.className = "choice";
    d.textContent = String.fromCharCode(65+i)+". "+c;
    choicesEl.appendChild(d);
  });
  startAnswerTimer();
}

// 10s timer
function startAnswerTimer(){
  let time = 10;
  canAnswer = true;
  timerEl.textContent = "⏱️ "+time;
  clearInterval(answerTimer);
  answerTimer = setInterval(()=>{
    time--;
    timerEl.textContent = "⏱️ "+time;
    if(time <= 0){
      clearInterval(answerTimer);
      reveal(false);
    }
  },1000);
}

// Listen to ESP32 buttons
onSnapshot(controlRef, snap=>{
  if(!snap.exists()) return;
  const data = snap.data();
  if(data.button && canAnswer){
    canAnswer=false;
    updateDoc(controlRef,{button:""});
    reveal(data.button===currentAnswer);
  }
});

// Reveal answer + suspense
function reveal(correct){
  clearInterval(answerTimer);
  let suspense = 5;
  suspenseTimer = setInterval(()=>{
    timerEl.textContent="⏳ "+suspense;
    suspense--;
    if(suspense<0){
      clearInterval(suspenseTimer);
      if(correct){
        document.body.style.background="#2ecc71";
        score++;
        updateDoc(controlRef,{result:"GREEN"});
      } else {
        document.body.style.background="#e74c3c";
        updateDoc(controlRef,{result:"RED"});
      }
      scoreEl.textContent="Score: "+score;
      setTimeout(()=>{
        document.body.style.background="#ffffff";
        spinCategory();
      },1200);
    }
  },1000);
}

// Final Score
function showFinalScreen(){
  canAnswer=false;
  questionEl.textContent="🎉 GAME OVER 🎉";
  categoryEl.textContent="Byte by Byte: IT Quiz Challenge!";
  timerEl.textContent="";
  counterEl.textContent="";
  choicesEl.innerHTML=`
    <h2>Your Final Score</h2>
    <h1>${score} / ${TOTAL_QUESTIONS}</h1>
    <p>Great job! 👏</p>
  `;
  document.getElementById("sound-win").play();
}

// Start game
spinCategory();
