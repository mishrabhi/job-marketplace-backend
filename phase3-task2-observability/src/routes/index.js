import express from 'express';
const router = express.Router();
import obsRoutes from './observability.routes.js';

router.use('/observability', obsRoutes);

export default router;