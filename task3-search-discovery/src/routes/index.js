import express from 'express';
import searchRoutes from './search.routes.js';
import discoveryRoutes from './discovery.routes.js';

const router = express.Router();

router.use('/search', searchRoutes);
router.use('/discovery', discoveryRoutes);

export default router;
