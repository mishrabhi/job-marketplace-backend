import express from 'express';
const router = express.Router();
import statusRoutes from './status.routes.js';

router.use('/tracking', statusRoutes);

export default router;