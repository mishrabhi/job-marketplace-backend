import express from 'express';
import * as driveController from '../controllers/drive.controller.js';

const router = express.Router();

router.post('/', driveController.handleCreateDrive);
router.get('/:id', driveController.handleGetDriveById);
router.patch('/:id/status', driveController.handleUpdateStatus);
router.delete('/:id', driveController.handleDeleteDrive);

export default router;