import {
  UserModel,
  VerificationTokenModel,
} from "../../config/mongooseSchemas.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import MongoServerError from "mongodb";

async function addUserToDatabase(req, res, next) {
  console.log("inside addUserTodatabase");
  try {
    const finalUserData = req.updatedUserData;
    finalUserData.password = req.hashedPassword;
    console.log("final user data is: ", finalUserData);
    const addUser = new UserModel(finalUserData);
    const savedUser = await addUser.save();
    const userId = savedUser._id;
    console.log("user id is: ", userId);
    req.userId = userId;

    await generateVerificationCode(userId, finalUserData.email);

    console.log("data added to mongoDB and link sent successfully");
    next();
  } catch (error) {
    return res.status(409).json({ message: "Email ID already exists"});
   }
  console.log("outside database");
}

async function generateVerificationCode(userId, email) {
  try {
    const verificationCode = crypto.randomBytes(3).toString("hex");
    const addVerificationCode = new VerificationTokenModel({
      userId,
      token: verificationCode,
    });
    const response = await addVerificationCode.save();
    console.log("token added successfully: ", response);
    await sendEmailVerificationLink(email, verificationCode);
  } catch (error) {
    console.log("error while generating token: ", error);
    throw error;
  }
}

async function sendEmailVerificationLink(email, verificationToken) {

  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify your email address",
      text: "Here's your verification code:",
      html: `<h1>Here is your verification code for GunGlory</h1>
              <p>${verificationToken}</p>`,
    };

    const mailResponse = await transport.sendMail(mailOptions);
    console.log("link sent: ", mailResponse);
  } catch (error) {
    console.log("error while sending verification link: ", error);
    throw new Error(error.message);
  }
}

export { addUserToDatabase };
