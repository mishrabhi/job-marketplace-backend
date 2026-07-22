import express from 'express';
const router = express.Router();
import activationRoutes from './activation.routes.js';

router.use('/activation', activationRoutes);

export default router;