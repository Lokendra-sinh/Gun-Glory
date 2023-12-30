const bulletSpeed = 5;
const playerSpeed = 10;
const bulletRadius = 5;
let bulletId = 0;

function initiateSocketLogic(io) {
  const backendPlayers = {};
  const backendBullets = {};

  io.on("connect", (socket) => {
    console.log("inside connect");

    backendPlayers[socket.id] = {
      x: Math.floor(Math.random() * 1024),
      y: Math.floor(Math.random() * 576),
      color: `hsl(${Math.random() * 360}, ${100}%, ${50}%)`,
      radius: 10,
      requestNumber: 0,
    };

    io.emit("updateFrontendPlayers", backendPlayers);

    socket.on("addBullet", ({ x, y, angle }) => {
      bulletId++;
      const velocity = {
        x: Math.cos(angle) * bulletSpeed,
        y: Math.sin(angle) * bulletSpeed,
      };
      const updatedBullet = {
        x: x,
        y: y,
        angle: angle,
        radius: bulletRadius,
        color: backendPlayers[socket.id]?.color,
        velocity: velocity,
        playerId: socket.id,
      };

      backendBullets[bulletId] = updatedBullet;
      console.log(backendBullets);
    });

    //server reconcilliation
    socket.on("keydown", (keycode, requestNumber) => {
      backendPlayers[socket.id].requestNumber = requestNumber;
      switch (keycode) {
        case "ArrowUp":
          backendPlayers[socket.id].y -= playerSpeed;
          break;
        case "ArrowDown":
          backendPlayers[socket.id].y += playerSpeed;
          break;
        case "ArrowLeft":
          backendPlayers[socket.id].x -= playerSpeed;
          break;
        case "ArrowRight":
          backendPlayers[socket.id].x += playerSpeed;
          break;
      }
    });

    socket.on("createRoom", (roomId) => {
      socket.join(roomId);
      socket.emit("roomCreated", roomId);
    });

    socket.on("joinRoom", (roomId) => {
      const rooms = io.sockets.adapter.rooms;
      if (rooms.has(roomId)) {
        socket.join(roomId);
        socket.emit("roomJoined", roomId);
      } else {
        socket.emit("roomNotFound");
      }
    });

    socket.on("disconnect", () => {
      console.log("inside disconnect");
      delete backendPlayers[socket.id];
      io.emit("playerLeft", socket.id);
    });
  });

  function updateBulletsPosition() {
    for (const bulletId in backendBullets) {
      backendBullets[bulletId].x += backendBullets[bulletId].velocity.x;
      backendBullets[bulletId].y += backendBullets[bulletId].velocity.y;

      //boundary detection

      if (
        backendBullets[bulletId].x >= 1024 ||
        backendBullets[bulletId].x <= 10 ||
        backendBullets[bulletId].y >= 590 ||
        backendBullets[bulletId].y <= 5
      ) {
        delete backendBullets[bulletId];
        continue;
      }

      //player and bullet collision detection

      for (const playerId in backendPlayers) {
        const backEndPlayer = backendPlayers[playerId];

        const DISTANCE = Math.hypot(
          backendBullets[bulletId].x - backEndPlayer.x,
          backendBullets[bulletId].y - backEndPlayer.y
        );

        //player Bullet collision detection
        if (
          DISTANCE < 5 + backEndPlayer.radius &&
          backendBullets[bulletId].playerId !== playerId
        ) {
          delete backendBullets[bulletId];
          delete backendPlayers[playerId];
          break;
        }
      }
    }
  }

  setInterval(() => {
    if (Object.keys(backendBullets).length > 0) {
      updateBulletsPosition();
      io.emit("updateBullets", backendBullets);
    }
    if (Object.keys(backendPlayers).length > 0) {
      io.emit("updateFrontendPlayers", backendPlayers);
    }
  }, 1000 / 60);
}

export { initiateSocketLogic}