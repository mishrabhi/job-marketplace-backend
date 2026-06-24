const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');
const rawBody = require('../middlewares/rawBody');

// Use raw body middleware for this route only
router.post('/razorpay', rawBody, webhookController.handleWebhook);

module.exports = router;
