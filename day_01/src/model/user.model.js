import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1b2c9e1a123456789abcd
 *         name:
 *           type: string
 *           example: Quang Huy
 *         email:
 *           type: string
 *           example: quanghuyabc9@gmail.com
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ODM: Object Data Modeling
const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },

        refreshToken: {
            type: String,
        }, 

        // Token dung để reset password
        resetPasswordToken: {
            type: String,
        },

        // Thời gian hết hạn của token reset password
        resetPasswordExpires: {
            type: Date,
        },

        //isVerified: {
        //    type: Boolean,
        //   default: false,
        //}

    },

    {
        timestamps: true, //Tự sinh ra 2 Fields: createAT và updateAt
    }
)

const User = mongoose.model('user', UserSchema)
export default User