import express from 'express';
import * as recruitmentController from '../controllers/recruitment.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createStudentSchema, getStudentParamsSchema } from '../schemas/student.schema.js';
import { createDriveSchema } from '../schemas/drive.schema.js';

const router = express.Router();

// Validates request body with schema and rejects unknown fields[cite: 12]
router.post(
  '/students',
  validate(createStudentSchema),
  recruitmentController.handleCreateStudent
);

// Validates path params (ensures ID is a valid UUID)[cite: 12]
router.get(
  '/students/:id',
  validate(getStudentParamsSchema),
  recruitmentController.handleGetStudentById
);

// Validates nested objects and arrays[cite: 12]
router.post(
  '/drives',
  validate(createDriveSchema),
  recruitmentController.handleCreateDrive
);

export default router;