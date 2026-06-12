// src/main.js

import { SimpleChessBoard } from "@0dexz0/simple-chess-board";
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
  grid-template-columns: 50px minmax(520px,720px) 300px;
  justify-content: center;
  align-content: center;
  gap:28px;
}

.board-panel{
  height: 100%;
  background: #1f1f1f;
  border:0px solid #333;
  border-radius: 0px;
  padding:10px;
  box-shadow:0 10px 40px rgba(0,0,0,.35);
}

.card{
  width: 100%
  background:#262626;
  border:1px solid #333;
  border-radius:10px;
  padding:20px;
  display:flex;
  flex-direction:column;
  gap:16px;
  box-shadow:0 10px 40px rgba(0,0,0,.35);
}

.card2{
  width: 100%
  background:#262626;
  padding:20px 0 0 0;
  display:flex;
  flex-direction:column;
  gap:6px;
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
  border-radius:4px;
  padding:12px;
}
.puzzleCounter {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 48px;
  height: 50px;
  padding: 0 20px;

  color: #D4DFE5;
  font-size: 40px;
  font-weight: 1000;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  user-select: none;
}
.timer {
  display: flex;
  align-items: center;
  justify-content: center;

  height: 40px;
  min-width: 80px;
  padding: 0 12px;

  background: #2f2f2f;
  border: 1px solid #3d3b38;
  border-radius: 4px;

  color: #D4DFE5;
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

#dashboardScreen{
  width:100%;
  height:100%;
  overflow-y:auto;
  background:#09090b;
  color:#fafafa;
  padding:32px;
  box-sizing:border-box;
}

.dashboard-container{
  max-width:1400px;
  margin:0 auto;
}

.dashboard-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:24px;
  margin-bottom:28px;
  flex-wrap:wrap;
}

.dashboard-title{
  margin:0;
  font-size:2rem;
  font-weight:700;
  letter-spacing:-0.03em;
}

.dashboard-subtitle{
  margin-top:10px;
  max-width:700px;
  color:#a1a1aa;
  line-height:1.6;
}

.dashboard-primary-btn{
  border:none;
  cursor:pointer;
  border-radius:12px;
  background:#ffffff;
  color:#111111;
  padding:12px 18px;
  font-weight:600;
  transition:all .15s ease;
}

.dashboard-primary-btn:hover{
  transform:translateY(-1px);
}

.dashboard-stats-row{
  display:flex;
  gap:14px;
  margin-bottom:24px;
}

.dashboard-stat{
  background:#111113;
  border:1px solid #232326;
  border-radius:14px;
  padding:14px 18px;
  min-width:160px;
}

.stat-label{
  display:block;
  color:#8b8b92;
  font-size:.75rem;
  margin-bottom:4px;
}

.stat-value{
  font-size:1.2rem;
  font-weight:700;
}

.puzzle-set-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:14px;
}

.puzzle-card{
  background:#111113;
  border:1px solid #222226;
  border-radius:14px;
  padding:14px;
  display:flex;
  flex-direction:column;
  gap:12px;
  transition:all .15s ease;
}

.puzzle-card:hover{
  border-color:#333338;
  transform:translateY(-1px);
}

.card-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:12px;
}

.set-id{
  font-size:.95rem;
  font-weight:700;
  color:#fafafa;
}

.set-meta{
  margin-top:2px;
  font-size:.75rem;
  color:#71717a;
}

.rating-pill{
  padding:4px 9px;
  border-radius:999px;
  background:#18181b;
  border:1px solid #2a2a2e;
  font-size:.72rem;
  font-weight:600;
  color:#d4d4d8;
}

.card-stats{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
}

.stat-item{
  display:flex;
  flex-direction:column;
  gap:2px;
}

.stat-item .label{
  font-size:.68rem;
  color:#71717a;
  text-transform:uppercase;
  letter-spacing:.04em;
}

.stat-item .value{
  font-size:.84rem;
  font-weight:600;
  color:#fafafa;
}

.sparkline-section{
  height:100px;
  color:#60a5fa;
  justify-items: center;
}

.sparkline{
  width:90%;
  height:100%;
  display:block;
}

.sparkline-placeholder{
  color:#52525b;
  font-size:.85rem;
}

.card-footer{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-top:2px;
}

.date-text{
  font-size:.72rem;
  color:#71717a;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  max-width:140px;
}

.start-btn{
  border:none;
  background:#fafafa;
  color:#09090b;
  border-radius:8px;
  padding:7px 12px;
  font-size:.78rem;
  font-weight:600;
  cursor:pointer;
  transition:all .15s ease;
}

.start-btn:hover{
  opacity:.9;
}

@media (max-width:768px){

  #dashboardScreen{
    padding:20px;
  }

  .dashboard-header{
    flex-direction:column;
  }

  .dashboard-primary-btn{
    width:100%;
  }

  .card-metrics{
    grid-template-columns:1fr;
  }
}

.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.72);
  backdrop-filter:blur(12px);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:9999;
}

.create-set-card{
  width:520px;
  background:#05060a;
  border:1px solid #1f2230;
  border-radius:28px;
  padding:28px;
  display:flex;
  flex-direction:column;
  gap:28px;
  box-shadow:
    0 30px 80px rgba(0,0,0,.5);
}

.modal-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.modal-header h2{
  margin:0;
  color:#fff;
  font-size:28px;
  font-weight:700;
  letter-spacing:-0.03em;
}

.close-btn{
  width:40px;
  height:40px;
  border:none;
  border-radius:12px;
  background:#10131c;
  color:#9ea3b3;
  cursor:pointer;
}

.set-name-input{
  background:transparent;
  border:none;
  border-bottom:1px solid #1f2230;
  padding:10px 0;
  font-size:22px;
  color:white;
  outline:none;
}

.slider-section{
  display:flex;
  flex-direction:column;
  gap:28px;
}

.slider-row{
  display:flex;
  flex-direction:column;
  gap:14px;
}

.label{
  color:#7b8090;
  font-size:13px;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.value{
  color:white;
  font-size:24px;
  font-weight:700;
}

input[type="range"]{
  width:100%;
  accent-color:#6aa7ff;
}

.range-slider{
  position:relative;
  height:22px;
  margin-top:10px;
}

.range-slider::before{
  content:"";
  position:absolute;
  left:0;
  right:0;
  top:50%;
  transform:translateY(-50%);
  height:4px;
  background:#232632;
  border-radius:999px;
}

.range-slider input{
  position:absolute;
  inset:0;
  width:100%;
  background:none;
  appearance:none;
  -webkit-appearance:none;
  pointer-events:none;
}

.range-slider input::-webkit-slider-runnable-track{
  height:4px;
  background:transparent;
}

.range-slider input::-moz-range-track{
  height:4px;
  background:transparent;
}

.range-slider input::-webkit-slider-thumb{
  appearance:none;
  -webkit-appearance:none;
  width:16px;
  height:16px;
  border-radius:50%;
  background:#6aa7ff;
  border:none;
  pointer-events:auto;
  cursor:pointer;
  margin-top:-6px;
}

.range-slider input::-moz-range-thumb{
  width:16px;
  height:16px;
  border:none;
  border-radius:50%;
  background:#6aa7ff;
  pointer-events:auto;
  cursor:pointer;
}

.found-pill{
  align-self:flex-start;
  padding:10px 14px;
  border-radius:999px;
  background:#10131c;
  color:#8e94a6;
  font-size:13px;
}

.create-btn{
  align-self:flex-end;
  border:none;
  border-radius:18px;
  padding:16px 24px;
  background:#f4f4f5;
  color:#05060a;
  font-size:18px;
  font-weight:700;
  cursor:pointer;
  transition:.15s;
}

.create-btn:hover{
  transform:translateY(-1px);
}

`;
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

dashboardScreen.innerHTML = `
<div class="dashboard-container">

  <div class="dashboard-header">
    <div>
      <h1 class="dashboard-title">Chess Trainer</h1>
      <p class="dashboard-subtitle">
        A ChessPecker-style chess trainer focused on improving chess pattern recognition through curated puzzle sets.
      </p>
    </div>

    <button class="dashboard-primary-btn" id="createSetBtn">
      Create Puzzle Set
    </button>
    <div id="modalRoot"></div>
  </div>
  <div id="puzzleSetGrid" class="puzzle-set-grid"></div>

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
            <h2>Create Puzzle Set</h2>
            <button id="cancelCreate" class="close-btn">
              ✕
            </button>
          </div>
  
          <input
            id="setName"
            class="set-name-input"
            placeholder="Set name"
          />
  
          <div class="slider-section">
  
            <div class="slider-row">
              <div>
                <div class="label">
                  Puzzles
                </div>
  
                <div
                  class="value"
                  id="countValue"
                >
                  100
                </div>
              </div>
  
              <input
                id="puzzleCount"
                type="range"
                min="10"
                max="1000"
                value="100"
              />
            </div>
  
            <div class="slider-row">
  
              <div>
                <div class="label">
                  Rating
                </div>
  
                <div
                  class="value"
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
  
          <div
            id="foundCount"
            class="found-pill"
          >
            Calculating...
          </div>
  
          <button
            id="confirmCreate"
            class="create-btn"
          >
            Create Set
          </button>
  
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
  activateScreen(pauseScreen);
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
  activateScreen(summaryScreen);
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

  const formatExcelDate = (excelDate) => {
    if (!excelDate) return "Never solved";

    const date = new Date((excelDate - 25569) * 86400 * 1000);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit"
    });
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
            Start
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