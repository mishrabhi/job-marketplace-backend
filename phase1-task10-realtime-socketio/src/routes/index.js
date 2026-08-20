import express from 'express';
import notificationRoutes from './notification.routes.js';

const router = express.Router();

router.use('/notifications', notificationRoutes);

export default router;