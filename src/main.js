// src/main.js

import { SimpleChessBoard } from "@0dexz0/simple-chess-board";
import "./css/global.css";
import "./css/puzzles.css";
import "./css/neo_dashboard.css";
// import "./css/dashboard.css";
// import "./css/summary.css";
import "./css/neo_summary.css";
import initSqlJs from "sql.js";
import * as XLSX from "xlsx";

let PUZZLE = {
  title: "800",
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  moves: "e4e5 e7e6",
  sideToMove: "b",
};

let board;
let mistakes = 0;
let solved = false;
let currentStep = 0;
let ignoreMoveEvents = false;
let puzzleCount = 0;
let timerInterval = null;
let elapsedSeconds = 0;
let trackerData = [];
let puzzleSets = [];
let puzzles = [];
let tookHint = 0;
let currentSetId = "";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = document.getElementById("app");

const style = document.createElement("style");

document.head.appendChild(style);

const puzzleScreen = document.getElementById("puzzleScreen");
const summaryScreen = document.getElementById("summaryScreen");
const pauseScreen = document.getElementById("pauseScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

puzzleScreen.innerHTML = `
<div class="app">
  <div class="layout">
    <div class = "card2">
      <div class="puzzleCounter" id="puzzleCounter"> 1 </div>
    </div>
    <div class="board-panel">
      <div id="board"></div>
    </div>
    
    <div class = "card">
      <div class="status-row">
        <div id="sideIndicator" class="side-indicator"></div>
        <div class="subtitle" id="statusText">In Progress</div>
      </div>
      <div class="messageBox" id="messageBox">Loading puzzle...</div>

      <div class = "trackerInfo">
        <div id="puzzleTracker" class="puzzle-tracker"></div>
      </div>
      <div class="timer" id="timer">00:00</div>
      <div class="title" id="puzzleTitle">...</div>
      <div class="action-buttons">
        <button id="pauseBtn" class="small-round-btn" title="Hint">
          <span>⏸</span>
        </button>
        <button id="hintBtn" class="small-round-btn" title="Hint">
          <span>✦</span>
        </button>

        <button id="nextBtn" class="small-round-btn" title="Next Puzzle">
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
      <h1>SUMMARY</h1>
      <button id="returnToDashboard" class="close-btn">✕</button>
    </div>
    
    <article class="summary-card">
      <hr>
      <h4>SESSION</h4>
      <div class="card-stats">
        <div class="stat-item">
            <span class="label">Total Time</span>
            <span class="value" id = "statTimeTaken">12m 47s</span>
          </div>
      </div>
      <div class = "card-stats">
        <div class="stat-item">
          <span class="label">Correct</span>
          <span class="value success" id = "statCorrect">42</span>
        </div>

        <div class="stat-item ">
          <span class="label">Incorrect</span>
          <span class="value danger" id = "statIncorrect">8</span>
        </div>

        <div class="stat-item">
          <span class="label">Skipped</span>
          <span class="value amber" id = "statSkipped">8</span>
        </div>
      </div>
      <hr>
      <h4>OVERALL</h4>
      <div id = "overallStat">-</div>
      <hr>
    </article>
    <div class = "summary-action-buttons">
      <button id="restartBtn" class="round-btn">
        <span class="material-symbols-outlined">refresh</span>
      </button>
    </div>
  </div>
</div>
`;

pauseScreen.innerHTML = `
<div class = "summary-app">
  <div class="summary-screen">

    <div class="summary-header">
      <h1>STATISTICS</h1>
      <button id="startBtn2" class="close-btn">✕</button> 
    </div>
    
    <article class="summary-card">
      <div class="card-stats">
        <div class="stat-item">
            <span class="label">Total Time</span>
            <span class="value" id = "pauseTimeTaken">12m 47s</span>
          </div>
      </div>
      <div class = "card-stats">
        <div class="stat-item">
          <span class="label">Correct</span>
          <span class="value success" id = "pauseCorrect">42</span>
        </div>

        <div class="stat-item">
          <span class="label">Incorrect</span>
          <span class="value danger" id = "pauseIncorrect">8</span>
        </div>
        <div class="stat-item">
          <span class="label">Skipped</span>
          <span class="value amber" id = "pauseSkipped">8</span>
        </div>
      </div>

    </article>
    <div class = "summary-action-buttons">
      <button id="startBtn" class="round-btn">
        <span class="material-symbols-outlined">play_arrow</span>
      </button>

      <button id="restartBtn2" class="round-btn">
        <span class="material-symbols-outlined">refresh</span>
      </button>
    </div>

  </div>
</div>
`;

dashboardScreen.innerHTML = `
<div class="dashboard-container">

  <div class="dashboard-header">
    <div>
      <h1 class="dashboard-title">Chess Trainer</h1>
      <p class="dashboard-subtitle">
        A ChessPecker-style chess trainer focused on improving chess pattern recognition through curated puzzle sets.
      </p>
    </div>

    
    <div id="modalRoot"></div>
  </div>
  <div id="puzzleSetGrid" class="puzzle-set-grid"></div>
</div>
<button class="dashboard-primary-btn" id="createSetBtn">
+
</button>
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

async function startPuzzleSet(setID) {
  console.log("Loading Puzzle Set: " + setID);
  currentSetId = setID;

  await activateScreen(puzzleScreen);

  mistakes = 0;
  solved = false;
  currentStep = 0;
  ignoreMoveEvents = false;
  puzzleCount = 0;
  timerInterval = null;
  elapsedSeconds = 0;
  trackerData = [];
  puzzleSets = [];
  puzzles = [];
  tookHint = 0;

  puzzles = await loadPuzzles(setID);

  updateTimerDisplay();
  renderPuzzleTracker();
  resetPuzzle();
  startTimer();
  return;
}

let db;

async function initPuzzleDB() {
  const SQL = await initSqlJs({
    locateFile: () => "/sql-wasm.wasm"
  });

  const response = await fetch("/lichess-puzzles.db");
  const buffer = await response.arrayBuffer();

  db = new SQL.Database(new Uint8Array(buffer));
}

await initPuzzleDB();

function returnToDashboard() {
  loadPuzzleSets();
  activateScreen(dashboardScreen);
}


document
  .getElementById("createSetBtn")
  .addEventListener("click", openPuzzleSetModal);

  async function openPuzzleSetModal() {

    const ratingInfo = db.exec(`
      SELECT
        MIN(Rating),
        MAX(Rating)
      FROM puzzles
    `)[0];
  
    const minRating = Number(ratingInfo.values[0][0]);
    const maxRating = Number(ratingInfo.values[0][1]);
  
    document.getElementById("modalRoot").innerHTML = `
      <div class="modal-overlay">
  
        <div class="create-set-card">
  
          <div class="modal-header">
            <h2>CREATE SET</h2>
            <button id="cancelCreate" class="close-btn">
              ✕
            </button>
          </div>
  
          <input
            id="setName"
            class="set-name-input"
            placeholder="SET NAME"
          />
  
          <div class="slider-section">
  
            <div class="slider-row">
              <div class = "slider-label">
                <div class="slider-label-label">
                  Puzzles
                </div>
  
                <div
                  class="slider-label-value"
                  id="countValue"
                >
                  100
                </div>
              </div>
            <div class="range-slider">
              <input
                id="puzzleCount"
                type="range"
                min="10"
                max="1000"
                value="100"
              />
            </div>
            </div>
  
            <div class="slider-row">
              <div class = "slider-label">
                <div class="slider-label-label">
                  Rating
                </div>
  
                <div
                  class="slider-label-value"
                  id="ratingValue"
                >
                  ${minRating} – ${maxRating}
                </div>
              </div>
  
              <div class="range-slider">
                <input
                  id="minRating"
                  type="range"
                  min="${minRating}"
                  max="${maxRating}"
                  value="${minRating}"
                  step="50"
                />
  
                <input
                  id="maxRating"
                  type="range"
                  min="${minRating}"
                  max="${maxRating}"
                  value="${maxRating}"
                  step="50"
                />
              </div>
  
            </div>
  
          </div>
          
          <div class ="modal-footer">
            <div
              id="foundCount"
              class="found-pill"
            >
              Calculating...
            </div>
            <button
              id="confirmCreate"
              class="round-btn"
            >
              +
            </button>
            
          </div>
          </div>
  
      </div>
    `;
  
    const countSlider =
      document.getElementById("puzzleCount");
  
    const minSlider =
      document.getElementById("minRating");
  
    const maxSlider =
      document.getElementById("maxRating");
  
    function updateCount() {
  
      let min = Number(minSlider.value);
      let max = Number(maxSlider.value);
  
      if (min > max) {
        [min, max] = [max, min];
      }
  
      document.getElementById(
        "countValue"
      ).textContent = countSlider.value;
  
      document.getElementById(
        "ratingValue"
      ).textContent = `${min} – ${max}`;
  
      const result = db.exec(`
        SELECT COUNT(*)
        FROM puzzles
        WHERE Rating BETWEEN
          ${min}
          AND
          ${max}
      `);
  
      const total = result[0].values[0][0];
  
      document.getElementById(
        "foundCount"
      ).textContent =
        `${total.toLocaleString()} puzzles found`;
    }
  
    countSlider.addEventListener(
      "input",
      updateCount
    );
  
    minSlider.addEventListener(
      "input",
      updateCount
    );
  
    maxSlider.addEventListener(
      "input",
      updateCount
    );
  
    updateCount();
  
    document
      .getElementById("cancelCreate")
      .addEventListener("click", () => {
        document.getElementById(
          "modalRoot"
        ).innerHTML = "";
      });
  
    document
      .getElementById("confirmCreate")
      .addEventListener(
        "click",
        createPuzzleSet
      );
  }
  
  // ------------------------
  // CREATE SET
  // ------------------------
  async function createPuzzleSet() {

    const name =
      document.getElementById("setName").value.trim();
  
    if (!name) {
      alert("Enter a set name");
      return;
    }
  
    const count =
      Number(document.getElementById("puzzleCount").value);
  
    const minRating =
      Number(document.getElementById("minRating").value);
  
    const maxRating =
      Number(document.getElementById("maxRating").value);
  
    const result = db.exec(`
      SELECT *
      FROM puzzles
      WHERE Rating BETWEEN
        ${minRating}
        AND
        ${maxRating}
      ORDER BY RANDOM()
      LIMIT ${count}
    `);
  
    if (!result.length) {
      alert("No puzzles found");
      return;
    }
  
    const cols = result[0].columns;
    const rows = result[0].values;
  
    const puzzles = rows.map(row => {
      const obj = {};
  
      cols.forEach((col, i) => {
        obj[col] = row[i];
      });
  
      return obj;
    });
  
    // -------------------------
    // Store puzzle data
    // -------------------------
  
    const storageKey = `puzzles_${name}`;
  
    localStorage.setItem(
      storageKey,
      JSON.stringify(puzzles)
    );
  
    // -------------------------
    // Calculate metadata
    // -------------------------
  
    const averageRating = Math.round(
      puzzles.reduce(
        (sum, p) => sum + Number(p.Rating || 0),
        0
      ) / puzzles.length
    );
  
    const newSet = {
      SetId: name,
      AverageRating: averageRating,
      NumberPuzzle: puzzles.length,
  
      lastSolveTime: null,
      bestTime: null,
      lastSolveDate: null,
  
      averageAccuracy: null,
  
      accuracyArray: [],
      solveTimeArray: []
    };
  
    // -------------------------
    // Update puzzleSets
    // -------------------------
  
    const puzzleSets =
      JSON.parse(
        localStorage.getItem("puzzleSets")
      ) || [];
  
    const existingIndex =
      puzzleSets.findIndex(
        s => s.SetId === name
      );
  
    if (existingIndex >= 0) {
      puzzleSets[existingIndex] = {
        ...puzzleSets[existingIndex],
        ...newSet
      };
    } else {
      puzzleSets.push(newSet);
    }
  
    localStorage.setItem(
      "puzzleSets",
      JSON.stringify(puzzleSets)
    );
  
    document.getElementById("modalRoot").innerHTML = "";
  
    if (typeof loadPuzzleSets === "function") {
      loadPuzzleSets();
    }
  }

// async function createPuzzleSet(fileName) {

//   const response = await fetch(fileName);
//   const arrayBuffer = await response.arrayBuffer();

//   const workbook = XLSX.read(arrayBuffer, { type: "array" });
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const puzzles = XLSX.utils.sheet_to_json(sheet);

//   const setId = fileName
//     .split("/")
//     .pop()
//     .replace(".xlsx", "");

//   const averageRating = Math.round(
//     puzzles.reduce((sum, p) => sum + Number(p.Rating || 0), 0) /
//     puzzles.length
//   );

  // const newSet = {
  //   SetId: setId,
  //   AverageRating: averageRating,
  //   NumberPuzzle: puzzles.length,
  //   lastSolveTime: null,
  //   bestTime: null,
  //   lastSolveDate: null,
  //   averageAccuracy: null,
  //   accuracyArray: [],
  //   solveTimeArray: []
  // };

//   const puzzleSets =
//     JSON.parse(localStorage.getItem("puzzleSets")) || [];

//   const existingIndex =
//     puzzleSets.findIndex(s => s.SetId === setId);

//   if (existingIndex >= 0) {
//     puzzleSets[existingIndex] = newSet;
//   } else {
//     puzzleSets.push(newSet);
//   }

//   localStorage.setItem(
//     "puzzleSets",
//     JSON.stringify(puzzleSets)
//   );

//   return newSet;
// }

// async function loadPuzzles(setID) {
//   const response = await fetch("src/" + setID + ".xlsx");
//   const arrayBuffer = await response.arrayBuffer();

//   const workbook = XLSX.read(arrayBuffer, { type: "array" });

//   const sheetName = workbook.SheetNames[0];
//   const sheet = workbook.Sheets[sheetName];

//   const rows = XLSX.utils.sheet_to_json(sheet);

//   return rows;
// }

async function loadPuzzles(setID) {
  const storageKey = `puzzles_${setID}`;

  // Check localStorage first
  const cached = localStorage.getItem(storageKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Load Excel if not cached
  const response = await fetch(`src/${setID}.xlsx`);
  const arrayBuffer = await response.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  // Save JSON to localStorage
  localStorage.setItem(storageKey, JSON.stringify(rows));

  return rows;
}

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

  const setStats = JSON.parse(localStorage.getItem("puzzleSets")) || [];

  const row = setStats.find(r => r.SetId === currentSetId);

  const accuracy = trackerData.filter(x => x.status === "correct").length / trackerData.length;
  const solveTime = timeTaken.split(":").reduce((m, s) => m * 60 + +s);

  if (row) {
    row.lastSolveTime = solveTime;
    row.bestTime = row.bestTime ? Math.min(row.bestTime, solveTime) : solveTime;
    row.lastSolveDate = new Date().toLocaleDateString("en-GB");

    const accuracyArr = row.accuracyArray || [];
    const timeArr = row.solveTimeArray || [];

    accuracyArr.push(accuracy);
    timeArr.push(solveTime);

    row.accuracyArray = accuracyArr;
    row.solveTimeArray = timeArr;

    row.averageAccuracy =
      accuracyArr.reduce((a, b) => a + b, 0) / accuracyArr.length;
  }

  localStorage.setItem("puzzleSets", JSON.stringify(setStats));

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
        color1: '#D4DFE5',
        color2: '#799CB1'
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

  pauseScreen.classList.add("active");
  // activateScreen(pauseScreen);
}

function resumePuzzleTrainer () {
  ignoreMoveEvents = false;
  activateScreen(puzzleScreen);
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

  document
  .getElementById("startBtn2")
  .addEventListener("click", resumePuzzleTrainer);

  document
  .getElementById("returnToDashboard")
  .addEventListener("click", returnToDashboard);

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

  const overallStat = document.getElementById("overallStat");

  const formatTime = (seconds) => {
  if (seconds == null || seconds === "") return "—";

  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };


  const puzzleSets_complete = JSON.parse(localStorage.getItem("puzzleSets"));
  const set = puzzleSets_complete.find(set => set.SetId === currentSetId);

  console.log(currentSetId);

  // const times = set.solveTimeArray || [];


  const times = Array.isArray(set.solveTimeArray)
  ? set.solveTimeArray
  : parseArray(set.solveTimeArray);

  const max = Math.max(...times, 1);
  const min = Math.min(...times, 0);


  const sparkline = times.length > 1
  ? `
          <svg class="sparkline" viewBox="0 0 100 24" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="currentColor"
              stroke-width="0.6"
              points="${
  times.map((v, i) => {
  const x = (i / (times.length - 1)) * 100;
  const y = 22 - ((v - min) / ((max - min) || 1)) * 18;
  return `${x},${y}`;
                }).join(" ")
  }"
            />
          </svg>
        `
  : `<div class="sparkline-placeholder">—</div>`;

  overallStat.innerHTML =`
        <div class="card-stats">
  
          <div class="card-header">
            <div>
              <div class="set-id">${set.SetId}</div>
              <div class="set-meta">
                ${set.NumberPuzzle || 0} puzzles
              </div>
            </div>
          </div>
        </div>
  
        <div class="card-stats">

          <div class="stat-item">
            <span class="label">Best</span>
            <span class="value">${formatTime(set.bestTime)}</span>
          </div>

          <div class="stat-item">
            <span class="label">Last</span>
            <span class="value">${formatTime(set.lastSolveTime)}</span>
          </div>

          <div class="stat-item">
            <span class="label">Accuracy</span>
            <span class="value">
              ${
              set.averageAccuracy != null
                                ? `${Math.round(Number(set.averageAccuracy) * 100)}%`
                                : "—"
              }
            </span>
          </div>

        </div>
  
        <div class="sparkline-section">
          ${sparkline}
        </div>
      `;

  console.log("Summary Statistics Render Complete");
  summaryScreen.classList.add("active");
  // activateScreen(summaryScreen);
}

function restartPuzzleTrainer() {
  mistakes = 0;
  solved = false;
  currentStep = 0;
  ignoreMoveEvents = false;
  puzzleCount = 0;
  trackerData = [];
  puzzleTitle.textContent = "...";

  activateScreen(puzzleScreen);

  resetTimer();
  resetPuzzle();
  renderPuzzleTracker();
  updateUI()
  startTimer();
}

async function deactivateAllScreen() {
  summaryScreen.classList.remove("active");
  pauseScreen.classList.remove("active");
  puzzleScreen.classList.remove("active");
  dashboardScreen.classList.remove("active");
}

async function activateScreen(screen) {
  await deactivateAllScreen();
  screen.classList.add("active");
}

async function loadPuzzleSets() {

  puzzleSets = JSON.parse(localStorage.getItem("puzzleSets")) || [];

  puzzleSets = puzzleSets.map(set => ({
    ...set,
    accuracyArray: typeof set.accuracyArray === "string"
      ? JSON.parse(set.accuracyArray)
      : set.accuracyArray || [],
    solveTimeArray: typeof set.solveTimeArray === "string"
      ? JSON.parse(set.solveTimeArray)
      : set.solveTimeArray || []
  }));

  console.log(puzzleSets);

  renderPuzzleSetCards();
  document.querySelectorAll(".start-btn").forEach(btn => {

    btn.addEventListener("click", () => {
      startPuzzleSet(btn.dataset.setId);
    });
  
  });

}

function parseArray(value) {

  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    return JSON.parse(value);
  }
  catch {
    return [];
  }
}


function renderPuzzleSetCards() {

  const grid = document.getElementById("puzzleSetGrid");

  const formatTime = (seconds) => {
    if (seconds == null || seconds === "") return "—";

    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  grid.innerHTML = puzzleSets.map(set => {

    // const times = set.solveTimeArray || [];


    const times = Array.isArray(set.solveTimeArray)
      ? set.solveTimeArray
      : parseArray(set.solveTimeArray);

    const max = Math.max(...times, 1);
    const min = Math.min(...times, 0);



    const sparkline = times.length > 1
      ? `
        <svg class="sparkline" viewBox="0 0 100 24" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            stroke-width="0.6"
            points="${
              times.map((v, i) => {
                const x = (i / (times.length - 1)) * 100;
                const y = 22 - ((v - min) / ((max - min) || 1)) * 18;
                return `${x},${y}`;
              }).join(" ")
            }"
          />
        </svg>
      `
      : `<div class="sparkline-placeholder">—</div>`;

      return `
      <article class="puzzle-card">
    
        <div class="card-header">
          <div>
            <div class="set-id">${set.SetId}</div>
            <div class="set-meta">
              ${set.NumberPuzzle || 0} puzzles
            </div>
          </div>
    
          <div class="rating-pill">
            ${set.AverageRating || "—"}
          </div>
        </div>
    
        <div class="card-stats">
    
          <div class="stat-item">
            <span class="label">Best</span>
            <span class="value">${formatTime(set.bestTime)}</span>
          </div>
    
          <div class="stat-item">
            <span class="label">Last</span>
            <span class="value">${formatTime(set.lastSolveTime)}</span>
          </div>
    
          <div class="stat-item">
            <span class="label">Accuracy</span>
            <span class="value">
              ${
                set.averageAccuracy != null
                  ? `${Math.round(Number(set.averageAccuracy) * 100)}%`
                  : "—"
              }
            </span>
          </div>
    
        </div>
    
        <div class="sparkline-section">
          ${sparkline}
        </div>
    
        <div class="card-footer">
    
          <span class="date-text">
            ${set.lastSolveDate || "—"}
          </span>
    
          <button
            class="start-btn"
            data-set-id="${set.SetId}"
          >
            ⏵
          </button>
        </div>
    
      </article>
    `;
      

  }).join("");
  console.log("Dashboard Render Complete");
}

await loadPuzzleSets();

// localStorage.clear();
// startPuzzleSet("puzzles");