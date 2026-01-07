import slugify from "slugify";

export function buildCategory(rawCategory, adminUserId) {
    return {
        name: rawCategory.categoryName,
        slug: slugify(rawCategory.categoryName, { lower: true, strict: true }),
        memo: rawCategory.memo || "",
        isActive: true,
        createdBy: adminUserId,
    };
}