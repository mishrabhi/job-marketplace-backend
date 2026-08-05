import express from 'express';
const router = express.Router();
import securityRoutes from './security.routes.js';

router.use('/security', securityRoutes);

export default router;