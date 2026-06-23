import express from 'express';
import applicationRoutes from './application.routes.js';
import shortlistRoutes from './shortlist.routes.js';

const router = express.Router();

router.use('/applications', applicationRoutes);
router.use('/shortlists', shortlistRoutes);

export default router;
