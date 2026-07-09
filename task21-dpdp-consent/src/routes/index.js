import express from 'express';
const router = express.Router();
import consentRoutes from './consent.routes.js';

router.use('/privacy', consentRoutes);

export default router;