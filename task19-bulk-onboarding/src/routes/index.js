import express from 'express';
const router = express.Router();
import onboardingRoutes from './onboarding.routes.js';

router.use('/onboard', onboardingRoutes);

export default router;