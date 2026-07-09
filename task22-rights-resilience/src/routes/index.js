import express from 'express';
const router = express.Router();
import rightsRoutes from './rights.routes.js';

router.use('/compliance', rightsRoutes);

export default router;