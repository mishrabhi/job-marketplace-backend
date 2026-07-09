import express from 'express';
const router = express.Router();
import portalIntegrationRoutes from './portalIntegration.routes.js';

router.use('/integration', portalIntegrationRoutes);

export default router;