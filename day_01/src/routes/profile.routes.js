import express from 'express'
import { createProfileControlller, getAllProfiles, getInforDetailById, getInforMyProfle, updateProfileControlller } from '../controller/profile.controller.js';
import { verifyToken } from '../middleware/authen.middleware.js';

const router = express.Router();

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User Profile management
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get all profiles
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// List profiles
router.get('/', getAllProfiles)

/**
 * @swagger
 * /api/profile/createProfile:
 *   post:
 *     summary: Create profile for logged-in user
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - birthday
 *               - phone
 *               - address
 *               - avatar
 *             properties:
 *               birthday:
 *                 type: string
 *                 example: 28/10/1996
 *               gender:
 *                 type: boolean
 *                 example: true
 *               phone:
 *                 type: string
 *                 example: 0912345678
 *               address:
 *                 type: string
 *                 example: Quận 1, TP Hồ Chí Minh
 *               avatar:
 *                 type: string
 *                 example: /images/avatar_TongTai.png
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Profile already exists or invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// Create profile
router.post('/createProfile', verifyToken, createProfileControlller);

/**
 * @swagger
 * /api/profile/info:
 *   get:
 *     summary: Get my profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// Get infor my profile
router.get('/info', getInforMyProfle);

/**
 * @swagger
 * /api/profile/{id}:
 *   get:
 *     summary: Get profile by profile ID
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69539f77ab3ccb17f045f5c7
 *     responses:
 *       200:
 *         description: Profile detail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// GET infor by id
router.get('/:id', getInforDetailById)

/**
 * @swagger
 * /api/profile/{id}:
 *   put:
 *     summary: Update profile by ID
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 69539f77ab3ccb17f045f5c7
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               birthday:
 *                 type: string
 *                 example: 15/08/1998
 *               gender:
 *                 type: boolean
 *                 example: false
 *               phone:
 *                 type: string
 *                 example: 0396717083
 *               address:
 *                 type: string
 *                 example: Hà Nội
 *               avatar:
 *                 type: string
 *                 example: /images/avatar_new.png
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Profile not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
// Update profile
router.put('/:id', verifyToken, updateProfileControlller);

export default router;