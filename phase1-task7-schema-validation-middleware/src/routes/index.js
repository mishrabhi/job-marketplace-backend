import express from 'express';
import recruitmentRoutes from './recruitment.routes.js';

const router = express.Router();

router.use('/', recruitmentRoutes);

export default router;