import { driveRepository } from '../repositories/drive.repository.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

export const createPlacementDrive = async (drivePayload) => {
  logger.info(`Creating transactional placement drive: ${drivePayload.drive_title}`);
  return await driveRepository.createDriveWithRoles(drivePayload);
};

export const getDriveDetails = async (driveId) => {
  const drive = await driveRepository.findById(driveId);
  if (!drive) {
    throw appError(404, 'DRIVE_NOT_FOUND', `Placement drive with ID '${driveId}' was not found.`);
  }
  return drive;
};

export const updateDriveStatus = async (driveId, status) => {
  logger.info(`Updating drive ${driveId} status to: ${status}`);
  const updatedDrive = await driveRepository.updateStatus(driveId, status);
  if (!updatedDrive) {
    throw appError(404, 'DRIVE_NOT_FOUND', `Cannot update status. Drive '${driveId}' does not exist.`);
  }
  return updatedDrive;
};

export const deletePlacementDrive = async (driveId) => {
  logger.info(`Deleting placement drive ID: ${driveId}`);
  const deleted = await driveRepository.deleteById(driveId);
  if (!deleted) {
    throw appError(404, 'DRIVE_NOT_FOUND', `Drive '${driveId}' not found.`);
  }
  return { deleted: true, drive_id: driveId };
};