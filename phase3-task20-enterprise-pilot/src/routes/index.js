import express from 'express';
const router = express.Router();
import pilotRoutes from './pilot.routes.js';

router.use('/enterprise-pilot', pilotRoutes);

export default router;