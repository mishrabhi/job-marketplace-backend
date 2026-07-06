import express from 'express';
const router = express.Router();
import * as adminController from '../controllers/admin.controller.js';

// Item Bank administrative operations endpoints 
router.post('/item-bank/questions', adminController.processNewItemBankAddition);

// Proctoring review resolution pipelines paths 
router.post('/proctoring/adjudicate', adminController.executeProctorAdjudication);

export default router;