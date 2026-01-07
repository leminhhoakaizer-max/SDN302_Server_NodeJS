import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

const dbURL = process.env.MONGODB_URL;

// connect to MogoDB => Luôn dùng [async/await] methods
export const DBConnection = async () => {
    try {
        await mongoose.connect(dbURL);
        console.log('DB URL: ', dbURL);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('Error connecting to MongoDB: ', error);
        process.exit(1); // Exit khỏi application khi "Connection failed"
    }
}