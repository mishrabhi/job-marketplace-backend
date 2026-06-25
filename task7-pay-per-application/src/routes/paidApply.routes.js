const express = require('express');
const {
  initiatePaidApplyHandler,
  confirmPaymentHandler,
  getApplicationStatusHandler,
} = require('../controllers/paidApply.controller');

const router = express.Router();

router.post('/', initiatePaidApplyHandler);
router.post('/confirm', confirmPaymentHandler);
router.get('/:id', getApplicationStatusHandler);

module.exports = router;
