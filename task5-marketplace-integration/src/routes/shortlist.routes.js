import express from 'express';
import ShortlistController from '../controllers/shortlist.controller.js';
import validate from '../middlewares/validate.js';
import { shortlistSchema } from '../validators/shortlist.validator.js';

const router = express.Router();

router.post('/', validate(shortlistSchema), ShortlistController.shortlist);

export default router;
