import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function createJsonToken(req, res, next) {
    console.log("inside token")
    try{
      const { name, email } = req.user;
      const userId = req.userId;
      const token = jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      res.cookie('access_token', token, { httpOnly: true });

      const currentModulePath = fileURLToPath(import.meta.url);
        const currentModuleDir = dirname(currentModulePath);

      res.status(200).sendFile('verificationSuccess.html', { root: currentModuleDir});
      console.log("json token sent successfully");
      next();
    } catch (error){
      console.log("error while generating token: ", error);
      next(error);
    }
  }

  export { createJsonToken };