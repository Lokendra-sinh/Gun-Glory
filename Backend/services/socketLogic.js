import { set } from "mongoose";

const bulletSpeed = 5;
const playerSpeed = 10;
const bulletRadius = 5;
const playerRadius = 10;
let bulletId = 0;

function initiateSocketLogic(io) {
  const backendPlayers = {};
  const backendBullets = {};

  io.on("connection", (socket) => {
    console.log("inside connection");
    let currentRoom = "";

    socket.on("createRoom", (roomId) => {

      const existingRooms = io.sockets.adapter.rooms;
        if (existingRooms.has(roomId)) {
            socket.emit("roomError", { message: "The room already exists." });
            return;
        }
      socket.join(roomId);
      currentRoom = roomId;

      if (!backendPlayers[roomId]) {
        backendPlayers[roomId] = {};
      }

      backendPlayers[roomId][socket.id] = {
        x: Math.floor(Math.random() * 1024),
        y: Math.floor(Math.random() * 576),
        color: `hsl(${Math.random() * 360}, ${100}%, ${50}%)`,
        radius: playerRadius,
        requestNumber: 0,
        playerId: socket.id,
      };

      socket.emit("roomCreated", roomId);
      socket.emit("playerCreated", backendPlayers[roomId][socket.id]);
    });

    socket.on("joinRoom", (roomId) => {
      const availablerooms = io.sockets.adapter.rooms;
      if (!availablerooms.has(roomId)) {
        socket.emit("roomError", { message: "The room does not exist." });
        return;
      }

      if (backendPlayers[roomId][socket.id]) {
        socket.emit("roomError", { message: "A player with this ID already exists in the room." });
        return;
      }

      socket.join(roomId);
      currentRoom = roomId;
      backendPlayers[roomId][socket.id] = {
        x: Math.floor(Math.random() * 1024),
        y: Math.floor(Math.random() * 576),
        color: `hsl(${Math.random() * 360}, ${100}%, ${50}%)`,
        radius: playerRadius,
        requestNumber: 0,
        playerId: socket.id,
      };

      socket.emit("roomJoined", roomId);
      console.log("backendPlayers[roomId]: ", backendPlayers[roomId]);
      socket.emit("existingPlayers", backendPlayers[roomId]);
      socket.to(roomId).emit("newPlayer", backendPlayers[roomId][socket.id]);
    });

    socket.on("keydown", (keycode, requestNumber) => {
        backendPlayers[currentRoom][socket.id].requestNumber = requestNumber;
        switch (keycode) {
          case "ArrowUp":
            backendPlayers[currentRoom][socket.id].y -= playerSpeed;
            break;
          case "ArrowDown":
            backendPlayers[currentRoom][socket.id].y += playerSpeed;
            break;
          case "ArrowLeft":
            backendPlayers[currentRoom][socket.id].x -= playerSpeed;
            break;
          case "ArrowRight":
            backendPlayers[currentRoom][socket.id].x += playerSpeed;
            break;
        }
        // io.in(currentRoom).emit("gameState", backendPlayers[currentRoom]);
      });

    socket.on("disconnect", () => {
      console.log("inside disconnect");
      if (currentRoom && backendPlayers[currentRoom][socket.id]) {
        delete backendPlayers[currentRoom][socket.id];
        socket.to(currentRoom).emit("playerLeft", socket.id);
      }
    });

    setInterval(() => {
        io.in(currentRoom).emit("gameState", backendPlayers[currentRoom]);
    }, 1000/60);
  });
}

//   io.on("connect", (socket) => {
//     console.log("inside connect");

//     backendPlayers[socket.id] = {
//       x: Math.floor(Math.random() * 1024),
//       y: Math.floor(Math.random() * 576),
//       color: `hsl(${Math.random() * 360}, ${100}%, ${50}%)`,
//       radius: 10,
//       requestNumber: 0,
//     };

//     io.emit("updateFrontendPlayers", backendPlayers);

//     socket.on("addBullet", ({ x, y, angle }) => {
//       bulletId++;
//       const velocity = {
//         x: Math.cos(angle) * bulletSpeed,
//         y: Math.sin(angle) * bulletSpeed,
//       };
//       const updatedBullet = {
//         x: x,
//         y: y,
//         angle: angle,
//         radius: bulletRadius,
//         color: backendPlayers[socket.id]?.color,
//         velocity: velocity,
//         playerId: socket.id,
//       };

//       backendBullets[bulletId] = updatedBullet;
//       console.log(backendBullets);
//     });

//     //server reconcilliation
//     socket.on("keydown", (keycode, requestNumber) => {
//       backendPlayers[socket.id].requestNumber = requestNumber;
//       switch (keycode) {
//         case "ArrowUp":
//           backendPlayers[socket.id].y -= playerSpeed;
//           break;
//         case "ArrowDown":
//           backendPlayers[socket.id].y += playerSpeed;
//           break;
//         case "ArrowLeft":
//           backendPlayers[socket.id].x -= playerSpeed;
//           break;
//         case "ArrowRight":
//           backendPlayers[socket.id].x += playerSpeed;
//           break;
//       }
//     });

//     socket.on("createRoom", (roomId) => {
//       socket.join(roomId);
//       socket.emit("roomCreated", roomId);
//     });

//     socket.on("joinRoom", (roomId) => {
//       const rooms = io.sockets.adapter.rooms;
//       if (rooms.has(roomId)) {
//         socket.join(roomId);
//         socket.emit("roomJoined", roomId);
//       } else {
//         socket.emit("roomNotFound");
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("inside disconnect");
//       delete backendPlayers[socket.id];
//       io.emit("playerLeft", socket.id);
//     });
//   });

//   function updateBulletsPosition() {
//     for (const bulletId in backendBullets) {
//       backendBullets[bulletId].x += backendBullets[bulletId].velocity.x;
//       backendBullets[bulletId].y += backendBullets[bulletId].velocity.y;

//       //boundary detection

//       if (
//         backendBullets[bulletId].x >= 1024 ||
//         backendBullets[bulletId].x <= 10 ||
//         backendBullets[bulletId].y >= 590 ||
//         backendBullets[bulletId].y <= 5
//       ) {
//         delete backendBullets[bulletId];
//         continue;
//       }

//       //player and bullet collision detection

//       for (const playerId in backendPlayers) {
//         const backEndPlayer = backendPlayers[playerId];

//         const DISTANCE = Math.hypot(
//           backendBullets[bulletId].x - backEndPlayer.x,
//           backendBullets[bulletId].y - backEndPlayer.y
//         );

//         //player Bullet collision detection
//         if (
//           DISTANCE < 5 + backEndPlayer.radius &&
//           backendBullets[bulletId].playerId !== playerId
//         ) {
//           delete backendBullets[bulletId];
//           delete backendPlayers[playerId];
//           break;
//         }
//       }
//     }
//   }

//   setInterval(() => {
//     if (Object.keys(backendBullets).length > 0) {
//       updateBulletsPosition();
//       io.emit("updateBullets", backendBullets);
//     }
//     if (Object.keys(backendPlayers).length > 0) {
//       io.emit("updateFrontendPlayers", backendPlayers);
//     }
//   }, 1000 / 60);
// }

export { initiateSocketLogic };
