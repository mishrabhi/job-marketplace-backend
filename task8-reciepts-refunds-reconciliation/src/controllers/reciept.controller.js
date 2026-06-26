import receiptService from '../services/receipt.service';
import {
  issueReceiptSchema,
  getReceiptParamsSchema,
} from '../validators/receiptsRefunds.validator';

export default issueReceipt = async (req, res, next) => {
  try {
    const body = issueReceiptSchema.parse(req.body);
    const receipt = await receiptService.issueReceipt(body);
    return res.status(201).json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
};

export default getReceipt = async (req, res, next) => {
  try {
    const { id } = getReceiptParamsSchema.parse(req.params);
    const receipt = await receiptService.getReceipt(id);
    return res.status(200).json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
};

export default getReceiptByPayment = async (req, res, next) => {
  try {
    const receipt = await receiptService.getReceiptByPaymentId(req.params.payment_id);
    return res.status(200).json({ success: true, data: receipt });
  } catch (err) {
    next(err);
  }
};

export default listStudentReceipts = async (req, res, next) => {
  try {
    const { student_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await receiptService.listStudentReceipts(student_id, { page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

