import { Server } from 'socket.io';
import { logger } from './logger.js';
import { socketAuthMiddleware } from '../middlewares/auth.socket.middleware.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    // Connection State Recovery for seamless client reconnects
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes buffer
      skipMiddlewares: true
    }
  });

  // Attach Socket Authentication Middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const user = socket.user;
    logger.info(`🔌 Socket client connected: ${socket.id} (User: ${user.email}, Role: ${user.role})`);

    // 1. Join user-specific personal room for direct notifications
    const userRoom = `user:${user.userId}`;
    socket.join(userRoom);
    logger.info(`Socket ${socket.id} joined personal room: ${userRoom}`);

    // 2. Join role-based room (e.g., 'role:STUDENT' or 'role:TPO_ADMIN')
    const roleRoom = `role:${user.role}`;
    socket.join(roleRoom);

    // Handle dynamic room subscription (e.g. subscribing to a specific placement drive)
    socket.on('join_drive_room', (driveId) => {
      const driveRoom = `drive:${driveId}`;
      socket.join(driveRoom);
      logger.info(`Socket ${socket.id} subscribed to drive room: ${driveRoom}`);
      socket.emit('joined_room_ack', { room: driveRoom, timestamp: new Date().toISOString() });
    });

    // Handle unsubscription
    socket.on('leave_drive_room', (driveId) => {
      const driveRoom = `drive:${driveId}`;
      socket.leave(driveRoom);
      logger.info(`Socket ${socket.id} left drive room: ${driveRoom}`);
    });

    // Graceful disconnect handling
    socket.on('disconnect', (reason) => {
      logger.warn(`Socket client disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return ioInstance;
};