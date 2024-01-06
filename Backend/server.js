import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initiateSocketLogic } from './services/socketLogic.js'
import cors from "cors";
import cookieParser from "cookie-parser";
import { initiateMongooseConnection } from "./Config/initializeMongoose.js";
import dotenv from "dotenv";
import { validateUserDetails } from './middlewares/Register/validateUserDetails.js'
import { hashUserPassword } from './middlewares/Register/hashUserPassword.js'
import { addUserToDatabase } from './middlewares/Register/addUserToDatabase.js'
import { createJsonToken } from './middlewares/EmailVerification/createJsonToken.js'
import { verifyUserEmail } from './middlewares/EmailVerification/verifyUserEmail.js'
import { verifyToken } from './middlewares/Login/verifyToken.js'

const app = express();
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://gun-glory-absn2kvc8-lokendra-sinh.vercel.app/",
  },
});
app.use(express.json());
app.use(
  cors({
    origin: "https://gun-glory-absn2kvc8-lokendra-sinh.vercel.app/",
  })
);
app.use(cookieParser());
dotenv.config();

initiateSocketLogic(io);
initiateMongooseConnection();


app.post(
  "/register",
  validateUserDetails,
  hashUserPassword,
  addUserToDatabase,
  (req, res, next) => {

    res.status(200).send("user registered successfully");
  }
);

app.post('/verify-email', verifyUserEmail, createJsonToken, (req, res, next) => {
})

app.post("/login", verifyToken, (req, res, next) => {
})

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