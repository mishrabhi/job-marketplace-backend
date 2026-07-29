import express from 'express';
const router = express.Router();
import auditRoutes from './audit.routes.js';

router.use('/fairness', auditRoutes);

export default router;