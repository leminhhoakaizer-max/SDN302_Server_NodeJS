import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import enhancedProduct from "../model/product.model.js";
import enhancedCategory from "../model/category.model.js";

import dotenv from "dotenv";
dotenv.config();

// JSON: group -> productId -> [{name, memo}]
const filePath = path.resolve('src/documents/product-category-map.json');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connect successfully');

        // Read + parse file [JSON]
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        // Load all seed "category": Lấy "name" + "_id" -> ObjectId 
        const categories = await enhancedCategory.find().lean();
        // Create Map: categoryName -> ObjectId
        const categoryMap = new Map(categories.map(c => [c.name, c._id]));

        // Duyệt [JSON]: groupName -> products -> productId -> categoryList
        const operations = Object.entries(data).flatMap(([groupName, products]) => 
            Object.entries(products).map(([productId, categoryList]) => {
                // Map categoryName -> ObjectId, name not exist -> filter: bỏ qa 
                const categoryIds = categoryList.map(c => categoryMap.get(c.name)).filter(Boolean);
                
                // return: operation updateOne
                return {
                    updateOne: {
                        filter: { productId }, // Update theo productId
                        update: {
                            $set: {
                                category: categoryIds,
                                productGroup: groupName,
                                updatedAt: new Date()
                            }
                        }
                    }
                };
            })
        );

        // Executive bulkWrite, "ordered: false": lỗi 1 record ko fail all batch update
        const result = await enhancedProduct.bulkWrite(operations, { ordered: false });
        console.log("Product update successfully");
        console.log({
            matched: result.matchedCount, // number product found
            modified: result.modifiedCount // real product bị update
        });

        process.exit(0);

    } catch (error) {
        console.error(' Error:', error.message);
    }
};

run();

// Mục tiêu: Gán "category ObjectId" vào product
// => update "enhancedproducts" collecton
// Step:    - Import && config môi trường
//          - Xác định file [.JSON] nguồn
//          - Connect MongoDB   
//          - Read && parse file [JSON]
//          - Load "all category" từ Database
//          - Build operations bằng flatMap
//          - Map "category name" -> ObjectId
//          - Create "updateOne" cho product
//          - Executive bulkWrite product
//          - Log result && exit
// RUN: [npm run seed:product-category]