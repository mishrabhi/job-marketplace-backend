import express from 'express';
const router = express.Router();
import rbacRoutes from './rbac.routes.js';

router.use('/enterprise', rbacRoutes);

export default router;