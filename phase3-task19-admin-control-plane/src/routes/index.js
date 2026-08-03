import express from 'express';
const router = express.Router();
import configRoutes from './config.routes.js';

router.use('/admin', configRoutes);

export default router;