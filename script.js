class CircularHexGame {
  constructor() {
    this.boardContainer = document.getElementById("board-container");
    this.startBtn = document.getElementById("start-btn");
    this.player1Btn = document.getElementById("player1-btn");
    this.player2Btn = document.getElementById("player2-btn");
    this.diceElement = document.getElementById("dice");
    this.diceValueElement = document.getElementById("dice-value");
    this.turnIndicator = document.getElementById("turn-indicator");

    this.rings = 4;
    this.hexSize = 50;
    this.centerHex = null;
    this.hexes = [];
    this.hexGraph = {};
    this.pathOrder = [];

    this.players = [
      { id: 1, color: "red", position: null, startHex: null },
      { id: 2, color: "blue", position: null, startHex: null },
    ];
    this.currentPlayerIndex = 0;
    this.gameStarted = false;
    this.diceValue = 0;

    this.initBoard();
    this.setupEventListeners();
  }

  initBoard() {
    this.centerHex = this.createHex(0, 0, true);
    this.centerHex.classList.add("center");
    this.centerHex.textContent = "★";

    let hexCounter = 1; // ← NUEVO: contador para numerar los hexágonos

    for (let ring = 1; ring <= this.rings; ring++) {
      const hexCount = ring * 6;
      const radius = ring * this.hexSize * 1.5;

      for (let i = 0; i < hexCount; i++) {
        const angle = (i / hexCount) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const hex = this.createHex(x, y);
        hex.textContent = `${ring}-${i}`;
        hex.dataset.number = hexCounter; // ← NUEVO: asignar número
        hex.classList.add("numbered"); // ← NUEVO: clase para estilo
        this.hexes.push(hex);

        if (ring === this.rings) {
          if (i === 0) {
            hex.classList.add("start-red");
            this.players[0].startHex = hex;
          } else if (i === Math.floor(hexCount / 2)) {
            hex.classList.add("start-blue");
            this.players[1].startHex = hex;
          }
        }

        hexCounter++; // ← NUEVO: aumentar número
      }
    }

    this.buildHexGraph();
    this.calculatePathOrder();
  }

  createHex(x, y, isCenter = false) {
    const hex = document.createElement("div");
    hex.classList.add("hex");
    if (isCenter) hex.classList.add("center");

    const centerX = this.boardContainer.offsetWidth / 2;
    const centerY = this.boardContainer.offsetHeight / 2;

    hex.style.left = `${centerX + x - (isCenter ? 35 : 25)}px`;
    hex.style.top = `${centerY + y - (isCenter ? 40 : 28.87)}px`;

    this.boardContainer.appendChild(hex);
    return hex;
  }

  buildHexGraph() {
    this.hexGraph = {};
    for (let i = 0; i < this.hexes.length; i++) {
      const current = this.hexes[i];
      const nextIndex = (i + 1) % this.hexes.length;
      this.hexGraph[current.textContent] = this.hexes[nextIndex].textContent;
    }
    const lastHex = this.hexes[this.hexes.length - 1];
    this.hexGraph[lastHex.textContent] = this.centerHex.textContent;
  }

  calculatePathOrder() {
    let current = this.players[0].startHex.textContent;
    this.pathOrder = [current];

    while (true) {
      current = this.hexGraph[current];
      if (!current || current === this.centerHex.textContent) break;
      this.pathOrder.push(current);
    }

    this.pathOrder.push(this.centerHex.textContent);
  }

  setupEventListeners() {
    this.startBtn.addEventListener("click", () => this.startGame());
    this.player1Btn.addEventListener("click", () => this.handlePlayerAction(0));
    this.player2Btn.addEventListener("click", () => this.handlePlayerAction(1));
  }

  startGame() {
    if (this.gameStarted) return;

    this.gameStarted = true;
    this.startBtn.disabled = true;

    this.currentPlayerIndex = Math.floor(Math.random() * 2);
    this.updateTurnIndicator();

    this.players[0].position = this.players[0].startHex;
    this.players[1].position = this.players[1].startHex;

    this.createMonster(this.players[0].startHex, "red");
    this.createMonster(this.players[1].startHex, "blue");

    this.updatePlayerButtons();
  }

  handlePlayerAction(playerIndex) {
    if (!this.gameStarted || this.currentPlayerIndex !== playerIndex) return;

    if (this.diceValue === 0) {
      this.rollDice();
    } else {
      this.movePlayer();
    }
  }

  rollDice() {
    this.diceElement.classList.add("dice-rolling");
    this.diceValueElement.textContent = "Rolling...";

    setTimeout(() => {
      this.diceValue = Math.floor(Math.random() * 6) + 1;
      this.diceElement.textContent = this.diceValue;
      this.diceValueElement.textContent = `Move ${this.diceValue} spaces`;
      this.diceElement.classList.remove("dice-rolling");

      this.highlightPossibleMoves();
    }, 1000);
  }

  highlightPossibleMoves() {
    this.hexes.forEach((hex) => hex.classList.remove("path"));

    const currentPlayer = this.players[this.currentPlayerIndex];
    const currentPosition = currentPlayer.position.textContent;
    const currentIndex = this.pathOrder.indexOf(currentPosition);

    for (let i = 1; i <= this.diceValue; i++) {
      const nextIndex = (currentIndex + i) % this.pathOrder.length;
      const nextHexText = this.pathOrder[nextIndex];
      const hex = this.findHexByText(nextHexText);
      if (hex) hex.classList.add("path");
    }
  }

  movePlayer() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    const opponent = this.players[1 - this.currentPlayerIndex];
    const currentPosition = currentPlayer.position.textContent;
    const currentIndex = this.pathOrder.indexOf(currentPosition);

    const newIndex = (currentIndex + this.diceValue) % this.pathOrder.length;
    const newHexText = this.pathOrder[newIndex];
    const newHex = this.findHexByText(newHexText);

    if (newHex === this.centerHex) {
      this.endGame(currentPlayer);
      return;
    }

    if (newHex === opponent.position) {
      this.sendToStart(opponent);
    }

    this.removeMonster(currentPlayer.position);
    currentPlayer.position = newHex;
    this.createMonster(newHex, currentPlayer.color);

    this.diceValue = 0;
    this.diceElement.textContent = "0";
    this.diceValueElement.textContent = "Roll dice";
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;

    this.updateTurnIndicator();
    this.updatePlayerButtons();
    this.hexes.forEach((hex) => hex.classList.remove("path"));
  }

  createMonster(hex, color) {
    const monster = document.createElement("div");
    monster.classList.add("monster", color);
    hex.appendChild(monster);
  }

  removeMonster(hex) {
    const monster = hex.querySelector(".monster");
    if (monster) hex.removeChild(monster);
  }

  sendToStart(player) {
    this.removeMonster(player.position);
    player.position = player.startHex;
    this.createMonster(player.startHex, player.color);
  }

  findHexByText(text) {
    if (text === this.centerHex.textContent) return this.centerHex;
    return this.hexes.find((hex) => hex.textContent === text);
  }

  updateTurnIndicator() {
    const player = this.players[this.currentPlayerIndex];
    this.turnIndicator.textContent = `Player ${player.id}'s Turn (${player.color})`;
    this.turnIndicator.className = player.color;
  }

  updatePlayerButtons() {
    this.player1Btn.classList.toggle("active", this.currentPlayerIndex === 0);
    this.player2Btn.classList.toggle("active", this.currentPlayerIndex === 1);
  }

  endGame(winner) {
    alert(`Player ${winner.id} (${winner.color}) wins!`);
    this.resetGame();
  }

  resetGame() {
    this.hexes.forEach((hex) => {
      const monster = hex.querySelector(".monster");
      if (monster) hex.removeChild(monster);
    });
    const centerMonster = this.centerHex.querySelector(".monster");
    if (centerMonster) this.centerHex.removeChild(centerMonster);

    this.gameStarted = false;
    this.currentPlayerIndex = 0;
    this.diceValue = 0;
    this.startBtn.disabled = false;

    this.diceElement.textContent = "0";
    this.diceValueElement.textContent = "Roll dice";
    this.turnIndicator.textContent = "Game not started";
    this.turnIndicator.className = "";
    this.player1Btn.classList.remove("active");
    this.player2Btn.classList.remove("active");
    this.hexes.forEach((hex) => hex.classList.remove("path"));
  }
}

window.onload = () => new CircularHexGame();
