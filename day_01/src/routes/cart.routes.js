import express from 'express';
import { verifyToken } from '../middleware/authen.middleware.js';
import { addItemCart, clearItemCart, countItemCart, getCart, removeItemCart } from '../controller/cart.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Get cart of logged-in user, including:
 *       items, quantity of each product, price at add time,
 *       totalItems and totalPrice.
 *     responses:
 *       200:
 *         description: Cart information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// Get my carts
router.get('/', verifyToken, getCart)

/**
 * @swagger
 * /api/cart/countCart:
 *   get:
 *     summary: Count distinct products in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Number of distinct products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// Count number carts
router.get('/countCart', verifyToken, countItemCart)

/**
 * @swagger
 * /api/cart/addCart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Add product to cart.
 *       - If cart does not exist → create new cart
 *       - If product exists → increase quantity
 *       - If product does not exist → add new item
 *       Price & discount are captured at add time.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 69367b7a027183bfc0bc7ca4
 *               quantity:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Invalid product or quantity
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// Insert/Add/Update carts
router.post('/addCart', verifyToken, addItemCart)

/**
 * @swagger
 * /api/cart/removeCart/{productId}:
 *   delete:
 *     summary: Remove a specific product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           example: 69367b7a027183bfc0bc7ca4
 *     responses:
 *       200:
 *         description: Product removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in cart
 *       500:
 *         description: Internal server error
 */
// Remove/Delete a item in carts
router.delete('/removeCart/:productId', verifyToken, removeItemCart)

/**
 * @swagger
 * /api/cart/clearCart:
 *   delete:
 *     summary: Clear all items in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Remove all items from cart,
 *       reset totalItems and totalPrice.
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// Remove/Delete [all carts]
router.delete('/clearCart', verifyToken, clearItemCart)

export default router 
