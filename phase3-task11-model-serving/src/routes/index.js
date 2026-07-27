import express from 'express';
const router = express.Router();
import rankerRoutes from './ranker.routes.js';

router.use('/intelligence', rankerRoutes);

export default router;