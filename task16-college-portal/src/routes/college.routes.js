import express from 'express';
const router = express.Router();
import * as collegeController from '../controllers/college.controller.js';

// Multi-tenant reporting base endpoints 
router.get('/portal-report', collegeController.fetchCollegePortalAnalytics);
// Directory registration paths 
router.post('/admin-register', collegeController.provisionCollegeOfficer);

export default router;