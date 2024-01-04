import io from "socket.io-client";

const socket = io("http://localhost:3000");

const frontendPlayers = {};
const frontendBullets = {};
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};
let requestNumber = 0;
const playerRequests = [];
const playerSpeed = 15;
const t = 0.1;
let hostId = "";

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
  socket.emit("createRoom", roomId);
  handleCreateRoomModalVisibility();
});

joinRoomModalButton.addEventListener("click", (e) => {
  e.stopPropagation();
  isJoinRoomModalOpen = false;
  roomId = joinRoomModalInput.value.trim('');
  socket.emit("joinRoom", roomId);
  handleJoinRoomModalVisibility();
  
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
  if(hostId !== socket.id) return alert('Only host can start the game');
  e.stopPropagation();
  socket.emit("gameStarted", roomId);
  // roomLobbyOverlay.style.display = "none";
  // gameStarted = true;
  // socket.emit("gameStarted", roomId);
  // // animate();
});

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
  alert(error.message);
});

socket.on("roomJoined", (roomId) => {
  console.log("room joined with roomId: ", roomId);
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

socket.on("gameState", (players) => {
  for (const id in players) {
    if (!frontendPlayers[id]) {
      frontendPlayers[id] = players[id];
    }
    //  else {
    //   if (id === socket.id) {
    //     const lastProcessedRequestIndex = playerRequests.findIndex(
    //       (request) => {
    //         return request.requestNumber === players[id].requestNumber;
    //       }
    //     );

    //     if (lastProcessedRequestIndex !== -1) {
    //         playerRequests.splice(0, lastProcessedRequestIndex + 1);
    //         const unprocessedRequests = playerRequests.slice(lastProcessedRequestIndex + 1);
    //         unprocessedRequests.forEach((request) => {
    //           frontendPlayers[id].x += request.vx;
    //           frontendPlayers[id].y += request.vy;
    //         });
    //       }
    //   }
    else {
      //  apply interpolation for smooth animation
      frontendPlayers[id].x = lerp(frontendPlayers[id].x, players[id].x, t);
      frontendPlayers[id].y = lerp(frontendPlayers[id].y, players[id].y, t);
    }
  }

  // deleting frontend players
  for (const id in frontendPlayers) {
    if (!players[id]) {
      delete frontendPlayers[id];
    }
  }
  //   }
});

socket.on("updateBullets", (bullets) => {
  console.log("bullets are: ", bullets);

  for (const bulletId in frontendBullets) {
    if (!bullets[bulletId]) {
      delete frontendBullets[bulletId];
      // continue;
    }
  }

  for (const id in bullets) {
    if (!frontendBullets[id]) {
      frontendBullets[id] = bullets[id];
    } else {
      frontendBullets[id].x += frontendBullets[id].velocity.x;
      frontendBullets[id].y += frontendBullets[id].velocity.y;
    }
  }
});

socket.on("playerLeft", (playerId) => {
  delete frontendPlayers[playerId];
});

function lerp(start, end, t) {
  return start + (end - start) * t;
}

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
  console.log("keys are: ", keys);
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
  console.log("keys are: ", keys);
});

function drawPlayer({ x, y, radius, color }) {
  ctx.beginPath();
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();

  ctx.font = "12px Arial";
  ctx.fillStyle = color;
  ctx.fillText(user.name ? user.name : 'Guest', x, y + radius + 10);
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

function updatePlayersPosition() {
  if (keys["ArrowUp"]) {
    requestNumber++;
    playerRequests.push({ requestNumber, vx: 0, vy: -playerSpeed });
    // frontendPlayers[socket.id].y -= playerSpeed;
    socket.emit("keydown", "ArrowUp", requestNumber);
  }

  if (keys["ArrowDown"]) {
    requestNumber++;
    playerRequests.push({ requestNumber, vx: 0, vy: playerSpeed });
    // frontendPlayers[socket.id].y += playerSpeed;
    socket.emit("keydown", "ArrowDown", requestNumber);
  }

  if (keys["ArrowLeft"]) {
    requestNumber++;
    playerRequests.push({ requestNumber, vx: -playerSpeed, vy: 0 });
    // frontendPlayers[socket.id].x -= playerSpeed;
    socket.emit("keydown", "ArrowLeft", requestNumber);
  }

  if (keys["ArrowRight"]) {
    requestNumber++;
    playerRequests.push({ requestNumber, vx: playerSpeed, vy: 0 });
    // frontendPlayers[socket.id].x += playerSpeed;
    socket.emit("keydown", "ArrowRight", requestNumber);
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

// setInterval(updatePlayersPosition, 1000 / 60);
