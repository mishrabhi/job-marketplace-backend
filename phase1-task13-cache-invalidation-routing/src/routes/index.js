import express from 'express';
import appRoutes from './application.routes.js';

const router = express.Router();

router.use('/', appRoutes);

export default router;