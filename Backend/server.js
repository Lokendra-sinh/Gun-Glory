import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initiateSocketLogic } from './services/socketLogic.js'
import cors from "cors";
import { initiateMongooseConnection } from "./Config/initializeMongoose.js";
import dotenv from "dotenv";
import { validateUserDetails } from './middlewares/Register/validateUserDetails.js'
import { hashUserPassword } from './middlewares/Register/hashUserPassword.js'
import { addUserToDatabase } from './middlewares/Register/addUserToDatabase.js'
import { createJsonToken } from './middlewares/EmailVerification/createJsonToken.js'


const app = express();
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
dotenv.config();

initiateSocketLogic(io);
initiateMongooseConnection();


app.post(
  "/register",
  validateUserDetails,
  hashUserPassword,
  addUserToDatabase,
  createJsonToken,
  (req, res, next) => {
    console.log("inside register route");
  }
);


app.post("/login", )

app.use((err, req, res, next) => {
  console.log("error is: ", err);
  res.status(500).json({ errors: err });
});

app.listen(4000, () => {
  console.log("express server running at 4000");
});

httpServer.listen(3000, () => {
  console.log("http server is running");
});