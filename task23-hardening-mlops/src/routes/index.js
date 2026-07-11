import express from 'express';
const router = express.Router();
import hardeningRoutes from './hardening.routes.js';

router.use('/hardening', hardeningRoutes);

export default router;