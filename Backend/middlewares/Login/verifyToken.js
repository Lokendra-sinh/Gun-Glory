import jwt from 'jsonwebtoken';
import { UserModel } from '../../Config/mongooseSchemas.js';




async function verifyToken(req, res, next){
   try{
      const token = req.cookies.access_token;
      if(!token){
        return res.status(401).send('Unauthorized');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await UserModel.findById(decoded.userId);
      if(!user){
        return res.status(401).send('User does not exist!');
      }
      const userData = {
        name: user.name,
        email: user.email,
      }
      req.user = userData;
      console.log("decoded values are: ", decoded);
      next();
   } catch (error){
     console.log("error while verifying the token: ", error);
     next(error);
   }
    

}

export { verifyToken };