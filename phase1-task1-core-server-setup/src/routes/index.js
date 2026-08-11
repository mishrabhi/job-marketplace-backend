import express from 'express';
import sampleRoutes from './sample.routes.js';

const router = express.Router();

router.use('/sample', sampleRoutes);

export default router;