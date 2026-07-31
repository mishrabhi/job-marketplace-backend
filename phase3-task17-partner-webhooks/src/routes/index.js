import express from 'express';
const router = express.Router();
import partnerRoutes from './partner.routes.js';

router.use('/v1/partner', partnerRoutes);

export default router;