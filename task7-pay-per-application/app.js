const express = require('express');
const routes = require('./src/routes');
const { errorHandler } = require('./src/middlewares/errorHandler');
const rawBodyMiddleware = require('./src/middlewares/rawBody');

const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    task: 'task7-pay-per-application',
  });
});

// Apply JSON middleware globally, but skip for webhook routes
app.use((req, res, next) => {
  if (req.path === '/api/v1/webhooks/razorpay') {
    return rawBodyMiddleware(req, res, next);
  }
  express.json()(req, res, next);
});

// Mount all routes
app.use(routes);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
