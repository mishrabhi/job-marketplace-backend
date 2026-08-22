import express from 'express';
import * as secureController from '../controllers/secureEndpoint.controller.js';
import { authRateLimiter, publicTierLimiter, authenticatedTierLimiter } from '../middlewares/rateLimiter.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Sensitive Auth route (5 req/min per IP)[cite: 16]
router.post('/auth/login', authRateLimiter, secureController.handleSensitiveLogin);

// Public tier route (30 req/min per IP)[cite: 16]
router.get('/public/bulletin', publicTierLimiter, secureController.handlePublicFeed);

// Authenticated user tier (120 req/min per User ID)[cite: 16]
router.get('/user/dashboard', authenticateToken, authenticatedTierLimiter, secureController.handleUserDashboard);

export default router;