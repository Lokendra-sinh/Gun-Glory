import jwt from 'jsonwebtoken';


async function createJsonToken(req, res, next) {
    console.log("inside token")
    try{
      const { name, email } = req.user;
      const userId = req.userId;
      const token = jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      console.log("json token generated successfully");
      res.status(200).json({token: token, name: name, email: email});
      next();
    } catch (error){
      console.log("error while generating token: ", error);
      next(error);
    }
  }

  export { createJsonToken };