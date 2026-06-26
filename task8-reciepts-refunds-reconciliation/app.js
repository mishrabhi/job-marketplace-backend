require('./src/config/env'); // Validate env at startup — fail fast
import express from "express";
import errorHandler from "./src/middlewares/errorHandler.js"
import routes from "./src/routes/index.js";

const app = express();

// express.json() for all routes EXCEPT /api/v1/webhooks/razorpay
// The webhook route uses rawBody middleware (mounted in webhook.routes.js)
app.use((req, res, next) => {
  if (req.path === '/api/v1/webhooks/razorpay') return next();
  express.json()(req, res, next);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    task: 'task8-receipts-refunds-reconciliation',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1', routes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `${req.method} ${req.path} not found` },
  });
});

// Global error handler — must be last
app.use(errorHandler);

export default app;