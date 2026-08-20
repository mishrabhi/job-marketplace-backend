import http from 'http';
import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';
import { initSocket } from './src/config/socket.js';

const PORT = env.PORT || 3000;

// Create HTTP Server
const httpServer = http.createServer(app);

// Initialize Socket.io
const io = initSocket(httpServer);

httpServer.listen(PORT, () => {
  logger.info(`Real-Time Server running on Port: ${PORT}`);
  logger.info(`WebSocket endpoint ready. Live test client available at: http://localhost:${PORT}/test-client.html`);
});

const executeGracefulShutdown = () => {
  logger.info('Closing HTTP server and active WebSockets...');
  io.close(() => {
    httpServer.close(() => {
      logger.info('Real-time server closed cleanly.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', executeGracefulShutdown);
process.on('SIGINT', executeGracefulShutdown);