import {
  UserModel,
  VerificationTokenModel,
} from "../../Config/mongooseSchemas.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

async function addUserToDatabase(req, res, next) {
  console.log("inside database");
  try {
    const finalUserData = req.updatedUserData;
    finalUserData.hashedPassword = req.hashedPassword;
    console.log("final user data is: ", finalUserData);
    const addUser = new UserModel(finalUserData);
    const savedUser = await addUser.save();
    const userId = savedUser._id;
    console.log("user id is: ", userId);
    req.userId = userId;

    await generateVerificationToken(userId, finalUserData.email);

    console.log("data added to mongoDB successfully");
    res.status(200).send('Please click the link sent on your email to verify your identity');
    next();
  } catch (error) {
    console.log("error while adding user to database: ", error);
    next(error);
  }
  console.log("outside database");
}

async function generateVerificationToken(userId, email) {
  try {
    const verificationToken = crypto.randomBytes(64).toString("hex");
    const addVerificationToken = new VerificationTokenModel({
      userId,
      token: verificationToken,
    });
    const response = await addVerificationToken.save();
    console.log("token added successfully: ", response);
    await sendEmailVerificationLink(email, verificationToken);
  } catch (error) {
    console.log("error while generating token: ", error);
    throw error;
  }
}

async function sendEmailVerificationLink(email, verificationToken) {
  const verificationLink = `http://localhost:4000/verify?token=${verificationToken}`;

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
      text: "Click the following link to verify your email address:",
      html: `<p><a href="${verificationLink}">Click here</a></p>`,
    };

    const mailResponse = await transport.sendMail(mailOptions);
    console.log("link sent: ", mailResponse);
  } catch (error) {
    console.log("error while sending verification link: ", error);
    throw new Error(error.message);
  }
}

export { addUserToDatabase };
