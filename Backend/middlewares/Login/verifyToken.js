import jwt from 'jsonwebtoken';
import { UserModel } from '../../Config/mongooseSchemas.js';




async function verifyToken(req, res, next){
   try{
    console.log("verify token middleware");
    console.log("headers are: ", req.headers);
      const token = req.headers.authorization;
      if(!token){
        console.log("no token found");
        return res.status(401).send('Unauthorized');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded values are: ", decoded);
      const user = await UserModel.findById(decoded.userId);
      if(!user){
        return res.status(401).send('User does not exist!');
      }
      console.log("decoded values are: ", decoded);
      res.status(200).json({name: user.name, email: user.email});
      next();
   } catch (error){
     console.log("error while verifying the token: ", error);
     next(error);
   }
    

}

export { verifyToken };