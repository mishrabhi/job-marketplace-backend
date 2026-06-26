import refundService from '../services/refund.service';
import {
  initiateRefundSchema,
  getRefundParamsSchema,
} from '../validators/receiptsRefunds.validator';

export default initiateRefund = async (req, res, next) => {
  try {
    const body = initiateRefundSchema.parse(req.body);
    const refund = await refundService.initiateRefund(body);
    return res.status(201).json({ success: true, data: refund });
  } catch (err) {
    next(err);
  }
};

export default getRefund = async (req, res, next) => {
  try {
    const { id } = getRefundParamsSchema.parse(req.params);
    const refund = await refundService.getRefund(id);
    return res.status(200).json({ success: true, data: refund });
  } catch (err) {
    next(err);
  }
};

export default listStudentRefunds = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await refundService.listStudentRefunds(student_id, { page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
