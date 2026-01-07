import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     EnhancedProduct:
 *       type: object
 *       required:
 *         - productId
 *         - productName
 *         - description
 *         - productImage
 *         - category
 *         - price
 *         - brand
 *         - stock
 *         - unit
 *       properties:
 *         _id:
 *           type: string
 *           example: 693d7719db731a793078eb60
 *
 *         productId:
 *           type: string
 *           example: "1010010007"
 *
 *         productName:
 *           type: string
 *           example: iPhone 17 Pro Max
 *
 *         description:
 *           type: string
 *           example: iPhone flagship cao cấp nhất
 *
 *         productImage:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               example: images/products/iphone17.jpg
 *             alt:
 *               type: string
 *               example: iphone17
 *
 *         category:
 *           type: array
 *           description: List of category ObjectIds
 *           items:
 *             type: string
 *             example: 694d07daa7cc16da66fc7066
 *
 *         price:
 *           type: number
 *           example: 42990000
 *
 *         discount:
 *           type: number
 *           example: 5
 *
 *         newPrice:
 *           type: number
 *           example: 40840500
 *
 *         brand:
 *           type: string
 *           example: Apple
 *
 *         stock:
 *           type: number
 *           example: 8
 *
 *         hashTag:
 *           type: array
 *           items:
 *             type: string
 *           example: ["apple", "flagship"]
 *
 *         ratings:
 *           type: object
 *           properties:
 *             average:
 *               type: number
 *               example: 4.9
 *             count:
 *               type: number
 *               example: 1230
 *
 *         isActive:
 *           type: boolean
 *           example: true
 *
 *         unit:
 *           type: string
 *           example: Cái
 *
 *         postedDate:
 *           type: string
 *           format: date-time
 *
 *         account:
 *           type: string
 *           example: 69367b7a027183bfc0bc7c84
 *
 *         createdBy:
 *           type: string
 *           example: 69367b7a027183bfc0bc7c84
 *
 *         updatedBy:
 *           type: string
 *           example: 69367b7a027183bfc0bc7c99
 *
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const enhancedProductSchema = new mongoose.Schema(
    {
        productId: { type: String, required: true, unique: true, index: true },
        productName: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },

        productImage: {
            url: { type: String, required: true },
            alt: { type: String, default: "" }
        },

        // liên kết với categories collection
        category: [
            { type: mongoose.Schema.Types.ObjectId, ref: "enhancedCategory", required: true }
        ],

        price: { type: Number, required: true, default: 0, min: 0 },

        // Đến "Cart(giỏ hàng)" mới thêm
        newPrice: { type: Number, min: 0 },

        discount: { type: Number, default: 0, min: 0, max: 100 },

        brand: { type: String, required: true, default: "No brand", trim: true },

        stock: { type: Number, required: true, default: 0, min: 0 },

        hashTag: [{ type: String, trim: true }],

        ratings: {
            average: { type: Number, default: 0, min: 0, max: 5 },
            count: { type: Number, default: 0 }
        },

        isActive: { type: Boolean, default: true },

        postedDate: { type: Date, default: Date.now },

        // liên kết với accounts collection
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "accounts",
            required: true
        },

        unit: { type: String, required: true, trim: true },

        // liên kết với users collection
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
    },

    { timestamps: true }
);

const enhancedProduct = mongoose.model("enhancedProduct", enhancedProductSchema);
export default enhancedProduct;