import { getIO } from '../config/socket.js';
import { logger } from '../config/logger.js';

/**
 * Emits live event directly to a specific user room[cite: 15]
 */
export const emitDirectNotification = (userId, notificationData) => {
  const io = getIO();
  const room = `user:${userId}`;

  const payload = {
    ...notificationData,
    delivered_at: new Date().toISOString()
  };

  logger.info(`Emitting direct notification to room: ${room}`, payload);
  io.to(room).emit('notification_received', payload);
  return { emitted_to: room, payload };
};

/**
 * Emits live drive updates to all subscribers of a specific placement drive room[cite: 15]
 */
export const emitDriveUpdate = (driveId, updateData) => {
  const io = getIO();
  const room = `drive:${driveId}`;

  const payload = {
    drive_id: driveId,
    ...updateData,
    timestamp: new Date().toISOString()
  };

  logger.info(`Emitting drive update event to room: ${room}`, payload);
  io.to(room).emit('drive_status_updated', payload);
  return { emitted_to: room, payload };
};

/**
 * Broadcasts an announcement to all connected clients under a specific role[cite: 15]
 */
export const broadcastRoleAnnouncement = (role, announcement) => {
  const io = getIO();
  const room = `role:${role}`;

  const payload = {
    role,
    ...announcement,
    timestamp: new Date().toISOString()
  };

  logger.info(`Broadcasting role-wide announcement to room: ${room}`, payload);
  io.to(room).emit('broadcast_announcement', payload);
  return { broadcast_to: room, payload };
};