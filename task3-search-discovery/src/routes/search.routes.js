import express from 'express';
import SearchController from '../controllers/search.controller.js';
import validate from '../middlewares/validate.js';
import { searchJobsSchema } from '../validators/search.validator.js';

const router = express.Router();

router.get('/jobs', validate(searchJobsSchema), SearchController.search);

export default router;
