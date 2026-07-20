import express from 'express';
const router = express.Router();
import reliabilityRoutes from './reliability.routes.js';

router.use('/reliability', reliabilityRoutes);

export default router;