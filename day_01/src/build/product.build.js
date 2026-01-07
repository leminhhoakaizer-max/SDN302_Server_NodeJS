import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { DEFAULT_PRODUCT_FIELDS } from "./productDefault.build.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read [.JSON] file
const extraFieldsData = readFileSync(
    `${__dirname}/../documents/ElectronicProduct.products.json`, 'utf-8');
const extraFields = JSON.parse(extraFieldsData);

// Build mapping theo "productId"
const extraByProductId = Object.fromEntries(extraFields.map(e => [String(e.productId), e]));

export function buildProduct(rawItem, categoryMap, accountMap) {

    const mappedCategories = rawItem.typeId ? 
    [categoryMap[String(rawItem.typeId)]].filter(Boolean) : [];

    // Map email ⇒ accountId
    const mappedAccount = accountMap[rawItem.account] ?? null;

    // Lấy "EXTRA" theo [productId]
    const extra = extraByProductId[String(rawItem.productId)] || {};

    return {
        productId: rawItem.productId,
        productName: rawItem.productName,
        description: rawItem.brief || rawItem.description || "No description",
        productImage: {
            url: rawItem.productImage || "/images/default.jpg",
            alt: rawItem.productName
        },
        category: mappedCategories,

        price: rawItem.price ?? 0,
        discount: rawItem.discount ?? 0,

        ...DEFAULT_PRODUCT_FIELDS,

        // Override từ file ".json"
        brand: extra.brand ?? DEFAULT_PRODUCT_FIELDS.brand,
        stock: extra.stock ?? DEFAULT_PRODUCT_FIELDS.stock,
        hashTag: extra.hashTag ?? DEFAULT_PRODUCT_FIELDS.hashTag,
        ratings: extra.ratings ?? DEFAULT_PRODUCT_FIELDS.ratings,
        isActive: extra.isActive ?? true,

        account: mappedAccount,
        unit: rawItem.unit || "Cái"
    };
}

// Mục tiêu: Normalize [rawProduct] => [enhancedProduct]
// Step:    - Import "default field" && config môi trường
//          - Read file: ElectronicProduct.products.json => chứa Extra business field
//          - Parse JSON && build lookup(tra cứu) theo productId
//          - buildProduct(rawItem, categoryMap, accountMap)
//          - Map raw "typeId" -> category ObjectId
//          - Map account(email, usename) -> account ObjectId
//          - Load extra business fields từ JSON theo productId
//          - Build && return "enhancedProduct" object