import express from 'express';
const router = express.Router();
import certRoutes from './certification.routes.js';

router.use('/golive', certRoutes);

export default router;