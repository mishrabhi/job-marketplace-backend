import failureHandlingService from ('../services/failureHandling.service');
import webhookRetryService from ('../services/webhookRetry.service');
import supabase from ('../config/db');
import { recoverPaymentSchema, dlqQuerySchema } from ('../validators/failure.validator');

export default recoverPayment = async (req, res, next) => {
  try {
    const parsedBody = recoverPaymentSchema.parse(req.body);
    const result = await failureHandlingService.recoverPayment(parsedBody.payment_id, {
      action: parsedBody.action,
      resolution_note: parsedBody.resolution_note
    });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export default getFailureSummary = async (req, res, next) => {
  try {
    const result = await failureHandlingService.getFailureSummary();
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export default detectStuckPayments = async (req, res, next) => {
  try {
    const result = await failureHandlingService.detectStuckPayments();
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export default getFailureLog = async (req, res, next) => {
  try {
    const { resolved } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    let query = supabase.from('payment_failure_log').select('*', { count: 'exact' });

    if (resolved === 'true') query = query.eq('resolved', true);
    if (resolved === 'false') query = query.eq('resolved', false);

    const { data, count, error } = await query
      .order('logged_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
      meta: { page, limit, total: count || 0, total_pages: Math.ceil((count || 0) / limit) }
    });
  } catch (err) {
    next(err);
  }
};

export default getDLQEntries = async (req, res, next) => {
  try {
    const parsedQuery = dlqQuerySchema.parse(req.query);
    const result = await webhookRetryService.getDLQEntries(parsedQuery);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
