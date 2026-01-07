import express from 'express'
import { forgotPasswordController, getCurrentUser, logoutController, refreshTokenController, resetPasswordController, signupController } from '../controller/authen.controller.js';
import { loginController } from '../controller/authen.controller.js';
import { verifyToken } from '../middleware/authen.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Authen
 *     description: Authentication & Authorization APIs
 */

/**
 * @swagger
 * /api/authen/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Email already exists
 */
router.post('/signup', signupController)

/**
 * @swagger
 * /api/authen/login:
 *   post:
 *     summary: Login and get tokens
 *     tags: [Authen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: quanghuyabc9@gmail.com
 *               password:
 *                 type: string
 *                 example: abc
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginController)


/**
 * @swagger
 * /api/authen/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Authen]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', verifyToken, logoutController) 

/**
 * @swagger
 * /api/authen/refresh_token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       403:
 *         description: Invalid refresh token
 */
router.post('/refresh_token', refreshTokenController)

/**
 * @swagger
 * /api/authen/current_user:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Authen]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/current_user', verifyToken, getCurrentUser)

/**
 * @swagger
 * /api/authen/forgot_password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 */
router.post('/forgot_password', forgotPasswordController)

/**
 * @swagger
 * /api/authen/reset_password/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authen]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset_password/:token', resetPasswordController)

export default router;