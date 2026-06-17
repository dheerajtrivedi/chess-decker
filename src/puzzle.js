// src/puzzle.js

import { SimpleChessBoard } from "@0dexz0/simple-chess-board";
import "./css/global.css";
import "./css/puzzles.css";
import "./css/one_puzzle.css";
import initSqlJs from "sql.js";

const params = new URLSearchParams(window.location.search);
const puzzleId = params.get("puzzleId");

console.log(puzzleId)

const CHESS_THEMES = {
  tactics: {
    label: "Tactical Motifs",
    themes: [
      { id: "fork", label: "Fork" },
      { id: "pin", label: "Pin" },
      { id: "skewer", label: "Skewer" },
      { id: "xRayAttack", label: "X-Ray Attack" },
      { id: "discoveredAttack", label: "Discovered Attack" },
      { id: "discoveredCheck", label: "Discovered Check" },
      { id: "doubleCheck", label: "Double Check" },
      { id: "deflection", label: "Deflection" },
      { id: "attraction", label: "Attraction" },
      { id: "interference", label: "Interference" },
      { id: "clearance", label: "Clearance" },
      { id: "intermezzo", label: "Zwischenzug (Intermezzo)" },
      { id: "capturingDefender", label: "Remove the Defender" },
      { id: "collinearMove", label: "Collinear Move" }
    ]
  },

  attack: {
    label: "Attacking Themes",
    themes: [
      { id: "kingsideAttack", label: "Kingside Attack" },
      { id: "queensideAttack", label: "Queenside Attack" },
      { id: "attackingF2F7", label: "Attack on f2/f7" },
      { id: "exposedKing", label: "Exposed King" },
      { id: "sacrifice", label: "Sacrifice" },
      { id: "quietMove", label: "Quiet Move" },
      { id: "hangingPiece", label: "Hanging Piece" },
      { id: "trappedPiece", label: "Trapped Piece" }
    ]
  },

  mates: {
    label: "Checkmate Patterns",
    themes: [
      { id: "mateIn1", label: "Mate in 1" },
      { id: "mateIn2", label: "Mate in 2" },
      { id: "mateIn3", label: "Mate in 3" },
      { id: "mateIn4", label: "Mate in 4" },
      { id: "mateIn5", label: "Mate in 5" },

      { id: "backRankMate", label: "Back Rank Mate" },
      { id: "smotheredMate", label: "Smothered Mate" },
      { id: "anastasiaMate", label: "Anastasia's Mate" },
      { id: "arabianMate", label: "Arabian Mate" },
      { id: "bodenMate", label: "Boden's Mate" },
      { id: "blindSwineMate", label: "Blind Swine Mate" },
      { id: "balestraMate", label: "Balestra Mate" },
      { id: "cornerMate", label: "Corner Mate" },
      { id: "doubleBishopMate", label: "Double Bishop Mate" },
      { id: "dovetailMate", label: "Dovetail Mate" },
      { id: "epauletteMate", label: "Epaulette Mate" },
      { id: "hookMate", label: "Hook Mate" },
      { id: "killBoxMate", label: "Kill Box Mate" },
      { id: "morphysMate", label: "Morphy's Mate" },
      { id: "operaMate", label: "Opera Mate" },
      { id: "pillsburysMate", label: "Pillsbury's Mate" },
      { id: "swallowstailMate", label: "Swallow's Tail Mate" },
      { id: "triangleMate", label: "Triangle Mate" },
      { id: "vukovicMate", label: "Vuković Mate" }
    ]
  },

  endgames: {
    label: "Endgames",
    themes: [
      { id: "pawnEndgame", label: "Pawn Endgame" },
      { id: "rookEndgame", label: "Rook Endgame" },
      { id: "bishopEndgame", label: "Bishop Endgame" },
      { id: "knightEndgame", label: "Knight Endgame" },
      { id: "queenEndgame", label: "Queen Endgame" },
      { id: "queenRookEndgame", label: "Queen & Rook Endgame" },
      { id: "zugzwang", label: "Zugzwang" }
    ]
  },

  pawns: {
    label: "Pawn Play",
    themes: [
      { id: "advancedPawn", label: "Advanced Pawn" },
      { id: "promotion", label: "Promotion" },
      { id: "underPromotion", label: "Underpromotion" },
      { id: "enPassant", label: "En Passant" }
    ]
  },

  strategy: {
    label: "Strategic Themes",
    themes: [
      { id: "advantage", label: "Gain an Advantage" },
      { id: "equality", label: "Equalize" },
      { id: "crushing", label: "Winning Position" },
      { id: "defensiveMove", label: "Defensive Move" },
      { id: "castling", label: "Castling" }
    ]
  },

  phase: {
    label: "Game Phase",
    themes: [
      { id: "opening", label: "Opening" },
      { id: "middlegame", label: "Middlegame" },
      { id: "endgame", label: "Endgame" }
    ]
  },

  length: {
    label: "Puzzle Length",
    themes: [
      { id: "oneMove", label: "One Move" },
      { id: "short", label: "Short" },
      { id: "long", label: "Long" },
      { id: "veryLong", label: "Very Long" }
    ]
  },

  quality: {
    label: "Source Quality",
    themes: [
      { id: "master", label: "Master Game" },
      { id: "superGM", label: "Super GM Game" },
      { id: "masterVsMaster", label: "Master vs Master" }
    ]
  }
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

activateScreen(puzzleScreen);

puzzleScreen.innerHTML = `
  <div class="onep-layout">
    <div class="board-panel">
      <div id="board"></div>
    </div>
    
    <div class = "card">
      <div class="onep-title" id="puzzleTitle">...</div>
      <div class="status-row">
        <div id="sideIndicator" class="side-indicator"></div>
        <div class="subtitle" id="statusText">In Progress</div>
      </div>
      <div class="messageBox" id="messageBox">Loading puzzle...</div>
      <div class="theme-card" id="themeCard">...</div>
      <div class="onep-action-buttons">
        <button id="hintBtn" class="small-flat-btn" title="Reset Puzzle">
          <span class="material-symbols-outlined small-size">lightbulb_2</span>
        </button>
        <button id="resetBtn" class="small-flat-btn" title="Hint">
          <span class="material-symbols-outlined small-size">replay</span>
        </button>
        <button id="showSolutionBtn" class="small-flat-btn" title="show-solution">
          <span class="material-symbols-outlined small-size">keyboard_return</span>
        </button>

      </div>

    </div>

  </div>
`;


const boardContainer = document.getElementById("board");
const statusText = document.getElementById("statusText");
const sideIndicator = document.getElementById("sideIndicator");
const messageBox = document.getElementById("messageBox");
const puzzleTitle = document.getElementById("puzzleTitle");



let db;

async function initPuzzleDB() {
  const SQL = await initSqlJs({
    locateFile: () => "/sql-wasm.wasm"
  });

  const response = await fetch("/lichess-puzzles.db");
  const buffer = await response.arrayBuffer();

  db = new SQL.Database(new Uint8Array(buffer));
}

export function getPuzzleById(puzzleId) {
  const stmt = db.prepare(`
    SELECT *
    FROM puzzles
    WHERE PuzzleId = ?
  `);

  stmt.bind([puzzleId]);

  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const puzzle = stmt.getAsObject();

  stmt.free();

  return puzzle;
}



await initPuzzleDB();

console.log(db)


const loadedPuzzle = (getPuzzleById(puzzleId));

console.log(typeof puzzleId);

console.log(loadedPuzzle);
console.log(loadedPuzzle.Themes);
console.log(typeof loadedPuzzle.Themes);

const PUZZLE = {
  title: loadedPuzzle.Rating,
  fen: loadedPuzzle.FEN,
  moves: loadedPuzzle.Moves,
  sideToMove: loadedPuzzle.FEN.split(" ")[1] === "w" ? "b" : "w",
};

console.log(PUZZLE);


const themeMap = Object.values(CHESS_THEMES)
  .flatMap(category => category.themes)
  .reduce((map, theme) => ({ ...map, [theme.id]: theme.label }), {});

const themes = JSON.parse(loadedPuzzle.Themes);

themeCard.innerHTML = themes
  .map(id => `<div class="themeItem">${themeMap[id] || id}</div>`)
  .join("");

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
    setMessage("Great Work!");
    return;
  }

  updateUI();
}


async function setPuzzle() {
  solved = false;
  currentStep = 0;
  mistakes = 0;
  tookHint = 0;

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


async function activateScreen(screen) {
  screen.classList.add("active");
}

setPuzzle();

document
  .getElementById("hintBtn")
  .addEventListener("click", showHint);

document
  .getElementById("resetBtn")
  .addEventListener("click", setPuzzle);

document
  .getElementById("showSolutionBtn")
  .addEventListener("click", replaySolution);



