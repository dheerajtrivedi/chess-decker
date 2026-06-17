// src/main.js

import {
  SimpleChessBoard
} from "@0dexz0/simple-chess-board";
import "./css/global.css";
import "./css/puzzles.css";
import "./css/neo_dashboard.css";
// import "./css/dashboard.css";
// import "./css/summary.css";
import "./css/neo_summary.css";
import "./css/setstat.css";

import initSqlJs from "sql.js";

const CHESS_THEMES = {
  tactics: {
      label: "Tactical Motifs",
      themes: [{
              id: "fork",
              label: "Fork"
          },
          {
              id: "pin",
              label: "Pin"
          },
          {
              id: "skewer",
              label: "Skewer"
          },
          {
              id: "xRayAttack",
              label: "X-Ray Attack"
          },
          {
              id: "discoveredAttack",
              label: "Discovered Attack"
          },
          {
              id: "discoveredCheck",
              label: "Discovered Check"
          },
          {
              id: "doubleCheck",
              label: "Double Check"
          },
          {
              id: "deflection",
              label: "Deflection"
          },
          {
              id: "attraction",
              label: "Attraction"
          },
          {
              id: "interference",
              label: "Interference"
          },
          {
              id: "clearance",
              label: "Clearance"
          },
          {
              id: "intermezzo",
              label: "Zwischenzug (Intermezzo)"
          },
          {
              id: "capturingDefender",
              label: "Remove the Defender"
          },
          {
              id: "collinearMove",
              label: "Collinear Move"
          }
      ]
  },

  attack: {
      label: "Attacking Themes",
      themes: [{
              id: "kingsideAttack",
              label: "Kingside Attack"
          },
          {
              id: "queensideAttack",
              label: "Queenside Attack"
          },
          {
              id: "attackingF2F7",
              label: "Attack on f2/f7"
          },
          {
              id: "exposedKing",
              label: "Exposed King"
          },
          {
              id: "sacrifice",
              label: "Sacrifice"
          },
          {
              id: "quietMove",
              label: "Quiet Move"
          },
          {
              id: "hangingPiece",
              label: "Hanging Piece"
          },
          {
              id: "trappedPiece",
              label: "Trapped Piece"
          }
      ]
  },

  mates: {
      label: "Checkmate Patterns",
      themes: [{
              id: "mateIn1",
              label: "Mate in 1"
          },
          {
              id: "mateIn2",
              label: "Mate in 2"
          },
          {
              id: "mateIn3",
              label: "Mate in 3"
          },
          {
              id: "mateIn4",
              label: "Mate in 4"
          },
          {
              id: "mateIn5",
              label: "Mate in 5"
          },

          {
              id: "backRankMate",
              label: "Back Rank Mate"
          },
          {
              id: "smotheredMate",
              label: "Smothered Mate"
          },
          {
              id: "anastasiaMate",
              label: "Anastasia's Mate"
          },
          {
              id: "arabianMate",
              label: "Arabian Mate"
          },
          {
              id: "bodenMate",
              label: "Boden's Mate"
          },
          {
              id: "blindSwineMate",
              label: "Blind Swine Mate"
          },
          {
              id: "balestraMate",
              label: "Balestra Mate"
          },
          {
              id: "cornerMate",
              label: "Corner Mate"
          },
          {
              id: "doubleBishopMate",
              label: "Double Bishop Mate"
          },
          {
              id: "dovetailMate",
              label: "Dovetail Mate"
          },
          {
              id: "epauletteMate",
              label: "Epaulette Mate"
          },
          {
              id: "hookMate",
              label: "Hook Mate"
          },
          {
              id: "killBoxMate",
              label: "Kill Box Mate"
          },
          {
              id: "morphysMate",
              label: "Morphy's Mate"
          },
          {
              id: "operaMate",
              label: "Opera Mate"
          },
          {
              id: "pillsburysMate",
              label: "Pillsbury's Mate"
          },
          {
              id: "swallowstailMate",
              label: "Swallow's Tail Mate"
          },
          {
              id: "triangleMate",
              label: "Triangle Mate"
          },
          {
              id: "vukovicMate",
              label: "Vuković Mate"
          }
      ]
  },

  endgames: {
      label: "Endgames",
      themes: [{
              id: "pawnEndgame",
              label: "Pawn Endgame"
          },
          {
              id: "rookEndgame",
              label: "Rook Endgame"
          },
          {
              id: "bishopEndgame",
              label: "Bishop Endgame"
          },
          {
              id: "knightEndgame",
              label: "Knight Endgame"
          },
          {
              id: "queenEndgame",
              label: "Queen Endgame"
          },
          {
              id: "queenRookEndgame",
              label: "Queen & Rook Endgame"
          },
          {
              id: "zugzwang",
              label: "Zugzwang"
          }
      ]
  },

  pawns: {
      label: "Pawn Play",
      themes: [{
              id: "advancedPawn",
              label: "Advanced Pawn"
          },
          {
              id: "promotion",
              label: "Promotion"
          },
          {
              id: "underPromotion",
              label: "Underpromotion"
          },
          {
              id: "enPassant",
              label: "En Passant"
          }
      ]
  },

  strategy: {
      label: "Strategic Themes",
      themes: [{
              id: "advantage",
              label: "Gain an Advantage"
          },
          {
              id: "equality",
              label: "Equalize"
          },
          {
              id: "crushing",
              label: "Winning Position"
          },
          {
              id: "defensiveMove",
              label: "Defensive Move"
          },
          {
              id: "castling",
              label: "Castling"
          }
      ]
  },

  phase: {
      label: "Game Phase",
      themes: [{
              id: "opening",
              label: "Opening"
          },
          {
              id: "middlegame",
              label: "Middlegame"
          },
          {
              id: "endgame",
              label: "Endgame"
          }
      ]
  },

  length: {
      label: "Puzzle Length",
      themes: [{
              id: "oneMove",
              label: "One Move"
          },
          {
              id: "short",
              label: "Short"
          },
          {
              id: "long",
              label: "Long"
          },
          {
              id: "veryLong",
              label: "Very Long"
          }
      ]
  },

  quality: {
      label: "Source Quality",
      themes: [{
              id: "master",
              label: "Master Game"
          },
          {
              id: "superGM",
              label: "Super GM Game"
          },
          {
              id: "masterVsMaster",
              label: "Master vs Master"
          }
      ]
  }
};

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
let db;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const app = document.getElementById("app");

const puzzleScreen = document.getElementById("puzzleScreen");
const summaryScreen = document.getElementById("summaryScreen");
const pauseScreen = document.getElementById("pauseScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const setStatScreen = document.getElementById("setStatScreen");


puzzleScreen.innerHTML = `
<div class="layout">
  <div class = "card2">
    <div class="puzzleCounter" id="puzzleCounter"> 1 </div>
  </div>
  <div class="board-panel">
    <div id="board"></div>
  </div>
  
  <div class = "card">
    <div class="timer" id="timer">00:00</div>
    <div class="status-row">
      <div id="sideIndicator" class="side-indicator"></div>
      <div class="subtitle" id="statusText">In Progress</div>
    </div>
    <div class="messageBox" id="messageBox">Loading puzzle...</div>

    <div class = "trackerInfo">
      <div id="puzzleTracker" class="puzzle-tracker"></div>
    </div>
    <div class="title" id="puzzleTitle">...</div>
    <div class="action-buttons">
      <button id="pauseBtn" class="small-flat-btn" title="Pause">
        <span class="material-symbols-outlined small-size">pause</span>
      </button>
      <button id="hintBtn" class="small-flat-btn" title="Hint">
        <span class="material-symbols-outlined small-size">lightbulb_2</span>
      </button>

      <button id="nextBtn" class="small-flat-btn" title="Next Puzzle">
        <span class="material-symbols-outlined small-size">keyboard_double_arrow_right</span>
      </button>
    </div>

  </div>

</div>
`;

summaryScreen.innerHTML = `
<div class = "summary-app">
<div class="summary-screen">

  <div class="summary-header">
    <h1>SUMMARY</h1>
    <button id="returnToDashboard" class="small-flat-btn">
    <span class="material-symbols-outlined small-size">
    close
    </span>
    </button>
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
    <button id="startBtn2" class="small-flat-btn">✕</button> 
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

    <button id="returnToDashboard3" class="round-btn">
      <span class="material-symbols-outlined">stop</span>
    </button>

    <button id="restartBtn2" class="round-btn">
      <span class="material-symbols-outlined">refresh</span>
    </button>
  </div>

</div>
</div>
`;

dashboardScreen.innerHTML = `
<div class = "sign"> Made by DT <span class="material-symbols-outlined very-small-icon">favorite</span> </div>
<div class="dashboard-container">

<div class="dashboard-header">
  <div>
    <h1 class="dashboard-title">Chess Ԁecker</h1>
    <p class="dashboard-subtitle">
      Master chess patterns faster with focused puzzle training and structured repetition.
    </p>
  </div>

  
  <div id="modalRoot"></div>
</div>
<div id="peckerSetGrid" class="puzzle-set-grid"></div>
<div id="puzzleSetGrid" class="puzzle-set-grid"></div>
</div>

<button class="dashboard-primary-btn" id="createPeckerSetBtn">
<span class="material-symbols-outlined">raven</span>
</button>
<button class="dashboard-primary-btn" id="createSetBtn">
+
</button>
`;

// PuzzleScreen Items
const boardContainer = document.getElementById("board");
const statusText = document.getElementById("statusText");
const sideIndicator = document.getElementById("sideIndicator");
const messageBox = document.getElementById("messageBox");
const puzzleCounter = document.getElementById("puzzleCounter");
const puzzleTitle = document.getElementById("puzzleTitle");
const timerEl = document.getElementById("timer");
// Statistics Screen Items
const statTimeTaken = document.getElementById("statTimeTaken");
const statCorrect = document.getElementById("statCorrect");
const statIncorrect = document.getElementById("statIncorrect");
const statSkipped = document.getElementById("statSkipped");
//Pause Screen Items
const pauseTimeTaken = document.getElementById("pauseTimeTaken");
const pauseCorrect = document.getElementById("pauseCorrect");
const pauseIncorrect = document.getElementById("pauseIncorrect");
const pauseSkipped = document.getElementById("pauseSkipped");


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


  const puzzleSets_complete = JSON.parse(localStorage.getItem("puzzleSets")) || [];
  const row = puzzleSets_complete.find(r => r.SetId === currentSetId);

  if (row.isPaused) {
      puzzleCount = row.pausedAt;
      elapsedSeconds = row.pausedTime;
      trackerData = row.pausedSolveTracker;

  } else {
      if (row.pecker) {
          const now = new Date();
          console.log(now);
          row.cycle_start_date = now;
      }
  }
  row.isPaused = 1;
  localStorage.setItem("puzzleSets", JSON.stringify(puzzleSets_complete));

  puzzles = await loadPuzzles(setID);

  updateTimerDisplay();
  renderPuzzleTracker();
  resetPuzzle();
  startTimer();
  return;
}

/** Loads lichess-puzzle.db into db */
async function initPuzzleDB() {
  const SQL = await initSqlJs({
      locateFile: () => "/sql-wasm.wasm"
  });

  const response = await fetch("/lichess-puzzles.db");
  const buffer = await response.arrayBuffer();

  db = new SQL.Database(new Uint8Array(buffer));
}

// UI RELATED FUNCTIONS:
async function deactivateAllScreen() {
  summaryScreen.classList.remove("active");
  pauseScreen.classList.remove("active");
  puzzleScreen.classList.remove("active");
  dashboardScreen.classList.remove("active");
  setStatScreen.classList.remove("active");
}

async function activateScreen(screen) {
  await deactivateAllScreen();
  screen.classList.add("active");
}

//dashboardScreen Functions:
/** Renders overlay modal to create Woodpecker Style Puzzle Set */
async function openPeckerSetModal() {

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
        <h2 class = "pecker">CREATE WOODPEKCER STYLE SET</h2>
        <button id="cancelCreate" class="small-flat-btn">
          <span class="material-symbols-outlined small-size">
          close
          </span>
        </button>
      </div>

      <input
        id="pecker-setName"
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
            id="pecker-puzzleCount"
            type="range"
            min="300"
            max="2000"
            value="500"
            step="20"
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
              id="pecker-minRating"
              type="range"
              min="700"
              max="2850"
              value="1200"
              step="50"
            />

            <input
              id="pecker-maxRating"
              type="range"
              min="700"
              max="2850"
              value="1800"
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
      document.getElementById("pecker-puzzleCount");

  const minSlider =
      document.getElementById("pecker-minRating");

  const maxSlider =
      document.getElementById("pecker-maxRating");

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
          createPeckerSet
      );
}

/** Renders overlay modal to create Normal Puzzle Set */
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
          <button id="cancelCreate" class="small-flat-btn">
            <span class="material-symbols-outlined small-size">
            close
            </span>
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
              step="5"
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
                min="700"
                max="2850"
                value="1200"
                step="50"
              />

              <input
                id="maxRating"
                type="range"
                min="700"
                max="2850"
                value="1800"
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

/** Creates a new normal puzzle set, setName, puzzleCount, minRating, MaxRating extracted from overlay modal */
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
      pecker: 0,

      lastSolveTime: null,
      bestTime: null,
      lastSolveDate: null,
      averageAccuracy: null,
      isPaused: 0,
      pausedAt: 0,
      pausedTime: 0,
      pausedSolveTrackerArray: [],
      accuracyArray: [],
      solveTimeArray: []
  };

  // -------------------------
  // Update puzzleSets
  // -------------------------
  let puzzleSets = [];
  console.log(localStorage.getItem('puzzleSets'));
  if (localStorage.getItem('puzzleSets') != 'undefined' && localStorage.getItem('puzzleSets') != null) {
      puzzleSets =
          JSON.parse(localStorage.getItem("puzzleSets"));
  }
  console.log(puzzleSets);
  let existingIndex = -1;
  if (puzzleSets) {
      existingIndex =
          puzzleSets.findIndex(
              s => s.SetId === name
          );
  }

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

/** Creates a new woodpecker style puzzle set, setName, puzzleCount, minRating, MaxRating extracted from overlay modal */
async function createPeckerSet() {

  const name = document.getElementById("pecker-setName").value.trim();

  if (!name) {
      alert("Enter a set name");
      return;
  }

  const count =
      Number(document.getElementById("pecker-puzzleCount").value);

  const minRating =
      Number(document.getElementById("pecker-minRating").value);

  const maxRating =
      Number(document.getElementById("pecker-maxRating").value);

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

  const storageKey = `puzzles_${name}`;

  localStorage.setItem(
      storageKey,
      JSON.stringify(puzzles)
  );

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
      pecker: 1,
      cycle: 1,
      cycle_start_date: null,
      lastSolveTime: null,
      bestTime: null,
      lastSolveDate: null,
      averageAccuracy: null,
      isPaused: 0,
      pausedAt: 0,
      pausedTime: 0,
      cycleTimeArray: [],
      pausedSolveTrackerArray: [],
      accuracyArray: [],
      solveTimeArray: []
  };
  let puzzleSets = [];
  console.log(localStorage.getItem('puzzleSets'));
  if (localStorage.getItem('puzzleSets') != 'undefined' && localStorage.getItem('puzzleSets') != null) {
      puzzleSets =
          JSON.parse(localStorage.getItem("puzzleSets"));
  }
  console.log(puzzleSets);
  let existingIndex = -1;
  if (puzzleSets) {
      existingIndex =
          puzzleSets.findIndex(
              s => s.SetId === name
          );
  }

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

//puzzleScreen Functions:
/** Returns Puzzle Set with puzzle setid as setID*/
async function loadPuzzles(setID) {
  const storageKey = `puzzles_${setID}`;

  // Check localStorage first
  const cached = localStorage.getItem(storageKey);
  if (cached) {
      return JSON.parse(cached);
  }

  // Save JSON to localStorage
  localStorage.setItem(storageKey, JSON.stringify(rows));

  return rows;
}

/** Returns the puzzle move for the global PUZZLE*/
function getPuzzleMoves() {
  return PUZZLE.moves
      .trim()
      .split(/\s+/)
      .filter(Boolean);
}

/** Returns the total steps for the global PUZZLE*/
function getTotalSteps() {
  return getPuzzleMoves().length;
}

/** Returns the indexed move for the global PUZZLE along with move/auto detail*/
function getStep(index) {
  const moves = getPuzzleMoves();

  return {
      move: moves[index],
      side: index % 2 === 0 ? "auto" : "user"
  };
}

/** Returns the expected puzzle move for the global PUZZLE*/
function getExpectedMove() {
  return getStep(currentStep)?.move;
}

/** Parses "moves" and splits it into from and to*/
function splitMove(move) {
  return {
      from: move.slice(0, 2),
      to: move.slice(2, 4),
      promotion: move.length > 4 ? move[4] : undefined
  };
}

/** Plays the "move" on board*/
function executeMove(move) {
  const {
      from,
      to,
      promotion
  } = splitMove(move);

  board.executeMove(
      from,
      to,
      true,
      promotion
  );
}

/** Sets "text" to messageBox container*/
function setMessage(text) {
  messageBox.textContent = text;
}

/** Used to puzzleScreen UI*/
function updateUI() {
  puzzleTitle.textContent = PUZZLE.title;

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

/** Plays move automatically*/
async function playAutomaticMove(move) {
  ignoreMoveEvents = true;

  executeMove(move);

  ignoreMoveEvents = false;
}

/** Advances Puzzles*/
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

/** Loads puzzle with index "puzzleCount" to PUZZLE*/
function loadCurrentPuzzle() {
  let title = puzzles[puzzleCount].Rating;
  let fen = puzzles[puzzleCount].FEN;
  let moves = puzzles[puzzleCount].Moves;
  let sideToMove = fen.split(" ")[1] === "w" ? "b" : "w";
  PUZZLE.title = title;
  PUZZLE.fen = fen;
  PUZZLE.moves = moves;
  PUZZLE.sideToMove = sideToMove;
}

/** Ends puzzle trainer and updates all the DB*/
async function endPuzzleTrainer() {
  let timeTaken = stopTimer();

  setMessage(`Solved in ${timeTaken}`);
  board.flipBoard('w');
  board.setPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  puzzleCounter.textContent = "!!";

  const setStats = JSON.parse(localStorage.getItem("puzzleSets")) || [];

  const row = setStats.find(r => r.SetId === currentSetId);

  const accuracy = trackerData.filter(x => x.status === "correct").length / trackerData.length;
  const solveTime = timeTaken.split(":").reduce((m, s) => m * 60 + +s);

  if (row) {
      row.lastSolveTime = solveTime;
      row.bestTime = row.bestTime ? Math.min(row.bestTime, solveTime) : solveTime;
      row.lastSolveDate = new Date().toLocaleDateString("en-GB");

      row.pausedAt = 0;
      row.isPaused = 0;
      row.pausedTime = 0;
      row.pausedSolveTracker = [];

      const accuracyArr = row.accuracyArray || [];
      const timeArr = row.solveTimeArray || [];

      accuracyArr.push(accuracy);
      timeArr.push(solveTime);

      row.accuracyArray = accuracyArr;
      row.solveTimeArray = timeArr;

      row.averageAccuracy =
          accuracyArr.reduce((a, b) => a + b, 0) / accuracyArr.length;
  }

  if (row.pecker) {
      const startDate = new Date(row.cycle_start_date);
      const endDate = new Date();

      const msLeft = endDate - startDate;

      const days = Math.floor(msLeft / 86400000);
      const hours = Math.floor((msLeft % 86400000) / 3600000);

      const cycletimeTaken =
          msLeft > 0 ?
          `${days}d ${hours}h` :
          "ERROR";
      const cycleTimeArr = row.cycleTimeArray || [];
      cycleTimeArr.push(cycletimeTaken);

      row.cycleTimeArray = cycleTimeArr;
      row.cycle_start_date = null;
      row.cycle++;
  }

  localStorage.setItem("puzzleSets", JSON.stringify(setStats));

  await sleep(700);
  showSummary(timeTaken);
  return;
}

/** Main Puzzle Logic is here. Reset's the board with the puzzle*/
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

/** Marks arrow on the board for the next correct move */
function showHint() {
  if (solved) return;
  tookHint = 1;
  board.clearMarks("persistent");

  const move = getExpectedMove();

  if (!move) return;

  const {
      from,
      to
  } = splitMove(move);

  board.renderMarkArrow(
      "persistent",
      from,
      to, {
          color: "#00d4ff",
          opacity: 0.9
      }
  );
}

/** Pauses puzzle trainer and renders pauseScreen overlay*/
function pausePuzzleTrainer() {
  ignoreMoveEvents = true;
  let timeTaken = stopTimer();

  const puzzleSets = JSON.parse(localStorage.getItem("puzzleSets")) || [];
  const row = puzzleSets.find(r => r.SetId === currentSetId);
  if (row) {
      row.isPaused = 1;
      row.pausedAt = puzzleCount;
      row.pausedTime = elapsedSeconds;
      row.pausedSolveTracker = trackerData;
      localStorage.setItem("puzzleSets", JSON.stringify(puzzleSets));
  }
  pauseTimeTaken.textContent = timeTaken;
  pauseCorrect.textContent = trackerData.filter(item => item.status === "correct").length;
  pauseIncorrect.textContent = trackerData.filter(item => item.status === "wrong").length;
  pauseSkipped.textContent = trackerData.filter(item => item.status === "skipped").length;

  pauseScreen.classList.add("active");
  // activateScreen(pauseScreen);
}

/** Resumes puzzle trainer and hides pauseScreen overlay*/
function resumePuzzleTrainer() {
  ignoreMoveEvents = false;
  activateScreen(puzzleScreen);
  startTimer();
}
/** Renders Puzzle Tracker */
function renderPuzzleTracker() {
  console.log(trackerData.length);
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
  if (mistakes > 0) {
    trackerData.push({
        rating: puzzles[puzzleCount].Rating,
        status: "wrong"
    });
  }
  else {
      trackerData.push({
        rating: puzzles[puzzleCount].Rating,
        status: "skipped"
    });
  }
  renderPuzzleTracker();
  puzzleCount++;

  const puzzleSets = JSON.parse(localStorage.getItem("puzzleSets")) || [];
  const row = puzzleSets.find(r => r.SetId === currentSetId);
  if (row) {
      row.pausedAt = puzzleCount;
      row.pausedTime = elapsedSeconds;
      row.pausedSolveTracker = trackerData;
      localStorage.setItem("puzzleSets", JSON.stringify(puzzleSets));
  }
  resetPuzzle();
}

function nextPuzzle() {
  if (mistakes === 0 && tookHint == 0) { 
    trackerData.push({
        rating: puzzles[puzzleCount].Rating,
        status: "correct"
    });
  } 
  else if(mistakes === 0 && tookHint >= 0) {
    trackerData.push({
      rating: puzzles[puzzleCount].Rating,
      status: "skipped"
    });
  } 
  else { 
    trackerData.push({
        rating: puzzles[puzzleCount].Rating,
        status: "wrong"
    });
  }

  puzzleCount++;
  const puzzleSets = JSON.parse(localStorage.getItem("puzzleSets")) || [];
  const row = puzzleSets.find(r => r.SetId === currentSetId);

  if (row) {
      row.pausedAt = puzzleCount;
      row.pausedTime = elapsedSeconds;
      row.pausedSolveTracker = trackerData;
      localStorage.setItem("puzzleSets", JSON.stringify(puzzleSets));
  }

  renderPuzzleTracker();
  resetPuzzle();
}


// Timer Functions
/** Renders Timer Display with elapsed Seconds */
function updateTimerDisplay() {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  timerEl.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Starts Timer */
function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
      elapsedSeconds++;
      updateTimerDisplay();
  }, 1000);
}

/** Stops Timer and returns time elapsed in mm:ss */
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Resets Timer and Stops Timer */
function resetTimer() {
  stopTimer();
  elapsedSeconds = 0;
  updateTimerDisplay();
}

/** Renders Summary Screen */
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

  const times = Array.isArray(set.solveTimeArray) ?
      set.solveTimeArray :
      parseArray(set.solveTimeArray);

  const max = Math.max(...times, 1);
  const min = Math.min(...times, 0);


  const sparkline = times.length > 1 ?
      `
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
      ` :
      `<div class="sparkline-placeholder">—</div>`;

  overallStat.innerHTML = `
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

/** Restarts Puzzle Trainer */
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

/** Loads puzzle set and reders dashboardScreen*/
async function loadPuzzleSets() {

  puzzleSets = JSON.parse(localStorage.getItem("puzzleSets") || '[]');

  puzzleSets = puzzleSets.map(set => ({
      ...set,
      accuracyArray: typeof set.accuracyArray === "string" ?
          JSON.parse(set.accuracyArray) :
          set.accuracyArray || [],
      solveTimeArray: typeof set.solveTimeArray === "string" ?
          JSON.parse(set.solveTimeArray) :
          set.solveTimeArray || []
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
  } catch {
      return [];
  }
}

/** Renders all set cards in the dashboardScreen*/
function renderPuzzleSetCards() {

  const pecker_grid = document.getElementById("peckerSetGrid");

  const grid = document.getElementById("puzzleSetGrid");

  const formatTime = (seconds) => {
      if (seconds == null || seconds === "") return "—";

      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);

      return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  pecker_grid.innerHTML = puzzleSets.map(set => {
      if (set.pecker) {
          console.log(set);

          const times = Array.isArray(set.solveTimeArray) ?
              set.solveTimeArray :
              parseArray(set.solveTimeArray);

          const max = Math.max(...times, 1);
          const min = Math.min(...times, 0);

          let timeLeftString = "Not Started";

          if (set.cycle > 5) {
              timeLeftString = "<span class = 'mastery'> MASTERY </span>"
          }

          if (set.cycle_start_date != null && set.cycle <= 5) {
              let daysBetween = 0;

              if (set.cycle === 1) daysBetween = 28;
              else if (set.cycle === 2) daysBetween = 14;
              else if (set.cycle === 3) daysBetween = 7;
              else if (set.cycle === 4) daysBetween = 3;
              else if (set.cycle === 5) daysBetween = 1;

              const startDate = new Date(set.cycle_start_date);
              const endDate = new Date(startDate.getTime() + daysBetween * 24 * 60 * 60 * 1000);

              const msLeft = endDate - new Date();

              const days = Math.floor(msLeft / 86400000);
              const hours = Math.floor((msLeft % 86400000) / 3600000);

              timeLeftString =
                  msLeft > 0 ?
                  `${days}d ${hours}h left` :
                  "OVERDUE";
          }
          return `
      <article class="pecker puzzle-card" >
    
        <div class="card-header" data-setId="${set.SetId}">
          <div>
            <div class="set-id">${set.SetId}</div>
            <div class="set-meta">
              ${set.NumberPuzzle || 0} puzzles
            </div>
          </div>
          <div class="woodpecker set-id">WOODPECKER SET</div>
          <div class="rating-pill">
            ${set.AverageRating || "—"}
          </div>
        </div>
    
        <div class="card-stats">
    
          <div class="stat-item">
            <span class="label">Cycle</span>
            <span class="value">${set.cycle}</span>
          </div>
    
          <div class="stat-item">
            <span class="label">Time Left</span>
            <span class="value">${timeLeftString}</span>
          </div>
    
          <div class="stat-item">
            <span class="label">Accuracy</span>
            <span class="value">
              ${Math.round(Number(set.averageAccuracy) * 100)}%
            </span>
          </div>
    
        </div>
        <div class="woodpecker-section-header"> <span class = "set-id"> ATTEMPTS: <span> </div>
        <div class="woodpecker-section">
          <div id = "attempt1" class = "woodpecker-section-item">
            <div class="stat-item pecker">
              <span class="label">Attempt 1</span>
              <span class="value pecker">${set.cycleTimeArray[0] || '-'}</span>
              <span class="value pecker">${Math.round(Number(set.accuracyArray[0])*100) || '~ '}%</span>
              <span class="value pecker highlight">4 WEEKS CYCLE</span>
            </div>
          </div>
          <div id = "attempt2" class = "woodpecker-section-item">
            <div class="stat-item pecker">
              <span class="label">Attempt 2</span>
              <span class="value pecker">${set.cycleTimeArray[1] || '-'}</span>
              <span class="value pecker">${Math.round(Number(set.accuracyArray[1])*100) || '~ '}%</span>
              <span class="value pecker highlight">2 WEEKS CYCLE</span>
            </div>
          </div>
          <div id = "attempt3" class = "woodpecker-section-item">
            <div class="stat-item pecker">
              <span class="label">Attempt 3</span>
               <span class="value pecker">${set.cycleTimeArray[2] || '-'}</span>
              <span class="value pecker">${Math.round(Number(set.accuracyArray[2])*100) || '~ '}%</span>
              <span class="value pecker highlight">1 WEEK CYCLE</span>
            </div>
          </div>
          <div id = "attempt4" class = "woodpecker-section-item">
            <div class="stat-item pecker">
              <span class="label">Attempt 4</span>
              <span class="value pecker">${set.cycleTimeArray[3] || '-'}</span>
              <span class="value pecker">${Math.round(Number(set.accuracyArray[3])*100) || '~ '}%</span>
              <span class="value pecker highlight">3 DAYS CYCLE</span>
            </div>
          </div>
            
          <div id = "attempt5" class = "woodpecker-section-item">
            <div class="stat-item pecker">
              <span class="label">Attempt 5</span>
              <span class="value pecker">${set.cycleTimeArray[4] || '-'}</span>
              <span class="value pecker">${Math.round(Number(set.accuracyArray[4])*100) || '~ '}%</span>
              <span class="value pecker highlight">1 DAY CYCLE</span>
            </div>
          </div>
        </div>
    
        <div class="card-footer">
    
          <span class="date-text">
            ${set.lastSolveDate || "—"}
          </span>

          <span class="date-text">
            ${set.isPaused?"PAUSED":"-"}
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
      }
  }).join("");

  grid.innerHTML = puzzleSets.map(set => {
      if (!set.pecker) {
          const times = Array.isArray(set.solveTimeArray) ?
              set.solveTimeArray :
              parseArray(set.solveTimeArray);

          const max = Math.max(...times, 1);
          const min = Math.min(...times, 0);

          const sparkline = times.length > 1 ?
              `
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
      ` :
              `<div class="sparkline-placeholder">—</div>`;

          return `
      <article class="puzzle-card" >
    
        <div class="card-header" data-setId="${set.SetId}">
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

          <span class="date-text">
            ${set.isPaused?"PAUSED":"-"}
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
      }

  }).join("");

  document.querySelectorAll(".card-header").forEach(card => {
      card.addEventListener("click", () => {
          console.log(card.dataset.setid);
          renderSetStatistics(card.dataset.setid);
      });

  });

  console.log("Dashboard Render Complete");
}

/** Renders set statistics overlay in the dashboardScreen*/
function renderSetStatistics(setID) {
  console.log(setID);
  const themeMap = Object.values(CHESS_THEMES).flatMap(category => category.themes).reduce((map, theme) => ({
          ...map,
          [theme.id]: theme.label
      }), {});

  setStatScreen.classList.add("active")
  // activateScreen(setStatScreen)
  const puzzleSets =
      JSON.parse(localStorage.getItem("puzzleSets")) || [];

  const puzzles =
      JSON.parse(localStorage.getItem(`puzzles_${setID}`)) || [];

  console.log(typeof puzzles[0].Themes);
  console.log(puzzles[0].Themes);

  const set =
      puzzleSets.find(
          (s) => String(s.SetId) === String(setID)
      );

  if (!set) {
      setStatScreen.innerHTML = `<div>Set not found</div>`;
      return;
  }

  const avgRating = set.AverageRating ?? 0;
  const puzzleCount = set.NumberPuzzle ?? puzzles.length;
  const averageAccuracy = set.averageAccuracy;

  const accuracyArray = set.accuracyArray || [];
  const solveTimeArray = set.solveTimeArray || [];

  const lastThree = accuracyArray
      .map((acc, i) => ({
          accuracy: Math.round(acc * 100),
          time: solveTimeArray[i],
          attempt: i + 1,
          })).slice(-3).reverse();

  const bestIndex = accuracyArray.length ?accuracyArray.indexOf(Math.max(...accuracyArray)) : -1;

  const bestSolve =
      bestIndex >= 0 ?
      {
          time: solveTimeArray[bestIndex],
          accuracy: Math.round(
              (accuracyArray[bestIndex] || 0) * 100
          ),
          attempt: bestIndex + 1,
      } :
      null;

  const fastIndex =
      solveTimeArray.length ?
      solveTimeArray.indexOf(
          Math.min(...solveTimeArray)
      ) :
      -1;

  const fastSolve =
      fastIndex >= 0 ?
      {
          time: solveTimeArray[fastIndex],
          accuracy: Math.round(
              (accuracyArray[fastIndex] || 0) * 100
          ),
          attempt: fastIndex + 1,
      } :
      null;

  const graphData = accuracyArray.map((acc, i) => ({
      attempt: i + 1,
      accuracy: Math.round(acc * 100),
      time: solveTimeArray[i] ?? null,
  }));

  setStatScreen.innerHTML = `
  <div class="modal-overlay">
    
    <div class="setStatistics">
      <div class="modal-header">
        <div>
            <div class="set-id">${set.SetId}</div>
            <div class="set-meta">${puzzleCount} Puzzles</div>
        </div>
        <button id="returnToDashboard2" class="small-flat-btn">
          <span class="material-symbols-outlined small-size">
            close
          </span>
        </button>
      </div>
      <div class = "twocol-setstat">
        <div class ="stats-section">
          <div class="setstat-card">
              <div class="stat-item">
                  <div class="label">Accuracy</div>
                  <div class="value">
                      ${
                          averageAccuracy != null
                          ? `${Math.round(
                              averageAccuracy * 100
                              )}%`
                          : "-"
                      }
                  </div>
              </div>

              <div class="stat-item">
                  <div class="label">Rating</div>
                  <div class="value">${avgRating}</div>
              </div>

              <div class="stat-item">
                  <div class="label">Cycles</div>
                  <div class="value">${solveTimeArray.length}</div>
              </div>

              <div class="stat-item">
                  <div class="label">Last Solve</div>
                  <div class="value">
                      ${set.lastSolveDate ?? "-"}
                  </div>
              </div>

          </div>  
          <div class="setstat-card">
            <div class = "setstat-solve-card">
              <div class="setstat-solve-title">
                <div class="set-id">Last Three Solves</div>
              </div>

              <div class="card-stats">

                  ${
                      lastThree.length
                      ? lastThree
                          .map(
                              (s) => `
                              <div class="stat-item">
                                  <div class = "label">Attempt #${s.attempt}</div>
                                  <div class = "value"><span class="material-symbols-outlined small-icon">target</span>: ${s.accuracy}%</div>
                                  <div class = "value"><span class="material-symbols-outlined small-icon">timer</span>: ${s.time}s</div>
                              </div>
                              `
                          )
                          .join("")
                      : `<div class="emptyState">No solves yet</div>`
                  }

              </div>
            </div>
            <div class = "setstat-solve-card">
              <div class="setstat-solve-title"">

                  <div class="set-id">
                      Best Solve
                  </div>

              </div>

              <div class="card-stats best-solve">

                      ${
                      bestSolve
                          ? `
                              <div class="stat-item">
                                <div class = "label">Attempt #${bestSolve.attempt}</div>
                                <div class = "value highlight"><span class="material-symbols-outlined small-icon">target</span>: ${bestSolve.accuracy}%</div>
                                <div class = "value"><span class="material-symbols-outlined small-icon">timer</span>: ${bestSolve.time}s</div>
                              </div>
                          `
                          : `<div class="emptyState">No solves yet</div>`
                      }

                      ${
                        fastSolve
                            ? `
                                <div class="stat-item">
                                  <div class = "label">Attempt #${fastSolve.attempt}</div>
                                  <div class = "value"><span class="material-symbols-outlined small-icon">target</span>: ${fastSolve.accuracy}%</div>
                                  <div class = "value highlight"><span class="material-symbols-outlined small-icon">timer</span>: ${fastSolve.time}s</div>
                                </div>
                            `
                            : `<div class="emptyState">No solves yet</div>`
                        }

              </div>
            </div>
          </div>

          <div class="stats-chart-container">

              <div class="setstat-solve-title"">

                  <div class="set-id">
                      Accuracy & Time
                  </div>

              </div>

              <canvas
              id="setStatisticsChart"
              class="statisticsChart"
              ></canvas>

          </div>

        </div>
        <div class="puzzleTable">
            <div class="table-title">Puzzle List </div>
            <div class="table-head">
                <div class="table-head-row">
                  <div>#</div>
                  <div>Rating</div>
                  <div>Themes</div>
                </div>
            </div>    

            <div class = "table-body">

                ${puzzles
                .map(
                    (p, index) => `
                    <div
                        class="table-row"
                        data-puzzleid="${p.PuzzleId}"
                    >
                        <div>${index+1}</div>
                        <div>${p.Rating}</div>
                        <div class="setstat-theme-card">${ JSON.parse(p.Themes).map(id => `<div class="themeItem">${themeMap[id] || id}</div>`).join("") || ""} </div>
                    </div>
                    `
                )
                .join("")}

            </div>

        </div>
      </div>
      <div class ="modal-footer">
          <button
            id="deleteset-btn"
            class="round-btn delete"
          >
            <span class="material-symbols-outlined">
              delete
            </span>
          </button>
          <button
            id="start-btn2"
            class = "round-btn"
            data-set-id="${set.SetId}"
          >
            <span class="material-symbols-outlined">
              play_arrow
            </span>
          </button>
          
        </div>
    </div>
  </div>
`;

  console.log(set.SetId);

  document.getElementById("returnToDashboard2").addEventListener("click", returnToDashboard);
  document.getElementById("start-btn2").addEventListener("click", () => {
      startPuzzleSet(set.SetId)
  });
  document.getElementById("deleteset-btn").addEventListener("click", () => {
      deleteSet(set.SetId)
  });

  if (
      typeof Chart !== "undefined" &&
      graphData.length
  ) {
      const ctx =
          document
          .getElementById("setStatisticsChart")
          .getContext("2d");


      Chart.defaults.font.family = "'Montserrat', sans-serif";

      new Chart(ctx, {
          type: "line",
          data: {
              labels: graphData.map(
                  (d) => d.attempt
              ),
              datasets: [{
                      label: "Accuracy %",
                      data: graphData.map(
                          (d) => d.accuracy
                      ),
                      yAxisID: "accuracy",
                      tension: 0,
                  },
                  {
                      label: "Solve Time (s)",
                      data: graphData.map(
                          (d) => d.time
                      ),
                      yAxisID: "time",
                      tension: 0,
                  },
              ],
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                  padding: {
                      top: 0,
                  },
              },
              plugins: {
                  legend: {
                      position: 'top',
                      align: 'center',
                      labels: {
                          boxWidth: 10,
                          font: {
                              family: "'Montserrat', sans-serif",
                              size: 12
                          }
                      }
                  }
              },
              elements: {
                  line: {
                      borderWidth: 2,
                  },
                  point: {
                      radius: 2,
                  },
              },
              interaction: {
                  mode: "index",
                  intersect: false,
              },
              scales: {
                  accuracy: {
                      type: "linear",
                      position: "left",
                      // min: 0,
                      // max: 100,
                      ticks: {
                          font: {
                              family: "'Montserrat', sans-serif",
                              size: 12,
                          },
                      },
                      title: {
                          display: true,
                          text: "Accuracy %",
                      },
                      grid: {
                          lineWidth: 0,
                      },
                  },
                  time: {
                      type: "linear",
                      position: "right",
                      grid: {
                          drawOnChartArea: false,
                      },
                      ticks: {
                          font: {
                              family: "'Montserrat', sans-serif",
                              size: 12,
                          },
                      },
                      title: {
                          display: true,
                          text: "Time (s)",
                      },
                      ticks: {
                          font: {
                              family: "'Montserrat', sans-serif",
                              size: 10,
                          },
                      },
                      grid: {
                          lineWidth: 0,
                      },

                  },
                  x: {
                      ticks: {
                          font: {
                              family: "'Montserrat', sans-serif",
                              size: 10,
                          },
                      },
                      grid: {
                          lineWidth: 0,
                      },
                  }
              },
          },
      });
  }

  document
      .querySelectorAll(".table-row")
      .forEach((row) => {
          row.addEventListener("click", () => {
              const url = new URL("puzzle.html", window.location.origin);
              url.searchParams.set("puzzleId", row.dataset.puzzleid);
              window.open(url.toString(), "_blank");
          });
      });
}

/** Deletes a set*/
function deleteSet(setId) {
  if (!confirm(`Delete set "${setId}"?`)) {
      return;
  }

  // Remove puzzle list
  localStorage.removeItem(`puzzles_${setId}`);

  // Remove set entry from puzzleSets
  const puzzleSets =
      JSON.parse(localStorage.getItem("puzzleSets")) || [];

  const updatedSets = puzzleSets.filter(
      (set) => String(set.SetId) !== String(setId)
  );

  localStorage.setItem(
      "puzzleSets",
      JSON.stringify(updatedSets)
  );
  returnToDashboard();

}

/** Navigates back to Dashboard*/
function returnToDashboard() {
  loadPuzzleSets();
  activateScreen(dashboardScreen);
}

// STARTS HERE:

await initPuzzleDB();

board = new SimpleChessBoard({
  container: boardContainer,
  style: {
      board: {
          color1: '#D4DFE5',
          color2: '#799CB1'
      }
  },
  position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  playerColor: "w",
  orientation: "w",
  interactivity: {
      enabled: true
  }
});

board.on("move:end", async ({
  move
}) => {
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

await loadPuzzleSets();

document
  .getElementById("createSetBtn")
  .addEventListener("click", openPuzzleSetModal);

document
  .getElementById("createPeckerSetBtn")
  .addEventListener("click", openPeckerSetModal);

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
  .getElementById("returnToDashboard3")
  .addEventListener("click", returnToDashboard);

document
  .getElementById("startBtn")
  .addEventListener("click", resumePuzzleTrainer);
