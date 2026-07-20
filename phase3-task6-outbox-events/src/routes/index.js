import express from 'express';
const router = express.Router();
import outboxRoutes from './outbox.routes.js';

router.use('/growth', outboxRoutes);

export default router;