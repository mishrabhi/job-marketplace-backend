import express from 'express';
import driveRoutes from './drive.routes.js';

const router = express.Router();

router.use('/drives', driveRoutes);

export default router;