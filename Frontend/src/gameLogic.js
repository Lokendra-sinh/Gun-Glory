// // import io from "socket.io-client";
// import gsap from 'gsap';

// // const socket = io("http://localhost:3000");

// // const canvas = document.getElementById("canvas");
// const ctx = canvas.getContext("2d");
// const dpi = window.devicePixelRatio || 1;
// canvas.width = 1024;
// canvas.height = 576;
// ctx.scale(dpi, dpi);

// const frontendPlayers = {};
// const frontendBullets = {};
// const playerRequests = [];
// let requestNumber = 0;
// const playerSpeed = 10;
// const t = 0.5;
// const keys = [];

// socket.on("updateFrontendPlayers", (backendPlayers) => {
//   for (const id in backendPlayers) {
//     const backendPlayer = backendPlayers[id];
//     if (!frontendPlayers[id]) {
//       frontendPlayers[id] = backendPlayer;
//     } else if (frontendPlayers[id]) {
//       if (id === socket.id) {
//         const lastProcessedRequestIndex = playerRequests.findIndex(
//           (request) => {
//             return request.requestNumber === backendPlayer.requestNumber;
//           }
//         );

//         if (lastProcessedRequestIndex > -1) {
//           playerRequests.splice(0, lastProcessedRequestIndex + 1);

//           playerRequests.forEach((request) => {
//             frontendPlayers[id].x += request.vx;
//             frontendPlayers[id].y += request.vy;
//           });
//         }
//       } else {

//         //apply interpolation for smooth animation
//         // frontendPlayers[id].x = lerp(frontendPlayers[id].x, backendPlayer.x, t);
//         // frontendPlayers[id].y = lerp(frontendPlayers[id].y, backendPlayer.y, t);

//         gsap.to(frontendPlayers[id], {
//           duration: 0.2, // Adjust the duration as needed
//           x: backendPlayer.x,
//           y: backendPlayer.y,
//           ease: 'power1.out', // Linear ease-out
//         });
//       }
//     }
//   }

//   //deleting frontend players

//   for (const id in frontendPlayers) {
//     if (!backendPlayers[id]) {
//       delete frontendPlayers[id]
//     }
//   }

// });

// socket.on('updateBullets', (bullets) => {
//   console.log("bullets are: ", bullets);

//   for(const bulletId in frontendBullets){
//     if(!bullets[bulletId]){
//       delete frontendBullets[bulletId];
//       // continue;
//     }
//   }

//   for(const id in bullets){
//     if(!frontendBullets[id]){
//       frontendBullets[id] = bullets[id];
//     } else {
//       frontendBullets[id].x += frontendBullets[id].velocity.x;
//       frontendBullets[id].y += frontendBullets[id].velocity.y;
//     }
//   }
// })


// function lerp(start, end, t){
//   return start + (end -start) * t;
// }

// socket.on("playerLeft", (playerId) => {
//   delete frontendPlayers[playerId];
// });

// function animate() {
//   requestAnimationFrame(animate);
//   ctx.fillStyle = "rgba(0,0,0,1)";
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   for (const id in frontendPlayers) {
//     const player = frontendPlayers[id];
//     // console.log("player is: ", player);
//     drawPlayer(player);
//   }

//   for(const id in frontendBullets){
//     const bullet = frontendBullets[id];
//     console.log("bullet is: ", bullet);
//     drawBullet(bullet);
//   }

//   // if(!frontendPlayers[socket.id]){
//   //   window.location.reload();
//   // }
// }

// animate();

// function drawPlayer({ x, y, radius, color }) {
//   ctx.beginPath();
//   ctx.shadowColor = color;
//   ctx.shadowBlur = 30;
//   ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
//   ctx.fillStyle = color;
//   ctx.fill();
//   ctx.closePath();
// }

// function drawBullet({ x, y, radius, color }) {
//   ctx.beginPath();
//   ctx.arc(x, y, radius, 0, Math.PI * 2, false);
//   ctx.fillStyle = color;
//   ctx.fill();
//   ctx.closePath();
// }

// function updatePlayerPosition() {
//   if (keys["ArrowUp"]) {
//     requestNumber++;
//     playerRequests.push({ requestNumber, vx: 0, vy: -playerSpeed });
//     frontendPlayers[socket.id].y -= playerSpeed;
//     socket.emit("keydown", "ArrowUp", requestNumber);
//   }

//   if (keys["ArrowDown"]) {
//     requestNumber++;
//     playerRequests.push({ requestNumber, vx: 0, vy: playerSpeed });
//     frontendPlayers[socket.id].y += playerSpeed;
//     socket.emit("keydown", "ArrowDown", requestNumber);
//   }

//   if (keys["ArrowLeft"]) {
//     requestNumber++;
//     playerRequests.push({ requestNumber, vx: -playerSpeed, vy: 0 });
//     frontendPlayers[socket.id].x -= playerSpeed;
//     socket.emit("keydown", "ArrowLeft", requestNumber);
//   }

//   if (keys["ArrowRight"]) {
//     requestNumber++;
//     playerRequests.push({ requestNumber, vx: playerSpeed, vy: 0 });
//     frontendPlayers[socket.id].x += playerSpeed;
//     socket.emit("keydown", "ArrowRight", requestNumber);
//   }
// }

// setInterval(updatePlayerPosition, 1000/60);



// window.addEventListener("keydown", (event) => {
//   keys[event.key] = true;
// });

// window.addEventListener("keyup", (event) => {
//   keys[event.key] = false;
// });

// canvas.addEventListener("click", (event) => {
//   // console.log("mouse clicked: ", event.clientX, event.clientY);
//   const c = canvas.getBoundingClientRect();
//   // console.log("canvas: ", c.top, c.left);
//   const player = {
//     x: frontendPlayers[socket.id].x,
//     y: frontendPlayers[socket.id].y,
//   }
//   console.log("player: ", frontendPlayers[socket.id].x, frontendPlayers[socket.id].y);

//   const mouseX = (event.clientX - c.left) / dpi;
//   const mouseY = (event.clientY - c.top) / dpi;

//   console.log("mousecanvas: ", mouseX, mouseY);
//   const shotAngle = Math.atan2(mouseY - player.y, mouseX - player.x);
//   console.log(shotAngle);

//   const bullet = {
//     x: player.x,
//     y: player.y,
//     angle: shotAngle,
//   }
 
//   console.log("bullet: ", bullet.x, bullet.y);
//   socket.emit("addBullet", bullet);
// });