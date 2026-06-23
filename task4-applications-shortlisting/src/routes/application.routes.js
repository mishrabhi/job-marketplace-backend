import express from 'express';
import ApplicationController from '../controllers/application.controller.js';
import validate from '../middlewares/validate.js';
import { applySchema, applicationIdSchema, listStudentAppsSchema } from '../validators/application.validator.js';

const router = express.Router();

router.post('/', validate(applySchema), ApplicationController.apply);
router.get('/:id', validate(applicationIdSchema), ApplicationController.getStatus);
router.get('/', validate(listStudentAppsSchema), ApplicationController.listStudentApplications);
router.delete('/:id', validate(applicationIdSchema), ApplicationController.withdraw);

export default router;
