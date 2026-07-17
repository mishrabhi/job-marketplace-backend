import express from 'express';
const router = express.Router();
import profilingRoutes from './profiling.routes.js';

router.use('/performance', profilingRoutes);

export default router;