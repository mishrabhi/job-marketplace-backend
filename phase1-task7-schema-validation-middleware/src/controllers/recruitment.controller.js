import * as recruitmentService from '../services/recruitment.service.js';

export const handleCreateStudent = async (req, res, next) => {
  try {
    // req.body is already validated and sanitized by validate middleware
    const student = await recruitmentService.createStudent(req.body);
    return res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

export const handleGetStudentById = async (req, res, next) => {
  try {
    // req.params.id is guaranteed to be a valid UUID
    const student = await recruitmentService.findStudentById(req.params.id);
    return res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

export const handleCreateDrive = async (req, res, next) => {
  try {
    const drive = await recruitmentService.createPlacementDrive(req.body);
    return res.status(201).json({ success: true, data: drive });
  } catch (err) {
    next(err);
  }
};