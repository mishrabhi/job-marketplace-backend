import * as driveService from '../services/drive.service.js';
import { createDriveSchema, updateDriveStatusSchema } from '../validators/drive.validator.js';

export const handleCreateDrive = async (req, res, next) => {
  try {
    const validatedBody = createDriveSchema.parse(req.body);
    const drive = await driveService.createPlacementDrive(validatedBody);
    return res.status(201).json({ success: true, data: drive });
  } catch (err) {
    next(err);
  }
};

export const handleGetDriveById = async (req, res, next) => {
  try {
    const drive = await driveService.getDriveDetails(req.params.id);
    return res.status(200).json({ success: true, data: drive });
  } catch (err) {
    next(err);
  }
};

export const handleUpdateStatus = async (req, res, next) => {
  try {
    const validatedBody = updateDriveStatusSchema.parse(req.body);
    const updatedDrive = await driveService.updateDriveStatus(req.params.id, validatedBody.drive_status);
    return res.status(200).json({ success: true, data: updatedDrive });
  } catch (err) {
    next(err);
  }
};

export const handleDeleteDrive = async (req, res, next) => {
  try {
    const result = await driveService.deletePlacementDrive(req.params.id);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};