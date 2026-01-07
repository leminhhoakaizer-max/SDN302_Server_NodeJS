import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

import enhancedCategory from "../model/category.model.js";

// File [JSON] mapping: productId -> categories
const filePath = path.resolve("src/documents/product-category-map.json");

// normalize(string): hàm chuẩn hóa, tránh duplicate
const normalize = string => string.trim().toLowerCase();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connect successfully");

        // Read + parse: JSON data
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        // Dùng Map() để unique theo name
        const categoryMap = new Map();

        // Flatten all "categories" từ file [JSON]
        const allCategories = Object.values(data)
            .flatMap(group => Object.values(group)).flatMap(categories => categories);

        // Gom categories unique
        for (const { name, memo } of allCategories) {
            const key = normalize(name);
            if (!categoryMap.has(key)) {
                categoryMap.set(key, { name, memo });
            }
        }

        if (categoryMap.size === 0) {
            console.log("No categories found");
            process.exit(0);
        }

        // create "slug" chuẩn SEO
        const slugify = string => string
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "") // Delete all "not valid" chacacters trong slug
                .replace(/\s+/g, "-"); // all characters không phải chữ, số, space hoặc "-"

        // bulkWrite operations,
        // category: chưa có -> insert, đã có -> bỏ qua
        const operations = [...categoryMap.values()].map(({ name, memo }) => {
            const slug = slugify(name);
            return {
                updateOne: {
                    // match existing by slug OR by exact name to avoid duplicate-name inserts
                    filter: { $or: [{ slug }, { name }] },
                    update: { $setOnInsert: {
                        name,
                        memo,
                        slug,
                        createdAt: new Date()
                    } },
                    upsert: true
                }
            };
        });

        // Executive(thực thi) bulkWrite
        const result = await enhancedCategory.bulkWrite(operations, { ordered: false });
        console.log("Update categories successfully",
            {
                inserted: result.upsertedCount,
                matched: result.matchedCount
            }
        );
        process.exit(0);
    } catch (error) {
        console.error("Seed categories failed:", error);
        process.exit(1);
    }
};

run();

// Mục tiêu: Từ file "src/documents/product-category-map.json" 
// => Create "seed" cho "enhancedcategories" collecton
// Step:    - Import && config môi trường
//          - Xác định file [.JSON] nguồn
//          - "normalize" function => tránh duplicate
//          - Connect MongoDB
//          - Read && parse file [JSON]
//          - Gom "all category" trong [JSON]: Flatten
//          - Unique category => Map()
//          - Stop => nếu ko có category
//          - Create "slug" chuẩn SEO (Search Engine Optimization)
//          - Create "bulkWrite" operations
//          - Executive bulkWrite
//          - Log result && exit
//RUN: [npm run seed:categories]