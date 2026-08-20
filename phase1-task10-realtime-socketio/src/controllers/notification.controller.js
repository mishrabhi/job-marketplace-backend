import * as notificationService from '../services/notification.service.js';

export const handleSendDirectNotification = (req, res, next) => {
  try {
    const { user_id, title, message } = req.body;
    const result = notificationService.emitDirectNotification(user_id, { title, message });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleSendDriveUpdate = (req, res, next) => {
  try {
    const { drive_id, new_status, announcement } = req.body;
    const result = notificationService.emitDriveUpdate(drive_id, { new_status, announcement });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleBroadcastRole = (req, res, next) => {
  try {
    const { role, title, message } = req.body;
    const result = notificationService.broadcastRoleAnnouncement(role, { title, message });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};