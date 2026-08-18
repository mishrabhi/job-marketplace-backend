import express from 'express';
import coreRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import { pool } from './src/config/db.js';

const app = express();
app.use(express.json());

// Pool Health Check Route[cite: 10]
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.status(200).json({
      status: 'OK',
      persistence_engine: 'PostgreSQL Connection Pool Connected',
      pool_stats: {
        total_connections: pool.totalCount,
        idle_connections: pool.idleCount,
        waiting_clients: pool.waitingCount
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ status: 'UNHEALTHY', error: err.message });
  }
});

app.use('/api/v1', coreRouter);
app.use(errorHandler);

export default app;