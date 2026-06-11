// src/main.js

import { SimpleChessBoard } from "@0dexz0/simple-chess-board";
import * as XLSX from "xlsx";

async function loadPuzzles() {
  const response = await fetch("src/puzzles.xlsx");
  const arrayBuffer = await response.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet);

  return rows;
}

const puzzles = await loadPuzzles();

console.log(puzzles);

// let title =  "Mate Combination";
// let fen = "r2qr1k1/b1p2ppp/pp4n1/P1P1p3/4P1n1/B2P2Pb/3NBP1P/RN1QR1K1 b - - 1 16";
// let moves = "b6c5 e2g4 h3g4 d1g4";
// let sideToMove = fen.split(" ")[1] === "w" ? "b" : "w";

// const PUZZLE = {
//   title: title,
//   fen: fen,
//   moves: moves,
//   sideToMove: sideToMove,
// };

let PUZZLE = {
  title: "",
  fen: "",
  moves: "",
  sideToMove: "",
};
async function loadFirstPuzzle() {
  let title =  puzzles[0].Rating;
  let fen = puzzles[0].FEN;
  let moves = puzzles[0].Moves;
  let sideToMove = fen.split(" ")[1] === "w" ? "b" : "w";
  PUZZLE.title = title;
  PUZZLE.fen = fen;
  PUZZLE.moves = moves;
  PUZZLE.sideToMove = sideToMove;
}

loadFirstPuzzle()

let board;
let mistakes = 0;
let solved = false;
let currentStep = 0;
let ignoreMoveEvents = false;
let puzzleCount = 0;
let timerInterval = null;
let elapsedSeconds = 0;
let trackerData = [];
let tookHint = 0;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = document.getElementById("app");

const style = document.createElement("style");
style.textContent = `
*{
  box-sizing:border-box;
}

body {
  height: 100%;
  margin:0;
  background:#1f1f1f;
  color:#fff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.app{
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  box-sizing: border-box;
}
.summary-app{
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  box-sizing: border-box;
}

.layout{
  width:100%;
  max-width:1300px;
  min-height: calc(100vh - 40px);
  
  display:grid;
  grid-template-columns: minmax(520px,720px) 300px;
  justify-content: center;
  align-content: center;
  gap:28px;
}

.board-panel{
  height: 100%;
  background:#262626;
  border:1px solid #333;
  border-radius:18px;
  padding:18px;
  box-shadow:0 10px 40px rgba(0,0,0,.35);
}

.card{
  width: 100%
  background:#262626;
  border:1px solid #333;
  border-radius:18px;
  padding:24px;
  display:flex;
  flex-direction:column;
  gap:16px;
  box-shadow:0 10px 40px rgba(0,0,0,.35);
}

.title{
  display: flex;
  align-items: center;
  justify-content: center;

  height: 50px;
  min-width: 80px;
  padding: 0 12px;

  border-radius: 8px;

  color:#9aa0a6;
  font-size: 30px;
  font-weight: 700;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  user-select: none;
}
.subtitle{
  display: flex;
  align-items: center;
  justify-content: center;

  height: 30px;
  min-width: 80px;
  padding: 0 12px;

  border-radius: 8px;

  color: white;
  font-size: 25px;
  font-weight: 800;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  user-select: none;
}
.messageBox{
  display: flex;
  align-items: center;
  justify-content: center;

  height: 30px;
  min-width: 80px;
  padding: 0 12px;

  border-radius: 8px;

  color:#9aa0a6;
  font-size: 15px;
  font-weight: 500;
  font-style: italic;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  user-select: none;
}
.info{
  background:#2f2f2f;
  border-radius:12px;
  padding:12px;
}

.label{
  color:#aaa;
  font-size:12px;
  text-transform:uppercase;
  letter-spacing:.08em;
  margin-bottom:6px;
}

.value{
  font-size:16px;
  font-weight:600;
}

.status{
  background:#2f2f2f;
  border-radius:12px;
  padding:12px;
  min-height:56px;
}



.success{
  color:#72df7b;
}

.puzzle-tracker {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 18px;
  align-items: flex-start;
}

.tracker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 20px;
}

.tracker-icon {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.25),
    0 1px 2px rgba(0,0,0,.15);
}

.tracker-item.correct .tracker-icon {
  background: #8bb64a;
}

.tracker-item.wrong .tracker-icon {
  background: #e15241;
}

.tracker-rating {
  margin-top: 5px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.tracker-item.correct .tracker-rating {
  color: #5f8d4a;
}

.tracker-item.wrong .tracker-rating {
  color: #d13f32;
}

.tracker-item.skipped .tracker-icon {
  background: linear-gradient(#f7c64a, #e09b13);
}

.tracker-item.skipped .tracker-rating {
  color: #d08a00;
}
.trackerInfo{
  flex: 1;
  min-height: 0;
  background:#2f2f2f;
  border-radius:12px;
  padding:12px;
}
.puzzleCounter {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 48px;
  height: 100px;
  padding: 0 50px;

  background: #2f2f2f;
  border-radius: 12px;

  color: #f0d9b5;
  font-size: 50px;
  font-weight: 1000;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  user-select: none;
}
.timer {
  display: flex;
  align-items: center;
  justify-content: center;

  height: 50px;
  min-width: 80px;
  padding: 0 12px;

  background: #2f2f2f;
  border: 1px solid #3d3b38;
  border-radius: 8px;

  color: #f0d9b5;
  font-size: 16px;
  font-weight: 700;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  user-select: none;
}
.action-buttons{
  margin-top:auto;
  display:flex;
  justify-content:flex-end;
  gap:3px;
  padding-top:12px;
}

.icon-btn{
  width:30px;
  height:30px;

  display:flex;
  align-items:center;
  justify-content:center;

  background: inherit;
  border:none;
  border-radius:0px;

  color:#9aa0a6;
  font-size:20px;
  font-weight:100;

  cursor:pointer;
  transition:all .2s ease;
  
}
.status-row{
  display:flex;
  align-items:center;
  justify-content: center;
  gap:0px;
}

.side-indicator{
  width:20px;
  height:20px;
  border-radius:0px;
  border: 1px solid rgb(255, 243, 77);
  flex-shrink:0;
}

.side-indicator.white{
  background:#ffffff;
}

.side-indicator.black{
  background:#111111;
}

.icon-btn:hover{
  color:#ffffff;
  transform:translateY(-1px);
}

.icon-btn:active{
  transform:scale(0.96);
}
@media (max-width: 900px) {
  .layout {
    min-height: auto;
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .board-panel,
  .card {
    width: 100%;
    max-width: 720px;
  }
}
.screen{
  position:absolute;
  inset:0;

  opacity:0;
  pointer-events:none;

  transform:translateY(12px);

  transition:
    opacity 300ms ease,
    transform 300ms ease;
}

.screen.active{
  opacity:1;
  pointer-events:auto;
  transform:translateY(0);
}
.summary-screen{
  width:100%;
  max-width:800px;
  min-height: calc(85vh - 40px); 
  border-radius:18px;
  border:1px solid #333;
  box-shadow:0 10px 40px rgba(0,0,0,.35);

  justify-content: center;
  align-content: center;
  display:flex;

  flex-direction:column;
  padding:30px;
  gap:30px;
  background:#2f2f2f;
  color:#fff;
}

.summary-header h1{
  margin:0;
  font-size:2rem;
  font-weight:700;
}

.summary-header p{
  margin-top:6px;
  color:#8f8f8f;
}

.summary-stats{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap: 20px;
}

.stat-card{
  background:#1f1f1f;
  border-radius:5px;
  padding:20px;
  border:1px solid #2c2c2c;
  box-shadow:0 10px 40px rgba(0,0,0,.35);
}

.stat-card.primary{
  border-color:#4b7cff;
}

.stat-card.success{
  border-color:#35c759;
}

.stat-card.danger{
  border-color:#ff5d5d;
}
.stat-card.amber{
  border-color:  #e09b13;
}
.stat-label{
  color:#9b9b9b;
  font-size:0.9rem;
  margin-bottom:8px;
}

.stat-value{
  font-size:1.5rem;
  font-weight:700;
}

.chart-card{
  background:#1f1f1f;
  border-radius:18px;
  padding:24px;
  border:1px solid #2c2c2c;
}

.chart-title{
  font-size:1rem;
  font-weight:600;
  margin-bottom:20px;
}

.chart-placeholder{
  height:220px;
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:16px;
}

.bar{
  flex:1;
  background:#4b7cff;
  border-radius:12px 12px 0 0;
  opacity:.5;
  transition:.3s;
}

.bar.current{
  opacity:1;
}

.chart-labels{
  margin-top:12px;
  display:flex;
  justify-content:space-between;
  color:#8a8a8a;
  font-size:.85rem;
}

.restart-btn{
  margin-top:auto;
  align-self:center;

  border:none;
  background:#4b7cff;
  color:white;

  padding:14px 28px;
  border-radius:14px;

  font-size:1rem;
  font-weight:600;

  cursor:pointer;

  transition:
    transform .2s ease,
    opacity .2s ease;
}

.restart-btn:hover{
  transform:translateY(-2px);
}

.restart-btn:active{
  transform:translateY(0);
}
`;
document.head.appendChild(style);

const puzzleScreen = document.getElementById("puzzleScreen");
const summaryScreen = document.getElementById("summaryScreen");
const pauseScreen = document.getElementById("pauseScreen");

puzzleScreen.innerHTML = `
<div class="app">
  <div class="layout">

    <div class="board-panel">
      <div id="board"></div>
    </div>

    <div class = "card">
      <div class="status-row">
        <div id="sideIndicator" class="side-indicator"></div>
        <div class="subtitle" id="statusText">In Progress</div>
      </div>
      <div class="messageBox" id="messageBox">Loading puzzle...</div>
      <div class="timer" id="timer">00:00</div>
      <div class="puzzleCounter" id="puzzleCounter"> 1 </div>

      <div class = "trackerInfo">
        <div id="puzzleTracker" class="puzzle-tracker"></div>
      </div>

      <div class="title" id="puzzleTitle">...</div>

      <div class="action-buttons">
        <button id="pauseBtn" class="icon-btn" title="Hint">
          <span>⏸</span>
        </button>
        <button id="hintBtn" class="icon-btn" title="Hint">
          <span>✦</span>
        </button>

        <button id="nextBtn" class="icon-btn" title="Next Puzzle">
          <span>➟</span>
        </button>
      </div>

    </div>

  </div>
</div>
`;
summaryScreen.innerHTML = `
<div class = "summary-app">
  <div class="summary-screen">

    <div class="summary-header">
      <h1>Session Statistics</h1>
    </div>

    <div class="summary-stats">

      <div class="stat-card primary">
        <div class="stat-label">Total Time</div>
        <div class="stat-value" id = "statTimeTaken">12m 47s</div>
      </div>

      <div class="stat-card success">
        <div class="stat-label">Correct</div>
        <div class="stat-value" id = "statCorrect">42</div>
      </div>

      <div class="stat-card danger">
        <div class="stat-label">Incorrect</div>
        <div class="stat-value" id = "statIncorrect">8</div>
      </div>

      <div class="stat-card amber">
        <div class="stat-label">Skipped</div>
        <div class="stat-value" id = "statSkipped">8</div>
      </div>

    </div>
    <button id="restartBtn" class="restart-btn">
      Restart Training
    </button>

  </div>
</div>
`;

pauseScreen.innerHTML = `
<div class = "summary-app">
  <div class="summary-screen">

    <div class="summary-header">
      <h1>Session Statistics</h1>
    </div>

    <div class="summary-stats">

      <div class="stat-card primary">
        <div class="stat-label">Total Time</div>
        <div class="stat-value" id = "pauseTimeTaken">12m 47s</div>
      </div>

      <div class="stat-card success">
        <div class="stat-label">Correct</div>
        <div class="stat-value" id = "pauseCorrect">42</div>
      </div>

      <div class="stat-card danger">
        <div class="stat-label">Incorrect</div>
        <div class="stat-value" id = "pauseIncorrect">8</div>
      </div>

      <div class="stat-card amber">
        <div class="stat-label">Skipped</div>
        <div class="stat-value" id = "pauseSkipped">8</div>
      </div>

    </div>

    <button id="startBtn" class="restart-btn">
      Continue Training
    </button>

    <button id="restartBtn2" class="restart-btn">
      Restart Training
    </button>

  </div>
</div>
`;

const boardContainer = document.getElementById("board");
const statusText = document.getElementById("statusText");
const sideIndicator = document.getElementById("sideIndicator");
const messageBox = document.getElementById("messageBox");
const puzzleCounter = document.getElementById("puzzleCounter");
const puzzleTitle = document.getElementById("puzzleTitle");
const statTimeTaken = document.getElementById("statTimeTaken");
const statCorrect = document.getElementById("statCorrect");
const statIncorrect = document.getElementById("statIncorrect");
const statSkipped = document.getElementById("statSkipped");

const pauseTimeTaken = document.getElementById("pauseTimeTaken");
const pauseCorrect = document.getElementById("pauseCorrect");
const pauseIncorrect = document.getElementById("pauseIncorrect");
const pauseSkipped = document.getElementById("pauseSkipped");

const timerEl = document.getElementById("timer");



function getPuzzleMoves() {
  return PUZZLE.moves
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function getTotalSteps() {
  return getPuzzleMoves().length;
}

function getStep(index) {
  const moves = getPuzzleMoves();

  return {
    move: moves[index],
    side: index % 2 === 0 ? "auto" : "user"
  };
}

function getExpectedMove() {
  return getStep(currentStep)?.move;
}

function getUserStepCount() {
  return Math.floor(getTotalSteps() / 2);
}

function getCurrentUserStep() {
  let completed = 0;

  for (let i = 0; i < currentStep; i++) {
    if (i % 2 === 1) {
      completed++;
    }
  }

  return completed + 1;
}

function splitMove(move) {
  return {
    from: move.slice(0, 2),
    to: move.slice(2, 4),
    promotion: move.length > 4 ? move[4] : undefined
  };
}

function executeMove(move) {
  const { from, to, promotion } = splitMove(move);

  board.executeMove(
    from,
    to,
    true,
    promotion
  );
}

function setMessage(text) {
  messageBox.textContent = text;
}

function updateUI() {
  // puzzleTitle.textContent = PUZZLE.title;

  if (solved) {
    statusText.innerHTML =
      '<span class="success">Puzzle Solved ✓</span>';
    return;
  }
  if (PUZZLE.sideToMove === "w") {
    statusText.textContent = "White to Move";
    sideIndicator.className = "side-indicator white";
  } else {
    statusText.textContent = "Black to Move";
    sideIndicator.className = "side-indicator black";
  }
}

async function playAutomaticMove(move) {
  ignoreMoveEvents = true;

  executeMove(move);

  ignoreMoveEvents = false;
}

async function advancePuzzle() {
  currentStep++;

  while (
    currentStep < getTotalSteps() &&
    getStep(currentStep).side === "auto"
  ) {
    await playAutomaticMove(
      getStep(currentStep).move
    );

    currentStep++;
  }

  if (currentStep >= getTotalSteps()) {
    solved = true;

    updateUI();

    setMessage("Puzzle Solved ✓");
    nextPuzzle();
    return;
  }

  updateUI();
}

function loadCurrentPuzzle() {
  let title =  puzzles[puzzleCount].Rating;
  let fen = puzzles[puzzleCount].FEN;
  let moves = puzzles[puzzleCount].Moves;
  let sideToMove = fen.split(" ")[1] === "w" ? "b" : "w";
  PUZZLE.title = title;
  PUZZLE.fen = fen;
  PUZZLE.moves = moves;
  PUZZLE.sideToMove = sideToMove;
}
async function endPuzzleTrainer () {
  let timeTaken = stopTimer();
  setMessage(`Solved in ${timeTaken}`);
  board.flipBoard('w');
  board.setPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  puzzleCounter.textContent = "!!";
  puzzleTitle.textContent = "COMPLETED!";
  await sleep(700);
  showSummary(timeTaken);
  return;
}
async function resetPuzzle() {
  solved = false;
  currentStep = 0;
  mistakes = 0;
  tookHint = 0;
  if (puzzleCount >= puzzles.length) { 
    endPuzzleTrainer();
    return;
  }
  loadCurrentPuzzle();
  board.flipBoard('w')
  board.setPosition(PUZZLE.fen);
  board.flipBoard(PUZZLE.sideToMove);
  board.playerColor = PUZZLE.sideToMove
  board.clearHistory();
  board.clearMarks("persistent");

  while (
    currentStep < getTotalSteps() &&
    getStep(currentStep).side === "auto"
  ) {
    await playAutomaticMove(
      getStep(currentStep).move
    );

    currentStep++;
  }

  updateUI();

  setMessage("Find the best move.");
  puzzleCounter.textContent = puzzleCount + 1;
}

function showHint() {
  if (solved) return;
  tookHint = 1;
  board.clearMarks("persistent");

  const move = getExpectedMove();

  if (!move) return;

  const { from, to } = splitMove(move);

  board.renderMarkArrow(
    "persistent",
    from,
    to,
    {
      color: "#00d4ff",
      opacity: 0.9
    }
  );
}

async function replaySolution() {
  solved = false;
  board.flipBoard('w');
  board.setPosition(PUZZLE.fen);
  board.flipBoard(PUZZLE.sideToMove);
  board.clearHistory();
  board.clearMarks("persistent");

  ignoreMoveEvents = true;

  for (const move of getPuzzleMoves()) {
    executeMove(move);
    await sleep(700);
  }

  ignoreMoveEvents = false;

  solved = true;

  updateUI();

  setMessage("Puzzle Solved ✓");
}

board = new SimpleChessBoard({
  container: boardContainer,
  style: {
    board: {
        color1: '#f0d9b5',
        color2: '#b58863'
    }
  },
  position: PUZZLE.fen,
  playerColor: PUZZLE.sideToMove,
  orientation: "w",
  interactivity: {
    enabled: true
  }
});
if (PUZZLE.sideToMove === 'b') board.flipBoard();

board.on("move:end", async ({ move }) => {
  if (ignoreMoveEvents || solved) return;

  // Remove any displayed hint as soon as user makes a move
  board.clearMarks("persistent");

  const playedMove =
    move.from +
    move.to +
    (move.promotion || "");

  const expectedMove =
    getExpectedMove();

  if (playedMove !== expectedMove) {
    mistakes++;

    updateUI();

    setMessage("Incorrect. Try again.");

    ignoreMoveEvents = true;

    await sleep(250);

    board.undoMove();

    ignoreMoveEvents = false;

    return;
  }

  setMessage("Correct!");

  await advancePuzzle();
});
function pausePuzzleTrainer () {
  ignoreMoveEvents = true;
  let timeTaken = stopTimer();
  pauseTimeTaken.textContent = timeTaken;
  pauseCorrect.textContent = trackerData.filter(item => item.status === "correct").length;
  pauseIncorrect.textContent = trackerData.filter(item => item.status === "wrong").length;
  pauseSkipped.textContent = trackerData.filter(item => item.status === "skipped").length;
  puzzleScreen.classList.remove("active");
  pauseScreen.classList.add("active");
}

function resumePuzzleTrainer () {
  ignoreMoveEvents = false;
  puzzleScreen.classList.add("active");
  pauseScreen.classList.remove("active");
  startTimer();
}

document
  .getElementById("hintBtn")
  .addEventListener("click", showHint);

document
  .getElementById("nextBtn")
  .addEventListener("click", skipPuzzle);

document
  .getElementById("restartBtn")
  .addEventListener("click", restartPuzzleTrainer);

  document
  .getElementById("restartBtn2")
  .addEventListener("click", restartPuzzleTrainer);

document
  .getElementById("pauseBtn")
  .addEventListener("click", pausePuzzleTrainer);

  document
  .getElementById("startBtn")
  .addEventListener("click", resumePuzzleTrainer);
  
function renderPuzzleTracker() {
  const container = document.getElementById("puzzleTracker");

  container.innerHTML = trackerData
    .map((item) => {
      const status = item.status; // "correct" | "wrong" | "skipped"

      return `
        <div class="tracker-item ${status}">
          <div class="tracker-icon">
            ${
              status === "correct"
                ? "✓"
                : status === "wrong"
                ? "✕"
                : "−"
            }
          </div>
          <div class="tracker-rating">${item.rating}</div>
        </div>
      `;
    })
    .join("");
}

function skipPuzzle() {
  if (mistakes > 0) trackerData.push({ rating: puzzles[puzzleCount].Rating, status: "wrong" });
  else trackerData.push({ rating: puzzles[puzzleCount].Rating, status: "skipped" });
  renderPuzzleTracker();
  puzzleCount++;
  resetPuzzle();
}

  function nextPuzzle() {
    if (mistakes === 0 && tookHint == 0) trackerData.push({ rating: puzzles[puzzleCount].Rating, status: "correct" });
    else if (mistakes === 0 && tookHint >= 0) trackerData.push({ rating: puzzles[puzzleCount].Rating, status: "skipped" });
    else trackerData.push({ rating: puzzles[puzzleCount].Rating, status: "wrong" });
    renderPuzzleTracker();
    puzzleCount++;
    resetPuzzle();
  }

function updateTimerDisplay() {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  timerEl.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    elapsedSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function resetTimer() {
  stopTimer();
  elapsedSeconds = 0;
  updateTimerDisplay();
}

function showSummary(timeTaken) {
  statTimeTaken.textContent = timeTaken;
  statCorrect.textContent = trackerData.filter(item => item.status === "correct").length;
  statIncorrect.textContent = trackerData.filter(item => item.status === "wrong").length;
  statSkipped.textContent = trackerData.filter(item => item.status === "skipped").length;
  puzzleScreen.classList.remove("active");
  summaryScreen.classList.add("active");
}

function restartPuzzleTrainer() {
  mistakes = 0;
  solved = false;
  currentStep = 0;
  ignoreMoveEvents = false;
  puzzleCount = 0;
  trackerData = [];
  puzzleTitle.textContent = "...";

  summaryScreen.classList.remove("active");
  pauseScreen.classList.remove("active");
  puzzleScreen.classList.add("active");

  resetTimer();
  resetPuzzle();
  renderPuzzleTracker();
  updateUI()
  startTimer();

  summaryScreen.classList.remove("active");
  puzzleScreen.classList.add("active");
}

updateTimerDisplay();
renderPuzzleTracker();
resetPuzzle();
startTimer()