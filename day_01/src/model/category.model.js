import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     EnhancedCategory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 694d07daa7cc16da66fc7066
 *         name:
 *           type: string
 *           example: Smartphone Flagship
 *         slug:
 *           type: string
 *           example: smartphone-flagship
 *         memo:
 *           type: string
 *           example: Dòng cao cấp nhất
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdBy:
 *           type: string
 *           example: 69367b7a027183bfc0bc7c84
 *         updatedBy:
 *           type: string
 *           example: 69367b7a027183bfc0bc7c84
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const enhancedCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        
        slug: {
         type: String,
         unique: true, // Đảm bảo slug là duy nhất
         lowercase: true,
         index: true, // Tạo chỉ mục để tăng tốc độ tìm kiếm
        },

         memo: {
            type: String,
            trim: true,
         },

         isActive: {
            type: Boolean,
            default: true,
         },

         createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
         },

         updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
         }

    },

    { timestamps: true }

);

const enhancedCategory = mongoose.model("enhancedCategory", enhancedCategorySchema);
export default enhancedCategory;