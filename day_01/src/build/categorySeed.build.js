import enhancedCategory from "../model/category.model.js";
import { buildCategory } from "./category.build.js";

export async function seedCategoryEnhancer(rawCategories, adminUserId) {
    const enhanced = rawCategories.map(c => buildCategory(c, adminUserId));
    await enhancedCategory.insertMany(enhanced);
    console.log("Seeding Categories successfully!");
}