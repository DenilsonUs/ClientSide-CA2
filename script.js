const boardContainer = document.getElementById("board-container");
const startBtn = document.getElementById("start-btn");
const player1Btn = document.getElementById("player1-btn");
const player2Btn = document.getElementById("player2-btn");
const diceDisplay = document.getElementById("dice");
const diceValueDisplay = document.getElementById("dice-value");
const turnIndicator = document.getElementById("turn-indicator");

let hexes = [];
let path = [];
let playerPositions = { red: 0, blue: 0 };
let currentPlayer = null;
let gameStarted = false;

// Build the hex grid
function createHexGrid(rows = 10, cols = 10) {
  const HEX_WIDTH = 50;
  const HEX_HEIGHT = 57.74;
  const OFFSET = HEX_HEIGHT * 0.75;

  let id = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const hex = document.createElement("div");
      hex.classList.add("hex");

      const x = col * HEX_WIDTH + (row % 2 === 0 ? 0 : HEX_WIDTH / 2);
      const y = row * OFFSET;

      hex.style.left = `${x}px`;
      hex.style.top = `${y}px`;
      hex.dataset.id = id;
      hex.innerText = id;
      boardContainer.appendChild(hex);
      hexes.push(hex);
      id++;
    }
  }

  // Center cell
  const centerId = Math.floor(hexes.length / 2);
  hexes[centerId].classList.add("center");

  // Create a circular path (clockwise outer ring)
  const outerRing = getClockwiseRing(rows, cols);
  path = outerRing;
  for (let id of path) {
    hexes[id].classList.add("path");
  }

  // Start positions
  hexes[path[0]].classList.add("start-red");
  hexes[path[Math.floor(path.length / 2)]].classList.add("start-blue");
}

function getClockwiseRing(rows, cols) {
  let ring = [];

  // Top row
  for (let i = 0; i < cols; i++) ring.push(i);
  // Right column
  for (let i = 1; i < rows; i++) ring.push(i * cols + (cols - 1));
  // Bottom row (reverse)
  for (let i = cols - 2; i >= 0; i--) ring.push((rows - 1) * cols + i);
  // Left column (reverse)
  for (let i = rows - 2; i > 0; i--) ring.push(i * cols);

  return ring;
}

// Draw monster token
function renderMonsters() {
  document.querySelectorAll(".monster").forEach((m) => m.remove());

  const redHex = hexes[path[playerPositions.red]];
  const red = document.createElement("div");
  red.classList.add("monster", "red");
  red.style.left = "10px";
  red.style.top = "10px";
  redHex.appendChild(red);

  const blueHex = hexes[path[playerPositions.blue]];
  const blue = document.createElement("div");
  blue.classList.add("monster", "blue");
  blue.style.left = "10px";
  blue.style.top = "30px";
  blueHex.appendChild(blue);
}

// Start game
startBtn.addEventListener("click", () => {
  if (gameStarted) return;
  gameStarted = true;
  currentPlayer = Math.random() > 0.5 ? "red" : "blue";
  updateUI();
});

// Player button click
player1Btn.addEventListener("click", () => {
  if (currentPlayer === "red") rollDice("red");
});

player2Btn.addEventListener("click", () => {
  if (currentPlayer === "blue") rollDice("blue");
});

// Roll dice and move
function rollDice(player) {
  const roll = Math.floor(Math.random() * 6) + 1;
  animateDice(roll);

  setTimeout(() => {
    movePlayer(player, roll);
  }, 800);
}

// Move player along path
function movePlayer(player, steps) {
  playerPositions[player] += steps;
  if (playerPositions[player] >= path.length) {
    playerPositions[player] = playerPositions[player] % path.length;
  }

  // Check if landed on opponent
  const opponent = player === "red" ? "blue" : "red";
  if (playerPositions[player] === playerPositions[opponent]) {
    playerPositions[opponent] =
      opponent === "red" ? 0 : Math.floor(path.length / 2);
  }

  renderMonsters();

  // Check win
  const centerId = Math.floor(hexes.length / 2);
  const playerHex = hexes[path[playerPositions[player]]];
  if (playerHex.dataset.id == centerId) {
    turnIndicator.innerText = `${player.toUpperCase()} wins! 🎉`;
    turnIndicator.className = player;
    player1Btn.disabled = true;
    player2Btn.disabled = true;
    return;
  }

  // Switch turn
  currentPlayer = opponent;
  updateUI();
}

function updateUI() {
  if (currentPlayer === "red") {
    player1Btn.classList.add("active");
    player2Btn.classList.remove("active");
    player1Btn.disabled = false;
    player2Btn.disabled = true;
    turnIndicator.innerText = "Red's Turn";
    turnIndicator.className = "red";
  } else {
    player2Btn.classList.add("active");
    player1Btn.classList.remove("active");
    player2Btn.disabled = false;
    player1Btn.disabled = true;
    turnIndicator.innerText = "Blue's Turn";
    turnIndicator.className = "blue";
  }
}

// Animate dice roll
function animateDice(value) {
  diceDisplay.classList.add("dice-rolling");
  diceValueDisplay.innerText = "Rolling...";
  setTimeout(() => {
    diceDisplay.classList.remove("dice-rolling");
    diceDisplay.innerText = value;
    diceValueDisplay.innerText = `You rolled: ${value}`;
  }, 600);
}

// Init game
createHexGrid();
renderMonsters();
