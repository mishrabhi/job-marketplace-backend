import express from 'express';
const router = express.Router();
import finopsRoutes from './finops.routes.js';

router.use('/finops', finopsRoutes);

export default router;