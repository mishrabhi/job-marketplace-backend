import express from 'express';
import secureRoutes from './secureEndpoint.routes.js';

const router = express.Router();

router.use('/v1', secureRoutes);

export default router;