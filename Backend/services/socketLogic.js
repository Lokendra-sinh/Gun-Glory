import { set } from "mongoose";


function initiateSocketLogic(io) {
  const rooms = {};
  const backendPlayers = {};
  const backendBullets = {};
  const bulletSpeed = 5;
const playerSpeed = 10;
const bulletRadius = 5;
const playerRadius = 10;
let bulletId = 0;

  io.on("connection", (socket) => {
    console.log("inside connection");
    let currentRoom = "";

    socket.on("createRoom", (roomId) => {

      const existingRooms = io.sockets.adapter.rooms;
        if (existingRooms.has(roomId)) {
            socket.emit("roomError", { message: "The room already exists. Either join the room or create a new one" });
            return;
        }
      socket.join(roomId);
      currentRoom = roomId;

      if (!backendPlayers[roomId]) {
        backendPlayers[roomId] = {};
      }

      if (!backendBullets[roomId]) {
        backendBullets[roomId] = {};
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

      if(rooms[roomId] && rooms[roomId]["gameStarted"]){
        socket.emit("roomError", { message: "The game has already started in this room." });
        return;
      }

      if(availablerooms.get(roomId).size >= 5){
        socket.emit("roomError", { message: "The room is full but you can join another room"});
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

    socket.on("gameStarted", (roomId) => {
      if(rooms[roomId] && rooms[roomId]["gameStarted"]){
        socket.emit("roomError", { message: "The game has already started in this room." });
      } else {
        rooms[roomId] = {gameStarted: true};
        io.in(roomId).emit("gameStarted", roomId);
      }
    });

    socket.on("gameStopped", (roomId) => {
      if(rooms[roomId] && rooms[roomId]["gameStarted"]){
        rooms[roomId] = {gameStarted: true};
        delete backendPlayers[roomId];
      } else {
        socket.emit("roomError", { message: "The room does not exist"});
      }
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
            color: backendPlayers[currentRoom][socket.id]?.color,
            velocity: velocity,
            playerId: socket.id,
        };
    
        backendBullets[currentRoom][bulletId] = updatedBullet;
        console.log(backendBullets);
    });  

    socket.on("disconnect", () => {
      console.log("inside disconnect");
      if (currentRoom && backendPlayers[currentRoom][socket.id]) {
        delete backendPlayers[currentRoom][socket.id];
        socket.to(currentRoom).emit("playerLeft", socket.id);
      }
    });

    setInterval(() => {
        if(backendPlayers[currentRoom] && Object.keys(backendPlayers[currentRoom]).length > 0){
            io.in(currentRoom).emit("gameState", backendPlayers[currentRoom]);
        }
    
        if(backendBullets[currentRoom] && Object.keys(backendBullets[currentRoom]).length > 0){
            updateBulletsPosition();
            io.in(currentRoom).emit("updateBullets", backendBullets[currentRoom]);
        };
        
    }, 1000/60);

    function updateBulletsPosition() {
        for (const bulletId in backendBullets[currentRoom]) {
          backendBullets[currentRoom][bulletId].x += backendBullets[currentRoom][bulletId].velocity.x;
          backendBullets[currentRoom][bulletId].y += backendBullets[currentRoom][bulletId].velocity.y;
    
          //boundary detection
    
          if (
            backendBullets[currentRoom][bulletId].x >= 1024 ||
            backendBullets[currentRoom][bulletId].x <= 10 ||
            backendBullets[currentRoom][bulletId].y >= 590 ||
            backendBullets[currentRoom][bulletId].y <= 5
          ) {
            delete backendBullets[currentRoom][bulletId];
            continue;
          }
    
          //player and bullet collision detection
    
          for (const playerId in backendPlayers[currentRoom]) {
            const backEndPlayer = backendPlayers[currentRoom][playerId];
    
            const DISTANCE = Math.hypot(
              backendBullets[currentRoom][bulletId].x - backEndPlayer.x,
              backendBullets[currentRoom][bulletId].y - backEndPlayer.y
            );
    
            //player Bullet collision detection
            if (
              DISTANCE < 5 + backEndPlayer.radius &&
              backendBullets[currentRoom][bulletId].playerId !== playerId
            ) {
              delete backendBullets[currentRoom][bulletId];
              delete backendPlayers[currentRoom][playerId];
              break;
            }
          }
        }
      }
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
