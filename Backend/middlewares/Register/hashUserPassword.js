import bcrypt from 'bcrypt';

async function hashUserPassword(req, res, next) {
    console.log("inside hashing");
    try {
      const { name, email, password } = req.validatedUserData;
      const hashedPassword = await bcrypt.hash(password, 10);
      req.hashedPassword = hashedPassword;
      console.log("hashing completed");
      next();
    } catch (error) {
      console.log("error from hashingPassword: ", error);
      next(error);
    }
    console.log("outside hashing");
    next(); // Ensure that next is called even if there is an error
  }

  export { hashUserPassword };