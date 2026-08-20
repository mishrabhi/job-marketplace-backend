import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import coreRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static HTML test client[cite: 15]
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    realtime_engine: 'Socket.io WebSocket Layer with Room Multicasting Active',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', coreRouter);
app.use(errorHandler);

export default app;