import io from "socket.io-client";

const socket = io("http://localhost:3000");

const frontendPlayers = {};
let frontendBullets = {};
const keys = {
  "ArrowUp": false,
  "ArrowDown": false,
  "ArrowLeft": false,
  "ArrowRight": false,
};
let requestNumber = 0;
const playerRequests = [];
const playerSpeed = 15;
const t = 0.05;
let hostId = "";
let roomId = "";


function clearExistingPlayersList() {
  playersContainer.innerHTML = "";
}

function renderNewPlayersList() {

  for (const id in frontendPlayers) {
    const playerRow = document.createElement("div");
    playerRow.classList.add("player-row");
    playerRow.innerHTML = `
    <p class="player-name">${id}</p>
    <p class="player-role">${socket.id === id ? 'Host' : 'Player'}</p>
    `;
    playersContainer.appendChild(playerRow);
  }
}

function handleCreateRoomModalVisibility() {
  createRoomModal.style.display = isCreateRoomModalOpen ? "flex" : "none";
  handleRoomLobbyVisibility();
}

function handleJoinRoomModalVisibility() {
  joinRoomModal.style.display = isJoinRoomModalOpen ? "flex" : "none";
  handleRoomLobbyVisibility();
}

function handleRoomLobbyVisibility() {
  roomLobbyOverlay.style.display =
    isCreateRoomModalOpen === false && isJoinRoomModalOpen === false
      ? "flex"
      : "none";
  roomLobbyHeaderText.textContent = roomId;
}

function displayRoomError(error) {
  roomErrorOverlay.style.display = "flex";
  roomErrorText.textContent = error.message;
};

roomErrorButton.addEventListener("click", () => {
  roomErrorOverlay.style.display = "none";
  joinRoomModalInput.value = "";
});

createRoomBtn.addEventListener("click", () => {
  isCreateRoomModalOpen = !isCreateRoomModalOpen;
  isJoinRoomModalOpen === true ? (isJoinRoomModalOpen = false) : "";
  handleJoinRoomModalVisibility();
  handleCreateRoomModalVisibility();
});

joinRoomBtn.addEventListener("click", () => {
  console.log("inside join room");
  isJoinRoomModalOpen = !isJoinRoomModalOpen;
  isCreateRoomModalOpen === true ? (isCreateRoomModalOpen = false) : "";
  handleCreateRoomModalVisibility();
  console.log("isJoinRoomModalOpen: ", isJoinRoomModalOpen);
  handleJoinRoomModalVisibility();
});

createRoomModalButton.addEventListener("click", (e) => {
  e.stopPropagation();
  isCreateRoomModalOpen = false;
  roomId = createRoomModalInput.value;
  const playerName = user.name ? user.name : 'Guest';
  socket.emit("createRoom", roomId, playerName);
  handleCreateRoomModalVisibility();
});

joinRoomModalButton.addEventListener("click", (e) => {
  e.stopPropagation();
  isJoinRoomModalOpen = false;
  roomId = joinRoomModalInput.value.trim('');
  const playerName = user.name ? user.name : 'Guest';
  socket.emit("joinRoom", roomId, playerName);
  
});

roomLobbyLeaveButton.addEventListener("click", (e) => {
  e.stopPropagation();
  if(hostId === socket.id) {
    socket.emit("deleteRoom", roomId);
  } else {
    socket.emit("leaveRoom", roomId);
  }
});

roomLobbyStartButton.addEventListener("click", (e) => {
  e.stopPropagation();
  if(hostId !== socket.id) return alert('Only host can start the game');
  // if(Object.keys(frontendPlayers).length < 2) return alert('Atleast 2 players are required to start the game');
  socket.emit("gameStarted", roomId);
  // roomLobbyOverlay.style.display = "none";
  // gameStarted = true;
  // socket.emit("gameStarted", roomId);
  // // animate();
});

gameOverCloseButton.addEventListener('click', ()=> {
  gameOverOverlay.classList.add('closing');
  setTimeout(() => {
      gameOverOverlay.style.display = 'none';
      gameOverOverlay.classList.remove('closing');
      window.location.reload();
  }, 300);
})

socket.on("connect", () => {
  console.log("client connected successfully: ", socket.id);
});

socket.on("roomCreated", (roomId) => {
  console.log("room created with roomId: ", roomId);
  hostId = socket.id;
});

socket.on("roomDeleted", (roomId) => {
  console.log("room deleted with roomId: ", roomId);
  hostId = "";
  roomLobbyOverlay.style.display = "none";
  gameStarted = false;
});

socket.on("playerCreated", (player) => {
  frontendPlayers[socket.id] = player;
  clearExistingPlayersList();
  renderNewPlayersList();
});

socket.on("roomError", (error) => {
  console.log("room error: ", error);
  displayRoomError(error);
});

socket.on("roomJoined", (roomId) => {
  console.log("room joined with roomId: ", roomId);
  handleJoinRoomModalVisibility();
});

socket.on("playerLeftTheRoom", (playerId) => {
  if(playerId === socket.id) {
    roomLobbyOverlay.style.display = "none";
  }
  delete frontendPlayers[playerId];
  clearExistingPlayersList();
  renderNewPlayersList();
});

socket.on("existingPlayers", (players) => {
  for (const id in players) {
    frontendPlayers[id] = players[id];
  }
  clearExistingPlayersList();
  renderNewPlayersList();
});

socket.on("newPlayer", (player) => {
  console.log("new player joined: ", player);
  const playerId = player.playerId;
  frontendPlayers[playerId] = player;
  clearExistingPlayersList();
  renderNewPlayersList();
});

socket.on("gameStarted", (roomId) => {
  roomLobbyOverlay.style.display = "none";
  gameStarted = true;
  animate();
});

socket.on("updatedPlayersGameState", (players) => {
  for (const id in players) {
    if (!frontendPlayers[id]) {
      frontendPlayers[id] = players[id];
    } else {
      //  apply linear interpolation for smooth player movements
      frontendPlayers[id].x = lerp(frontendPlayers[id].x, players[id].x, t);
      frontendPlayers[id].y = lerp(frontendPlayers[id].y, players[id].y, t);
    }
  }

  // deleting frontend players
  for (const id in frontendPlayers) {
    if (!players[id]) {
      if (id === socket.id) {
        roomLobbyOverlay.style.display = "none";
        gameStarted = false;
      }
      delete frontendPlayers[id];
    }
  }
  
});

socket.on("playerHit", (playerId) => {
  if(frontendPlayers[playerId]) {
    delete frontendPlayers[playerId];
    if(playerId === socket.id) {
      roomId = '';
      gameStarted = false;
      gameOverOverlay.style.display = 'flex';
    }
  }
});

socket.on("playerWon", (playerId) => {
  if(frontendPlayers[playerId]) {
    delete frontendPlayers[playerId];
    if(playerId === socket.id) {
      roomId = '';
      gameStarted = false;
      gameOverOverlay.style.display = 'flex';
      gameOverText.textContent = 'Congratulations. You Won!';
    }
  }
});

socket.on("updatedBulletsGameState", (bullets) => {
  frontendBullets = {};
  for (const id in bullets) {
   frontendBullets[id] = bullets[id];
  }
  
});


socket.on("playerLeftTheRoom", (playerId) => {
  delete frontendPlayers[playerId];
});

function lerp(start, end, t) {
  return start + (end - start) * t;
}

window.addEventListener("keydown", (event) => {
  for(const key in keys){
    if(key === event.key) {
      keys[key] = true;
    }
  }
});

window.addEventListener("keyup", (event) => {
  for(const key in keys){
    if(key === event.key) {
      keys[key] = false;
    }
  }
});

function updatePlayersPosition() {
  if (keys["ArrowUp"]) {
    socket.emit("keydown", "ArrowUp", roomId);
  }

  if (keys["ArrowDown"]) {
    socket.emit("keydown", "ArrowDown", roomId);
  }

  if (keys["ArrowLeft"]) {
    socket.emit("keydown", "ArrowLeft", roomId);
  }

  if (keys["ArrowRight"]) {
    socket.emit("keydown", "ArrowRight", roomId);
  }
}

canvas.addEventListener("click", (event) => {
  // if(!GameStarted) return;
  const c = canvas.getBoundingClientRect();
  // console.log("canvas: ", c.top, c.left);
  const player = {
    x: frontendPlayers[socket.id].x,
    y: frontendPlayers[socket.id].y,
  };
  console.log(
    "player: ",
    frontendPlayers[socket.id].x,
    frontendPlayers[socket.id].y
  );

  const mouseX = (event.clientX - c.left) / dpi;
  const mouseY = (event.clientY - c.top) / dpi;

  console.log("mousecanvas: ", mouseX, mouseY);
  const shotAngle = Math.atan2(mouseY - player.y, mouseX - player.x);
  console.log(shotAngle);

  const bullet = {
    x: player.x,
    y: player.y,
    angle: shotAngle,
    roomId,
  };

  console.log("bullet: ", bullet.x, bullet.y);
  socket.emit("addBullet", bullet);
});

function animate() {
  requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayersPosition();
  for (const id in frontendPlayers) {
    const player = frontendPlayers[id];
    drawPlayer(player);
  }
  for (const id in frontendBullets) {
    const bullet = frontendBullets[id];
    drawBullet(bullet);
  }
}

function drawPlayer({ x, y, radius, color, playerName }) {
  ctx.beginPath();
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();

  ctx.font = "12px Arial";
  ctx.fillStyle = color;
  ctx.fillText(playerName ? playerName : 'Guest', x, y + radius + 10);
}

function drawBullet({ x, y, radius, color }) {
  ctx.beginPath();
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}
