import express from 'express';
import * as relController from '../controllers/relationship.controller.js';

const router = express.Router();

router.get('/companies/tree', relController.handleGetCompaniesTree);
router.get('/jobs/:id/applicants', relController.handleGetJobApplicants);
router.delete('/jobs/:id/cascade', relController.handleDeleteJobCascade);
router.delete('/companies/:id/restrict', relController.handleDeleteCompanyRestrict);

export default router;