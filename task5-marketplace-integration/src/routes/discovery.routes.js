import express from 'express';
import DiscoveryController from '../controllers/discovery.controller.js';
import validate from '../middlewares/validate.js';
import { discoveryFeedSchema } from '../validators/discovery.validator.js';
import { jobIdParamSchema } from '../validators/search.validator.js';

const router = express.Router();

router.get('/feed', validate(discoveryFeedSchema), DiscoveryController.getFeed);
router.get('/jobs/:id', validate(jobIdParamSchema), DiscoveryController.getJobDetail);

export default router;
