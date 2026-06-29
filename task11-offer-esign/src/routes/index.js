import express from 'express';
const router = express.Router();
import offerRoutes from './offer.routes.js';

router.use('/offers', offerRoutes);

export default router;