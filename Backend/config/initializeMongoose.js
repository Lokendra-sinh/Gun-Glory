import mongoose from 'mongoose';

async function initiateMongooseConnection(){
    try {
        const response = await mongoose.connect('mongodb+srv://anizen242:Dqypr5150p@cluster0.6868zwh.mongodb.net/');
        console.log('Connected to MongoDB');
        return response; // You might not need to return anything, but it can be useful
      } catch (error) {
        console.log('Error from mongoose: ', error);
        throw error; // Rethrow the error for handling in the main file
      }
}

export { initiateMongooseConnection };