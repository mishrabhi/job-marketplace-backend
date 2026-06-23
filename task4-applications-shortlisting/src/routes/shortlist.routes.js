import express from 'express';
import ShortlistController from '../controllers/shortlist.controller.js';
import validate from '../middlewares/validate.js';
import { shortlistSchema, rejectSchema, shortlistIdSchema, updateShortlistSchema, listCandidatesSchema } from '../validators/shortlist.validator.js';

const router = express.Router();

router.post('/', validate(shortlistSchema), ShortlistController.shortlist);
router.post('/reject', validate(rejectSchema), ShortlistController.reject);
router.get('/:id', validate(shortlistIdSchema), ShortlistController.getStatus);
router.patch('/:id', validate(updateShortlistSchema), ShortlistController.updateStatus);
router.get('/', validate(listCandidatesSchema), ShortlistController.listCandidates);

export default router;
