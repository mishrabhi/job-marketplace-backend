import express from 'express';
const router = express.Router();
import * as offerController from '../controllers/offer.controller.js';

router.post('/generate', offerController.executeGenerationPipeline);
router.post('/choose-esign', offerController.lockSignApproach);

export default router;