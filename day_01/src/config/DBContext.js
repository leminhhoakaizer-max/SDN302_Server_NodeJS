import mongoose from 'mongoose';
import 'dotenv/config';

const dbURL = process.env.MONGODB_URL;

// connect to MogoDB => Luôn dùng [async/await] methods
export const DBConnection = async () => {
  try {
    if (!dbURL) {
      throw new Error('MONGODB_URL is not defined');
    }

    await mongoose.connect(dbURL);
    console.log('DB URL:', dbURL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};