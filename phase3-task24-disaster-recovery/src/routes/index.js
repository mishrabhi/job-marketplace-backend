import express from 'express';
const router = express.Router();
import drRoutes from './dr.routes.js';

router.use('/dr', drRoutes);

export default router;