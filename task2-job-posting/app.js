import express from 'express';
import routes from './src/routes/index.js';
import errorHandler from './src/middlewares/errorHandler.js';
import env from './src/config/env.js';

const app = express();

app.use(express.json());
app.use('/api/v1', routes);
app.use(errorHandler);

app.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV } }));

export default app;
