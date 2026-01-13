import mongoose from 'mongoose';

const dbURL = process.env.MONGODB_URL;
let isConnected = false;

export const DBConnection = async () => {
  try {
    if (!dbURL) {
      throw new Error('MONGODB_URL is not defined');
    }

    if (isConnected) return;

    await mongoose.connect(dbURL);
    isConnected = true;

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};
