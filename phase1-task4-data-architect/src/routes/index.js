import express from 'express';
import dataRoutes from './data.routes.js';

const router = express.Router();

router.use('/data', dataRoutes);

export default router;