import express from 'express';
import mockRoutes from './mock.routes.js';

const router = express.Router();

router.use('/', mockRoutes);

export default router;