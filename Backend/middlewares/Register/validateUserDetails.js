import { userSchema } from '../../config/schemas.js';

function validateUserDetails(req, res, next) {
    console.log("inside validateUserDetails", req.body);
    try {
      const userData = req.body;
      userSchema.parse(userData);
      userData.verified = false;
      req.updatedUserData = userData;
      console.log("user data validated successfully: ", userData);
      next();
    } catch (error) {
      console.log("error while validating user data: ", error.message);
      next(error.message);
    }
  }

  export { validateUserDetails };