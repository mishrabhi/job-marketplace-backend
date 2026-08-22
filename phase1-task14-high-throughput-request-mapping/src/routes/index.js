import express from 'express';
import throughputRoutes from './throughput.routes.js';

const router = express.Router();

router.use('/throughput', throughputRoutes);

export default router;