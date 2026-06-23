import express from 'express';
import ApplicationController from '../controllers/application.controller.js';
import validate from '../middlewares/validate.js';
import { applySchema, applicationIdSchema } from '../validators/application.validator.js';

const router = express.Router();

router.post('/', validate(applySchema), ApplicationController.apply);
router.get('/:id', validate(applicationIdSchema), ApplicationController.getStatus);

export default router;
