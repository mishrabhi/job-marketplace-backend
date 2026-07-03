import express from 'express';
const router = express.Router();
import collegeRoutes from './college.routes.js';

router.use('/colleges', collegeRoutes);

export default router;