const express = require('express');
const paidApplyRoutes = require('./paidApply.routes');
const webhookRoutes = require('./webhook.routes');

const router = express.Router();

router.use('/api/v1/paid-applications', paidApplyRoutes);
router.use('/api/v1/webhooks', webhookRoutes);

module.exports = router;
