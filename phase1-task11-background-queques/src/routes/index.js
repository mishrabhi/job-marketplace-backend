import express from 'express';
import dispatchRoutes from './dispatch.routes.js';

const router = express.Router();

router.use('/dispatch', dispatchRoutes);

export default router;