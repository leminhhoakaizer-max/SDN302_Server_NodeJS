import mongoose from "mongoose";

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Shopping cart APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: Product ID
 *           example: 69367b7a027183bfc0bc7ca4
 *         quantity:
 *           type: integer
 *           example: 2
 *         price:
 *           type: number
 *           example: 12000000
 *         discount:
 *           type: number
 *           example: 10
 *         finalPrice:
 *           type: number
 *           example: 10800000
 *
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 695f4e0f8a2c0f0012ab1234
 *         user:
 *           type: string
 *           example: 69367b7a027183bfc0bc7c84
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         totalItems:
 *           type: integer
 *           example: 3
 *         totalPrice:
 *           type: number
 *           example: 21600000
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
// Describe "products" in Cart
const CartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'enhancedproducts',
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
            default: 1,
        },

        price: {
            // Giá tại thời điểm thêm vào giỏ hàng(ko bị ảnh hưởng khi thay đổi giá)
            type: Number,
            required: true,
        },

        discount: {
            type: Number,
            required: false,
            default: 0,
        },

        finalPrice: {
            type: Number,
            required: true,
        },

    }
)

// Middleware để tính toán "finalPrice" trước khi lưu
CartItemSchema.pre('validate', function() {
    if (this.price !== undefined && this.discount !== undefined) {
        this.finalPrice = this.price * (1 - (this.discount || 0) / 100);
    }
});

const CartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },

        items: [CartItemSchema],
        
        totalItems: {
            type: Number,
            default: 0,
        },

        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        }
    },

    { timestamps: true },

)

const Cart = mongoose.model('carts', CartSchema)
export default Cart