
function initiateSocketLogic(io) {
  const rooms = {};
  const playerRoomMap = {};
  const bulletSpeed = 3;
  const playerSpeed = 10;
  const bulletRadius = 5;
  const playerRadius = 10;
  let bulletId = 0;

  io.on("connection", (socket) => {
    console.log("inside connection");

    socket.on("createRoom", (roomId, playerName) => {
      const existingRooms = io.sockets.adapter.rooms;
      if (existingRooms.has(roomId)) {
        socket.emit("roomError", {
          message:
            "The room already exists. Either join the room or create a new one",
        });
        return;
      }

      if (!rooms[roomId]){
        rooms[roomId] = {
        players: {},
        bullets: [],
        gameStarted: false,
        gameOver: false,
        hostId: socket.id,
        }
      }
    
  

      socket.join(roomId);
      playerRoomMap[socket.id] = roomId;
     console.log(rooms[roomId].hostId);
      const backendPlayer = initializePlayer(socket.id, playerName, roomId);

      rooms[roomId]["players"][socket.id] = backendPlayer;

      socket.emit("roomCreated", roomId);
      socket.emit("playerCreated", backendPlayer);
    });

    socket.on("joinRoom", (roomId, playerName) => {
      if (!rooms[roomId]) {
        socket.emit("roomError", { message: "The room does not exist!" });
        return;
      }

      if (rooms[roomId] && rooms[roomId]["gameStarted"]) {
        socket.emit("roomError", {
          message: "The game has already started in this room.",
        });
        return;
      }

      if (Object.keys(rooms[roomId]["players"]).length >= 4) {
        socket.emit("roomError", {
          message: "The room is full. Try joining another room",
        });
        return;
      }

      socket.join(roomId);
      playerRoomMap[socket.id] = roomId;
      const backendPlayer = initializePlayer(socket.id, playerName, roomId);

      rooms[roomId]["players"][socket.id] = backendPlayer;

      socket.emit("roomJoined", roomId);
      socket.emit("existingPlayers", rooms[roomId]["players"]);
      socket.to(roomId).emit("newPlayer", backendPlayer);
    });

    socket.on("gameStarted", (roomId) => {
      if (rooms[roomId] && rooms[roomId]["gameStarted"]) {
        socket.emit("roomError", {
          message: "The game has already started in this room.",
        });
      } else {
        rooms[roomId]["gameStarted"] = true;
        io.in(roomId).emit("gameStarted", roomId);
      }
    });

    socket.on("leaveRoom", (roomId) => {
      io.in(roomId).emit("playerLeftTheRoom", socket.id);
      if (rooms[roomId]["players"][socket.id]) {
        delete rooms[roomId]["players"][socket.id];
        socket.leave(roomId);
      }

    });

    socket.on("deleteRoom", (roomId) => {
      if (rooms[roomId]) {
        io.in(roomId).emit("roomDeleted", roomId);

        for (let playerId in rooms[roomId]["players"]) {
          io.sockets.sockets.get(playerId).leave(roomId);
        }

        delete rooms[roomId];
      } else {
        socket.emit("roomError", { message: "The room does not exist" });
      }
    });

    socket.on("gameStopped", (roomId) => {
      if (rooms[roomId] && rooms[roomId]["gameStarted"]) {
        rooms[roomId] = { gameStarted: true };
        delete backendPlayers[roomId];
      } else {
        socket.emit("roomError", { message: "The room does not exist" });
      }
    });
    socket.on("keydown", (keycode, roomId) => {

      if (!rooms[roomId]) return;
      if (!rooms[roomId]["players"][socket.id]) return;

      switch (keycode) {
        case "ArrowUp":
          console.log("inside arrow up");
          rooms[roomId]["players"][socket.id].y -= playerSpeed;
          break;
        case "ArrowDown":
          console.log("inside arrow down");
          rooms[roomId]["players"][socket.id].y += playerSpeed;
          break;
        case "ArrowLeft":
          rooms[roomId]["players"][socket.id].x -= playerSpeed;
          break;
        case "ArrowRight":
          rooms[roomId]["players"][socket.id].x += playerSpeed;
          break;
      }

      io.in(roomId).emit("updatedPlayersGameState", rooms[roomId]["players"]);
    });

    socket.on("addBullet", ({ x, y, angle, roomId }) => {
  
      const velocity = {
        x: Math.cos(angle) * bulletSpeed,
        y: Math.sin(angle) * bulletSpeed,
      };
      const updatedBullet = initializeBullet(
        x,
        y,
        angle,
        velocity,
        roomId,
        socket.id,
      );

      if (!rooms[roomId]["bullets"]) rooms[roomId]["bullets"] = [];
      rooms[roomId]["bullets"].push(updatedBullet);
      // io.in(roomId).emit("newBullet", updatedBullet);
    });

    socket.on("disconnect", () => {
      const roomId = playerRoomMap[socket.id]; 
        if(rooms[roomId] && rooms[roomId]["players"] && rooms[roomId]["players"][socket.id]){
          socket.to(roomId).emit("playerLeftTheRoom", socket.id);
          delete rooms[roomId]["players"][socket.id];

          if(Object.keys(rooms[roomId]["players"]).length === 0){
            delete rooms[roomId];
          }
        }

        delete playerRoomMap[socket.id];
      
    });

    setInterval(() => {

      updatePlayers();
      updateBullets();

    }, 1000 / 60);

    function updatePlayers(){
      if(Object.keys(rooms).length === 0) return;
      for(const room in rooms){
        if(rooms[room]['gameStarted'] === false) continue;
        const roomPlayers = rooms[room]['players'];
        if(!roomPlayers) continue;
        if(Object.keys(roomPlayers).length === 1 && rooms[room]['gameStarted'] === true){
          io.in(room).emit("playerWon", roomPlayers[Object.keys(roomPlayers)[0]].playerId);
          io.sockets.sockets.get(Object.keys(roomPlayers)[0]).leave(room);
          delete rooms[room];
          continue;
        }
        const playersToRemove = [];
        if(roomPlayers){
          for(const playerId in roomPlayers){
            const currentPlayer = roomPlayers[playerId];

            if(currentPlayer.hit){
              io.in(room).emit("playerHit", playerId);
              io.sockets.sockets.get(playerId).leave(room);
              playersToRemove.push(playerId);
              continue;
            }

            if (currentPlayer.x > 1014) {
              currentPlayer.x = 1014;
            }
            if (currentPlayer.x < 10) {
              currentPlayer.x = 10;
            }
            if (currentPlayer.y > 566) {
              currentPlayer.y = 566;
            }
            if (currentPlayer.y < 10) {
              currentPlayer.y = 10;
            }
          }

          for(const playerId of playersToRemove){
            delete roomPlayers[playerId];
          }
        }

        io.in(room).emit("updatedPlayersGameState", roomPlayers);
      }
    }

    function updateBullets() {
      if (Object.keys(rooms).length === 0) return;
      for (const room in rooms) {
        let roomBullets = rooms[room]['bullets'];
        let newBullets = [];
        if (roomBullets) {
    
          for (let i = 0; i < roomBullets.length; i++) {
            const currentBullet = roomBullets[i];
            currentBullet.x += currentBullet.velocity.x;
            currentBullet.y += currentBullet.velocity.y;
    
            // Boundary detection for bullet removal
            if (currentBullet.x < 0 || currentBullet.x > 1024 || currentBullet.y < 0 || currentBullet.y > 590) {
              continue; // Skip adding this bullet to newBullets
            }
    
            // Player and bullet collision detection
            const roomPlayers = rooms[room]['players'];
            let bulletHit = false;
    
            for (const playerId in roomPlayers) {
              const backEndPlayer = roomPlayers[playerId];
    
              const DISTANCE = Math.hypot(
                currentBullet.x - backEndPlayer.x,
                currentBullet.y - backEndPlayer.y
              );
    
              if (DISTANCE < 5 + backEndPlayer.radius && currentBullet.playerId !== playerId) {
                roomPlayers[playerId].hit = true;
                // io.in(room).emit("playerHit", playerId, currentBullet.bulletId);
                // io.sockets.sockets.get(playerId).leave(room);
                bulletHit = true;
                break;
              }
            }
    
            if (!bulletHit) {
              newBullets.push(currentBullet);
            }
          }
    
          rooms[room]['bullets'] = newBullets;
        }
    
        io.in(room).emit("updatedBulletsGameState", rooms[room]['bullets']);
      }
    }
    

  });

  function initializePlayer(playerId, playerName, roomId) {
    return {
      x: Math.floor(Math.random() * 1024),
      y: Math.floor(Math.random() * 576),
      color: `hsl(${Math.random() * 360}, ${100}%, ${50}%)`,
      radius: 10,
      requestNumber: 0,
      playerId: playerId,
      host: rooms[roomId]["hostId"] === playerId ? true : false,
      playerName: playerName,
      hit: false,
    };
  }
  
  function initializeBullet(x, y, angle, velocity, roomId, socketId) {
    bulletId++;
    return {
      x: x,
      y: y,
      angle: angle,
      radius: bulletRadius,
      color: rooms[roomId]["players"][socketId]?.color,
      velocity: velocity,
      playerId: socketId,
      bulletId: bulletId,
    };
  }

}

export { initiateSocketLogic };