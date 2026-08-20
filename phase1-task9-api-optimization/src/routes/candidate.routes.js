import express from 'express';
import * as candidateController from '../controllers/candidate.controller.js';
import { cacheMiddleware } from '../middlewares/cache.middleware.js';

const router = express.Router();

// Read-heavy endpoint protected with 60-second cache middleware[cite: 14]
router.get('/leaderboard', cacheMiddleware(60), candidateController.handleGetLeaderboard);

// DB EXPLAIN execution inspection endpoint[cite: 14]
router.get('/leaderboard/explain', candidateController.handleExplainQuery);

// Mutation endpoint with cache invalidation plan[cite: 14]
router.patch('/:id/gpa', candidateController.handleUpdateGpa);

export default router;