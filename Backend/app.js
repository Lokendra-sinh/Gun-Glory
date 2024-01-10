import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initiateSocketLogic } from './services/socketLogic.js'
import cors from "cors";
import cookieParser from "cookie-parser";
import { initiateMongooseConnection } from "./config/initializeMongoose.js";
import dotenv from "dotenv";
import { validateUserDetails } from './middlewares/Register/validateUserDetails.js'
import { hashUserPassword } from './middlewares/Register/hashUserPassword.js'
import { addUserToDatabase } from './middlewares/Register/addUserToDatabase.js'
import { createJsonToken } from './middlewares/EmailVerification/createJsonToken.js'
import { verifyUserEmail } from './middlewares/EmailVerification/verifyUserEmail.js'
import { verifyToken } from './middlewares/Login/verifyToken.js'

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  "https://gun-glory-frontend.vercel.app",
  "http://localhost:5173", 
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
  },
});

app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);


app.use(cookieParser());
dotenv.config();

initiateSocketLogic(io);
initiateMongooseConnection();

app.get("/", (req, res, next) => {
  res.status(200).send("hello world");
});

app.post(
  '/register',
  validateUserDetails,
  hashUserPassword,
  addUserToDatabase,
  (req, res, next) => {

    res.status(200).send("user registered successfully");
  }
);

app.post('/verify-email', verifyUserEmail, createJsonToken, (req, res, next) => {
})

app.post('/login', verifyToken, (req, res, next) => {
})

app.use((err, req, res, next) => {
  if(err instanceof Error){
    if(err.message === "Not allowed by CORS"){
      return res.status(403).json({message: "Not allowed by CORS"});
    }
  }
  
  res.status(500).json({ message: err});
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});