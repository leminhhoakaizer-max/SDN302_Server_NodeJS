import express from 'express'
import { verifyToken } from '../middleware/authen.middleware.js';
import { deleteProductById, getAllProducts, getProductById, searchProducts, updateProductById } from '../controller/product.controller.js';
import { createProduct } from '../controller/product.controller.js';
import { mapCategory } from '../middleware/database/ElectronicProduct.category.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: EnhancedProducts
 *   description: Product management
 */

/**
 * @swagger
 * /api/enhancedProduct:
 *   get:
 *     summary: Get all products
 *     tags: [EnhancedProducts]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedProduct'
 *       500:
 *         description: Internal server error
 */
// List products
router.get('/', getAllProducts)

/**
 * @swagger
 * /api/enhancedProduct/createProduct:
 *   post:
 *     summary: Create a new product
 *     tags: [EnhancedProducts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - productImage
 *               - description
 *               - brand
 *               - category
 *               - price
 *               - stock
 *               - unit
 *             properties:
 *               productName:
 *                 type: string
 *               description:
 *                 type: string
 *               productImage:
 *                 type: object
 *                 properties:
 *                   url:
 *                     type: string
 *                   alt:
 *                     type: string
 *               brand:
 *                 type: string
 *               category:
 *                 type: array
 *                 description: Category names
 *                 items:
 *                   type: string
 *                 example: ["smartphone flagship", "smartphone AI-powered"]
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               stock:
 *                 type: number
 *               unit:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnhancedProduct'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
// Create/add products
router.post('/createProduct', verifyToken, mapCategory, createProduct)

/**
 * @swagger
 * /api/enhancedProduct/search:
 *   get:
 *     summary: Search products by name
 *     tags: [EnhancedProducts]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Search result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *                 totalItems:
 *                   type: number
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedProduct'
 */
// Search products by "alphabet"
router.get('/search', searchProducts)

/**
 * @swagger
 * /api/enhancedProduct/{id}:
 *   put:
 *     summary: Update product by ID
 *     tags: [EnhancedProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               discount:
 *                 type: number
 *               category:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
// Update product by Id
router.put('/:id', verifyToken, updateProductById)

/**
 * @swagger
 * /api/enhancedProduct/{id}:
 *   get:
 *     summary: Get product detail by ID
 *     tags: [EnhancedProducts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnhancedProduct'
 *       404:
 *         description: Product not found
 */
// Get detail Infor by productId
router.get('/:id', getProductById)

/**
 * @swagger
 * /api/enhancedProduct/{id}:
 *   delete:
 *     summary: Delete product by ID
 *     tags: [EnhancedProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
// Delete product by Id
router.delete('/:id', verifyToken, deleteProductById)

export default router;

// Cast to ObjectId failed for value "search" (type: String) at path "_id" for model "enhancedproducts"
// Lỗi trên xảy ra khi gọi API: GET [api/enhancedproducts/search]
// Nguyên nhân do thứ thứ tự khai báo route.
// Cần đặt route "search" lên trên route "/:id" để tránh bị nhầm lẫn giữa "search" và ":id"
// Express sẽ hiểu "search" là giá trị của tham số id trong route "/:id" nếu để sau.
// Vì "search" không phải là một ObjectId hợp lệ