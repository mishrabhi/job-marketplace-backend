const express = require('express');
const routes = require('./src/routes');
const { errorHandler } = require('./src/middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

app.use('/api/v1', routes);

// global error handler
app.use(errorHandler);

module.exports = app;
