import express from 'express';
const router = express.Router();
import launchRoutes from './launch.routes.js';

router.use('/rehearsal', launchRoutes);

export default router;