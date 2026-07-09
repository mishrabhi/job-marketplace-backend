import express from 'express';
const router = express.Router();
import * as rightsController from '../controllers/rights.controller.js';

// Compile comprehensive data portability archive archives endpoint 
router.post('/access-export', rightsController.processDataSubjectExport);

// Execute compliance cascading data deletion purge task path 
router.post('/erasure-purge', rightsController.processDataSubjectErasure);

export default router;