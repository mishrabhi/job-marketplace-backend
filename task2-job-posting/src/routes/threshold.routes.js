import express from 'express';
import ThresholdController from '../controllers/threshold.controller.js';
import validate from '../middlewares/validate.js';
import { checkThresholdSchema } from '../validators/threshold.validator.js';

const router = express.Router();

router.post('/check', validate(checkThresholdSchema), ThresholdController.checkEligibility);

export default router;
