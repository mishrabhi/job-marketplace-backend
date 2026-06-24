const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/orders', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/:id', paymentController.getPayment);

module.exports = router;
