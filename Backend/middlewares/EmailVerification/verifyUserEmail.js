import { VerificationTokenModel, UserModel } from "../../Config/mongooseSchemas.js";

async function verifyUserEmail(req, res, next){
    const extractedToken = req.query.token;

    try{
    const verificationToken = await VerificationTokenModel.findOne({token: extractedToken});
    if(!verificationToken){
        return res.status(404).send('Invalid Verification Token');
    }

    const extractedUserId = verificationToken.userId;
    const user = await UserModel.findById(extractedUserId);
    req.user = user;
    req.userId = extractedUserId;
    if(!user){
        return res.status(404).send('User not found!');
    }

    user.active = true;
    await user.save();

    // // await VerificationTokenModel.deleteOne({})
    // res.status(200).send('Email Verification Successful. You can now log in');
    next();

    } catch (error){
        console.log("error while verufying user email: ", error);
        next(error);
    }

}

export { verifyUserEmail };