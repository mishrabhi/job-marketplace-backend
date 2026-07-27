import express from 'express';
const router = express.Router();
import searchRoutes from './search.routes.js';

router.use('/search', searchRoutes);

export default router;