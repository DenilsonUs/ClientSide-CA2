const boardContainer = document.getElementById("board-container");
const startBtn = document.getElementById("start-btn");
const p1Btn = document.getElementById("player1-btn");
const p2Btn = document.getElementById("player2-btn");
const confirmBtn = document.getElementById("confirm-btn");
const diceDisplay = document.getElementById("dice");
const turnIndicator = document.getElementById("turn-indicator");

let hexes = [];
let players = [
  { id: 1, color: "red", pos: 37, circle: 4 },
  { id: 2, color: "blue", pos: 43, circle: 4 },
];
let currentPlayerIndex = 0;
let diceValue = 0;
let currentTarget = null;

function createHex(id, ring, angleDeg) {
  const hex = document.createElement("div");
  hex.classList.add("hex");
  hex.dataset.id = id;
  hex.dataset.ring = ring;
  hex.innerText = id;
  hex.style.left =
    300 + Math.cos((angleDeg * Math.PI) / 180) * ring * 55 + "px";
  hex.style.top = 300 + Math.sin((angleDeg * Math.PI) / 180) * ring * 55 + "px";
  boardContainer.appendChild(hex);
  return { id, ring, jumpsTo: id === 43 ? 25 : null, el: hex };
}

function buildGrid() {
  hexes.push({ id: 0, ring: 0, el: createHex(0, 0, 0).el });
  let id = 1;
  for (let ring = 1; ring <= 4; ring++) {
    const count = ring * 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 360;
      hexes.push(createHex(id++, ring, angle));
    }
  }
}

function startGame() {
  placeMonsters();
  updateUI();
}

function placeMonsters() {
  players.forEach((player) => {
    const hex = hexes.find((h) => h.id === player.pos);
    const m = document.createElement("div");
    m.classList.add("monster", player.color);
    hex.el.appendChild(m);
  });
}

function rollDice() {
  diceValue = Math.floor(Math.random() * 6) + 1;
  diceDisplay.innerText = `🎲 ${diceValue}`;
  const player = players[currentPlayerIndex];
  const path = hexes.map((h) => h.id);
  const posIndex = path.indexOf(player.pos);
  let nextId = path[posIndex + diceValue];

  if (nextId === undefined) return;

  currentTarget = hexes.find((h) => h.id === nextId);
  currentTarget.el.classList.add("target-hex");
}

function confirmMove() {
  if (!currentTarget) return;
  moveTo(currentTarget);
}

function moveTo(targetHex) {
  const player = players[currentPlayerIndex];
  let fromHex = hexes.find((h) => h.id === player.pos);
  let monster = fromHex.el.querySelector(".monster");
  if (monster) monster.remove();

  // Handle special jump
  if (targetHex.id === 43) {
    targetHex = hexes.find((h) => h.id === 25);
  }

  player.pos = targetHex.id;
  targetHex.el.innerHTML = `<div class="monster ${player.color}"></div>`;

  if (targetHex.id === 0 && diceValue === 1) {
    alert(`Player ${player.id} wins!`);
    location.reload();
  }

  currentTarget.el.classList.remove("target-hex");
  currentTarget = null;
  diceValue = 0;
  currentPlayerIndex = 1 - currentPlayerIndex;
  updateUI();
}

function updateUI() {
  const player = players[currentPlayerIndex];
  turnIndicator.innerText = `Player ${player.id}'s turn`;
  p1Btn.classList.toggle("active", currentPlayerIndex === 0);
  p2Btn.classList.toggle("active", currentPlayerIndex === 1);
}

startBtn.onclick = () => startGame();
p1Btn.onclick = () => {
  if (currentPlayerIndex === 0 && !diceValue) rollDice();
};
p2Btn.onclick = () => {
  if (currentPlayerIndex === 1 && !diceValue) rollDice();
};
confirmBtn.onclick = confirmMove;

buildGrid();
