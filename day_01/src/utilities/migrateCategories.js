import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import RawCategory from "../model/seeds/category.migration.model.js";
import { seedCategoryEnhancer } from "../build/categorySeed.build.js";
import User from "../model/user.model.js";

await mongoose.connect(process.env.MONGODB_URL);
console.log("Database connection successfully!");

// Lấy Admin User để gán vào trường "createdBy"
// Option 1: prefer admin found by role
let admin = await User.findOne({ role: 'admin' }).lean();
// Option 2: allow overriding admin via env var SEED_ADMIN_ID
if (!admin && process.env.SEED_ADMIN_ID) {
	admin = await User.findById(process.env.SEED_ADMIN_ID).lean();
}
if (!admin) {
	console.error('No admin user found. Create an admin account or set SEED_ADMIN_ID in .env');
	process.exit(1);
}

// Lấy "raw(old data)" from [ElectronicProduct/categories] collection
const rawCategories = await RawCategory.find({}).lean();

// [Mapping + Insert] vào [ElectronicProduct/enhancedCategories] collection
await seedCategoryEnhancer(rawCategories, admin._id);

console.log("Migrating Categories successfully!");
process.exit();