import express from 'express';
const router = express.Router();
import trustRoutes from './trust.routes.js';

router.use('/trust', trustRoutes);

export default router;