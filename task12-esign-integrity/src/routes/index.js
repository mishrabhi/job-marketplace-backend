import express from 'express';
const router = express.Router();
import esignRoutes from './esign.routes.js';

router.use('/esign', esignRoutes);

export default router;