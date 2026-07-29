import express from 'express';
const router = express.Router();
import governanceRoutes from './governance.routes.js';

router.use('/governance', governanceRoutes);

export default router;