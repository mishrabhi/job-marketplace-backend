import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken, requireRoles } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public routes with rate limiting protection
router.post('/signup', authRateLimiter, authController.handleRegister);
router.post('/login', authRateLimiter, authController.handleLogin);

// Protected authenticated routes
router.get('/me', authenticateToken, authController.handleGetMe);

// Protected RBAC routes (TPO_ADMIN only)
router.get('/admin/dashboard', authenticateToken, requireRoles('TPO_ADMIN'), authController.handleAdminDashboard);

export default router;