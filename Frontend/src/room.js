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
const ctx = canvas.getContext("2d");
const dpi = window.devicePixelRatio || 1;
canvas.width = 1024;
canvas.height = 576;
ctx.scale(dpi, dpi);

socket.on("connect", () => {
  console.log("client connected successfully: ", socket.id);
});

createRoomModalButton.addEventListener("click", () => {
  isCreateRoomModalOpen = false;
  roomId = createRoomModalInput.value;
  socket.emit("createRoom", roomId);
  handleCreateRoomModalVisibility();
  canvas.style.display = "flex";
});

joinRoomModalButton.addEventListener("click", () => {
  isJoinRoomModalOpen = false;
  roomId = joinRoomModalInput.value;
  socket.emit("joinRoom", roomId);
  handleJoinRoomModalVisibility();
  canvas.style.display = "flex";
});

socket.on("roomCreated", (roomId) => {
  console.log("room created with roomId: ", roomId);
});

socket.on("playerCreated", (player) => {
  frontendPlayers[socket.id] = player;
});

socket.on("roomError", (error) => {
  console.log("room error: ", error);
});

socket.on("roomJoined", (roomId) => {
  console.log("room joined with roomId: ", roomId);
});

socket.on("existingPlayers", (players) => {
  for (const id in players) {
    frontendPlayers[id] = players[id];
  }
});

socket.on("newPlayer", (player) => {
  console.log("new player joined: ", player);
  const playerId = player.playerId;
  frontendPlayers[playerId] = player;
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
    
    for(const bulletId in frontendBullets){
        if(!bullets[bulletId]){
        delete frontendBullets[bulletId];
        // continue;
        }
    }
    
    for(const id in bullets){
        if(!frontendBullets[id]){
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
  // console.log("mouse clicked: ", event.clientX, event.clientY);
  const c = canvas.getBoundingClientRect();
  // console.log("canvas: ", c.top, c.left);
  const player = {
    x: frontendPlayers[socket.id].x,
    y: frontendPlayers[socket.id].y,
  }
  console.log("player: ", frontendPlayers[socket.id].x, frontendPlayers[socket.id].y);

  const mouseX = (event.clientX - c.left) / dpi;
  const mouseY = (event.clientY - c.top) / dpi;

  console.log("mousecanvas: ", mouseX, mouseY);
  const shotAngle = Math.atan2(mouseY - player.y, mouseX - player.x);
  console.log(shotAngle);

  const bullet = {
    x: player.x,
    y: player.y,
    angle: shotAngle,
  }
 
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

animate();
// setInterval(updatePlayersPosition, 1000 / 60);