import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/direct', notificationController.handleSendDirectNotification);
router.post('/drive-update', notificationController.handleSendDriveUpdate);
router.post('/broadcast', notificationController.handleBroadcastRole);

export default router;