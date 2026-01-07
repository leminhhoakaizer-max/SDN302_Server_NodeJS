import Products from '../model/product.model.js';
import Accounts from "../model/seeds/account.migration.model.js";
import Categories from "../model/seeds/category.migration.model.js";

import { buildProduct } from './product.build.js';

// Map "Categories" collection => Dùng Object.fromEntries() function
async function mapCategories(typeIds = []) {
    const ids = [...new Set(typeIds)].map(Number).filter(Number.isFinite);
    if(!ids.length) return {};

    const items = await Categories.find({
        typeId: { $in: ids }
    }).lean();

    return Object.fromEntries(items.map(c => [String(c.typeId), c._id]));
}

// Map "Accounts" collection => Dùng reduce() function
async function mapAccounts(identifiers = []) {
    const ids = Array.from(identifiers).filter(v => typeof v === "string");
    if (!ids.length) return {};

    // Tìm accounts theo email hoặc account(username)
    const items = await Accounts.find({
        $or: [
            { email: { $in: ids } },
            { account: { $in: ids } }
        ]
    }).lean();

    return Object.fromEntries(
        items.flatMap(a => [
            ...(a.email ? [[a.email, a._id]] : []),
            ...(a.account ? [[a.account, a._id]] : [])
        ])
    );
}

export async function seedProductEnhancer(rawProducts) {
    try {
        // 1. Lấy tất cả categories (loại trùng)
        const categoryKeys = [
            ...new Set(rawProducts.map(p => p.typeId).filter(v => v !== undefined && v !== null)
            )];

        // 2. Lấy tất cả account identifiers (có thể là email hoặc account username)
        const accountKeys = [...new Set(rawProducts.map(p => p.account).filter(Boolean))];

        // 3. Build Maps chạy song song
        const [categoryMap, accountMap] = await Promise.all([
            mapCategories(categoryKeys),
            mapAccounts(accountKeys)
        ]);

        // 4. Build products đã enhanced (pass index so extraFields can align)
        const enhancedProducts = rawProducts.map(p => buildProduct(p, categoryMap, accountMap));

        // 5. Insert vào DB
        await Products.insertMany(enhancedProducts);

        console.log("Seed Product Enhancer: DONE");
    } catch (err) {
        console.error("Seed Product Enhancer error:", err);
    }
}

// Mục tiêu: Điều phối "migrate" toàn bộ rawProducts -> enhancedProduct
// Step:    - import "buidProuct" && model
//          - Map rawCategories -> ObjectId:    - Nhận list "typeId"
//                                              - Query collection Categories
//                                              - Dùng Object.fromEntries() để lookup
//          - Map rawAccount -> ObjectId:   - rawProduct chỉ lưu [email, username]
//                                          - Map cả 2 -> cùng ObjectId
//          - seedProductEnhancer(rawProduct)   - Gom all "category" keys (unique)
//                                              - Gom all "account" identifiers
//                                              - Build lookup maps song song
//          - Build enhancedProducts
//          - Insert vào enhancedProducts collection
//          - Log && finish