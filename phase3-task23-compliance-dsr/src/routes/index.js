import express from 'express';
const router = express.Router();
import complianceRoutes from './compliance.routes.js';

router.use('/compliance', complianceRoutes);

export default router;