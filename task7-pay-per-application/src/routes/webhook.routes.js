const express = require('express');
const rawBodyMiddleware = require('../middlewares/rawBody');
const { handleWebhookHandler } = require('../controllers/webhook.controller');

const router = express.Router();

router.post('/razorpay', rawBodyMiddleware, handleWebhookHandler);

module.exports = router;
