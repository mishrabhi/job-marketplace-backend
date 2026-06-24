const { createOrderSchema, verifyPaymentSchema } = require('../validators/payment.validator');
const paymentService = require('../services/payment.service');
const { appError } = require('../middlewares/errorHandler');

async function createOrder(req, res, next) {
  try {
    const parsed = createOrderSchema.parse(req.body);
    const result = await paymentService.createOrder(parsed);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.name === 'ZodError') return next(appError(422, 'VALIDATION_ERROR', err.message));
    return next(err);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const parsed = verifyPaymentSchema.parse(req.body);
    const result = await paymentService.verifyPayment(parsed);
    return res.json({ success: true, data: result });
  } catch (err) {
    if (err.name === 'ZodError') return next(appError(422, 'VALIDATION_ERROR', err.message));
    return next(err);
  }
}

async function getPayment(req, res, next) {
  try {
    const { id } = req.params;
    const result = await paymentService.getPayment(id);
    return res.json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createOrder, verifyPayment, getPayment };
