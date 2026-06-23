import express from 'express';
import companyRoutes from './company.routes.js';

const router = express.Router();
router.use('/companies', companyRoutes);
export default router;
