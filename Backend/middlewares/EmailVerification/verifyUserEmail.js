import { VerificationTokenModel, UserModel } from "../../config/mongooseSchemas.js";

async function verifyUserEmail(req, res, next){
    console.log("inside verify user email");
    const { verificationCode } = req.body;

    try{
    const verificationToken = await VerificationTokenModel.findOne({token: verificationCode});
    if(!verificationToken){
        return res.status(404).send('Invalid Verification Code!');
    }

    const extractedUserId = verificationToken.userId;
    const user = await UserModel.findById(extractedUserId);
    req.user = user;
    req.userId = extractedUserId;
    if(!user){
        return res.status(404).send('User not found!');
    }

    user.verified = true;
    await user.save();

    await VerificationTokenModel.deleteOne({token: verificationCode})
    // res.status(200).send('Email Verification Successful. You can now log in');
    next();

    } catch (error){
        console.log("error while verufying user email: ", error);
        next(error);
    }

}

export { verifyUserEmail };