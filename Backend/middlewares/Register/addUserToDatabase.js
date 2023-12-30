import { UserModel } from "../../Config/mongooseSchemas.js";

async function addUserToDatabase(req, res, next) {
    console.log("inside database");
    try {
      const { name, email, password } = req.body;
      const hashedPassword = req.hashedPassword;
      const addUser = new UserModel({ name, email, password: hashedPassword});
      const savedUser = await addUser.save();
      const userId = savedUser._id;
      console.log("user idis: ", userId);
      req.userId = userId;
      console.log("data added to mongoDB successfully");
      next();
    } catch (error) {
      console.log("error while adding user to database: ", error);
      next(error);
    }
    console.log("outside database");
  }

  export { addUserToDatabase };