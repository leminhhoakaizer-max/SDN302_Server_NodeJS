import mongoose, { Schema } from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 69539f77ab3ccb17f045f5c7
 *         user:
 *           type: object
 *           description: Reference to User
 *           properties:
 *             _id:
 *               type: string
 *               example: 693ad95a1edf37e46e4a9424
 *             name:
 *               type: string
 *               example: admin
 *             email:
 *               type: string
 *               example: admin@gmail.com
 *             role:
 *               type: string
 *               example: user
 *         birthday:
 *           type: string
 *           format: date
 *           example: 1999-12-21
 *         gender:
 *           type: boolean
 *           example: true
 *         phone:
 *           type: string
 *           example: 0396717083
 *         address:
 *           type: string
 *           example: Quận 1, TP Hồ Chí Minh
 *         avatar:
 *           type: string
 *           example: /images/avatar_TongTai.png
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const profileSchema = new mongoose.Schema(
    {
        // 1 User chỉ --> chỉ 1 Profile
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
            unique: true,
        },

        birthday: {
            type: Date,
            required: true,
        },

        // True: male, Fale: female
        gender: {
            type: Boolean,
        },

        phone: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        avatar: {
            type: String,
            required: true,
        }
    },

    {
        timestamps: true, //Tự sinh ra 2 Fields: createAT và updateAt
    }
)

const Profile = mongoose.model('profile', profileSchema)
export default Profile