import express from 'express';
import { verifyToken } from '../middleware/authen.middleware.js';
import { createCategory, deleteCategoryById, getAllCategories, getDetailInforById, getDetailInforBySlug, searchCategory, updateCategoryById, updateCategoryBySlug } from '../controller/categories.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: EnhancedCategories
 *     description: Category management APIs
 */

/**
 * @swagger
 * /api/enhancedcategories:
 *   get:
 *     summary: Get all active categories
 *     tags: [EnhancedCategories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EnhancedCategory'
 *       500:
 *         description: Internal server error
 */
// List categories
router.get('/', getAllCategories)

/**
 * @swagger
 * /api/enhancedcategories/searchCategory:
 *   get:
 *     summary: Search & filter categories
 *     tags: [EnhancedCategories]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Search by name or slug
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
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
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           example: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           example: DESC
 *     responses:
 *       200:
 *         description: Search result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedCategory'
 *       500:
 *         description: Internal server error
 */
// Search categories
router.get('/searchCategory', searchCategory)

/**
 * @swagger
 * /api/enhancedcategories/createCategory:
 *   post:
 *     summary: Create a new category
 *     tags: [EnhancedCategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               memo:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnhancedCategory'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// Create/add categories
router.post('/createCategory', verifyToken, createCategory)

/**
 * @swagger
 * /api/enhancedcategories/id/{id}:
 *   put:
 *     summary: Update category by ID
 *     tags: [EnhancedCategories]
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
 *             properties:
 *               name:
 *                 type: string
 *               memo:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
// Update category by Id
router.put('/id/:id', verifyToken, updateCategoryById);

/**
 * @swagger
 * /api/enhancedcategories/slug/{slug}:
 *   put:
 *     summary: Update category by slug
 *     tags: [EnhancedCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *               memo:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
// Update category by Slug Name
router.put('/slug/:slug', verifyToken, updateCategoryBySlug);

/**
 * @swagger
 * /api/enhancedcategories/id/{id}:
 *   get:
 *     summary: Get category detail by ID
 *     tags: [EnhancedCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnhancedCategory'
 *       404:
 *         description: Category not found
 */
// Get detail Infor by categoryId
router.get('/id/:id', getDetailInforById);

/**
 * @swagger
 * /api/enhancedcategories/slug/{slug}:
 *   get:
 *     summary: Get category detail by slug
 *     tags: [EnhancedCategories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnhancedCategory'
 *       404:
 *         description: Category not found
 */
// Get detail Infor by category Slug Name
router.get('/slug/:slug', getDetailInforBySlug);

/**
 * @swagger
 * /api/enhancedcategories/{id}:
 *   delete:
 *     summary: Delete category by ID
 *     tags: [EnhancedCategories]
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
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       401:
 *         description: Unauthorized
 */
// Delete category by Id
router.delete('/:id', verifyToken, deleteCategoryById)

export default router;