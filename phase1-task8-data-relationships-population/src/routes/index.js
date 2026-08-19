import express from 'express';
import relationshipRoutes from './relationship.routes.js';

const router = express.Router();

router.use('/relationships', relationshipRoutes);

export default router;