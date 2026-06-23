import express from 'express';
import JobController from '../controllers/job.controller.js';
import validate from '../middlewares/validate.js';
import { createJobSchema, jobIdParamSchema, publishJobSchema } from '../validators/job.validator.js';

const router = express.Router();

router.post('/', validate(createJobSchema), JobController.create);
router.get('/:id', validate(jobIdParamSchema), JobController.getJob);
router.post('/:id/publish', validate(publishJobSchema), JobController.publish);
router.get('/:id/assessment-link', validate(jobIdParamSchema), JobController.getAssessmentLink);

export default router;
