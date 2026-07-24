import express from 'express';
const router = express.Router();
import flagRoutes from './flag.routes.js';

router.use('/flags', flagRoutes);

export default router;