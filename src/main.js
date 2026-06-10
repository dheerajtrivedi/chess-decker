// src/main.js

import { SimpleChessBoard } from "@0dexz0/simple-chess-board";

const title =  "Mate Combination";
const fen = "r2qr1k1/b1p2ppp/pp4n1/P1P1p3/4P1n1/B2P2Pb/3NBP1P/RN1QR1K1 b - - 1 16";
const moves = "b6c5 e2g4 h3g4 d1g4";
const sideToMove = fen.split(" ")[1] === "w" ? "b" : "w";

const PUZZLE = {
  title: title,
  fen: fen,
  moves: moves,
  sideToMove: sideToMove,
};

let board;
let mistakes = 0;
let solved = false;
let currentStep = 0;
let ignoreMoveEvents = false;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = document.getElementById("app");

const style = document.createElement("style");
style.textContent = `
*{
  box-sizing:border-box;
}

body{
  margin:0;
  background:#1f1f1f;
  color:#fff;
  font-family:Inter,system-ui,sans-serif;
}

.app{
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:32px;
}

.layout{
  width:100%;
  max-width:1300px;
  display:grid;
  grid-template-columns:minmax(520px,720px) 300px 300px;
  gap:28px;
}

.board-panel{
  background:#262626;
  border:1px solid #333;
  border-radius:18px;
  padding:18px;
  box-shadow:0 10px 40px rgba(0,0,0,.35);
}

.card{
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
  font-size:24px;
  font-weight:700;
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

.buttons{
  display:flex;
  flex-direction:column;
  gap:10px;
}

button{
  border:none;
  border-radius:12px;
  padding:12px;
  cursor:pointer;
  font-size:15px;
  font-weight:600;
}

.primary{
  background:#7fa650;
  color:white;
}

.secondary{
  background:#404040;
  color:white;
}

.danger{
  background:#934242;
  color:white;
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
  min-width: 30px;
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

@media(max-width:950px){
  .layout{
    grid-template-columns:1fr;
  }
}
`;
document.head.appendChild(style);

app.innerHTML = `
<div class="app">
  <div class="layout">

    <div class="board-panel">
      <div id="board"></div>
    </div>

    <div class="card">

      <div class="title">${PUZZLE.title}</div>

      <div class="info">
        <div class="label">Status</div>
        <div class="value" id="statusText">In Progress</div>
      </div>

      <div class="info">
        <div class="label">Current Step</div>
        <div class="value" id="stepText"></div>
      </div>

      <div class="info">
        <div class="label">Mistakes</div>
        <div class="value" id="mistakesText">0</div>
      </div>

      <div class="status" id="messageBox">
        Loading puzzle...
      </div>

      <div class="buttons">
        <button id="hintBtn" class="primary">Hint</button>
        <button id="resetBtn" class="secondary">Reset</button>
        <button id="solutionBtn" class="danger">Show Solution</button>
        <button id="Next" class="danger">Next</button>
      </div>
    </div>
    <div class = "card">
      <div class="info">
        <div id="puzzleTracker" class="puzzle-tracker"></div>
      </div>
    </div>

  </div>
</div>
`;

const boardContainer = document.getElementById("board");
const statusText = document.getElementById("statusText");
const stepText = document.getElementById("stepText");
const mistakesText = document.getElementById("mistakesText");
const messageBox = document.getElementById("messageBox");

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
  mistakesText.textContent = mistakes;

  if (solved) {
    statusText.innerHTML =
      '<span class="success">Puzzle Solved ✓</span>';

    stepText.textContent = "Completed";
    return;
  }

  statusText.textContent = "In Progress";

  stepText.textContent =
    `${getCurrentUserStep()} / ${getUserStepCount()}`;
}

async function playAutomaticMove(move) {
  ignoreMoveEvents = true;

  executeMove(move);

  await sleep(500);

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
    return;
  }

  updateUI();
}

async function resetPuzzle() {
  solved = false;
  currentStep = 0;

  board.flipBoard('w')
  board.setPosition(PUZZLE.fen);
  board.flipBoard(PUZZLE.sideToMove);
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
}

function showHint() {
  if (solved) return;

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

document
  .getElementById("hintBtn")
  .addEventListener("click", showHint);

document
  .getElementById("resetBtn")
  .addEventListener("click", async () => {
    mistakes = 0;
    await resetPuzzle();
  });

document
  .getElementById("solutionBtn")
  .addEventListener("click", replaySolution);

  const trackerData = [
    { rating: 324, status: "wrong" },
    { rating: 381, status: "correct" },
    { rating: 487, status: "correct" },
    { rating: 575, status: "skipped" },
    { rating: 575, status: "skipped" },
    { rating: 575, status: "skipped" },
    { rating: 575, status: "skipped" },
  ];
  
  function renderPuzzleTracker(data) {
    const container = document.getElementById("puzzleTracker");
  
    container.innerHTML = data
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
  
  renderPuzzleTracker(trackerData);
  
  // // Example updates:
  // trackerData.push({ rating: 1120, solved: true });
  // renderPuzzleTracker(trackerData);
  
  // // Change a result:
  // trackerData[0].solved = true;
  // renderPuzzleTracker(trackerData);

resetPuzzle();