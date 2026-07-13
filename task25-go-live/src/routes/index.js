import express from 'express';
const router = express.Router();
import cutoverRoutes from './cutover.routes.js';

router.use('/launch', cutoverRoutes);

export default router;