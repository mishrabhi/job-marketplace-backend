import * as dataService from '../services/data.service.js';
import { createStudentSchema, applyJobSchema } from '../validators/data.validator.js';

export const handleRegisterStudent = async (req, res, next) => {
  try {
    const validatedBody = createStudentSchema.parse(req.body);
    const newStudent = await dataService.registerStudent(validatedBody);
    return res.status(201).json({ success: true, data: newStudent });
  } catch (err) {
    next(err);
  }
};

export const handleApplyJob = async (req, res, next) => {
  try {
    const validatedBody = applyJobSchema.parse(req.body);
    const application = await dataService.applyToJobWithIntegrity(validatedBody.job_id, validatedBody.student_id);
    return res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};