const {
  initiatePaidApply,
  confirmPayment,
  getApplicationStatus,
} = require('../services/paidApply.service');
const {
  initiatePaidApplySchema,
  confirmPaymentSchema,
  getApplicationStatusSchema,
} = require('../validators/paidApply.validator');

async function initiatePaidApplyHandler(req, res, next) {
  try {
    const validated = initiatePaidApplySchema.parse(req.body);
    const result = await initiatePaidApply(validated);
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function confirmPaymentHandler(req, res, next) {
  try {
    const validated = confirmPaymentSchema.parse(req.body);
    const result = await confirmPayment(validated);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getApplicationStatusHandler(req, res, next) {
  try {
    const { id } = getApplicationStatusSchema.parse({ id: req.params.id });
    // TODO: Extract student_id from JWT token in auth middleware
    // For now, we'll require it as a query parameter for testing
    const studentId = req.query.student_id || req.user?.id;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_STUDENT_ID',
          message: 'student_id required (from auth token or query param)',
        },
      });
    }
    const result = await getApplicationStatus(id, studentId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  initiatePaidApplyHandler,
  confirmPaymentHandler,
  getApplicationStatusHandler,
};
