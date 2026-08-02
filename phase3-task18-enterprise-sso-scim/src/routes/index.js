import express from 'express';
const router = express.Router();
import identityRoutes from './identity.routes.js';

router.use('/enterprise-identity', identityRoutes);

export default router;