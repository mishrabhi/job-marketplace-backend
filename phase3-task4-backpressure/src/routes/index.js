import express from 'express';
const router = express.Router();
import scaleRoutes from './scale.routes.js';

router.use('/scale', scaleRoutes);

export default router;