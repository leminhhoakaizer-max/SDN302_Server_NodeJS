import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import RawProduct from "../model/seeds/product.migration.model.js";
import { seedProductEnhancer } from "../build/productSeed.build.js";

await mongoose.connect(process.env.MONGODB_URL);
console.log("Database connection successfully!");

// Lấy "raw(old data)" from [ElectronicProduct/products] collection
const rawProducts = await RawProduct.find({}).lean();

// [Mapping + Insert] vào [ElectronicProduct/enhancedProducts] collection
await seedProductEnhancer(rawProducts);
console.log("Migrating Products successfully!");

process.exit();

// Mục tiêu: Di chuyển && chuẩn hóa "product data" từ [Old/Raw data] => [New/Normalize data]
// Old/Raw data: [products, categories, accounts] collection
// New/Normalize data: [enhancedproducts] collection
// RUN: [npm run migrate:products]