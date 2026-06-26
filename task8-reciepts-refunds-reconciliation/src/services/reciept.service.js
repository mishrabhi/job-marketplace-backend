import supabase from '../config/db';
import appError from '../middlewares/errorHandler';

/**
 * Generate a human-readable receipt number.
 * Format: RCP-YYYY-XXXXXX (zero-padded 6-digit sequence)
 * Uses the Postgres sequence receipt_number_seq for uniqueness.
 */
export default generateReceiptNumber = async () => {
  const { data, error } = await supabase.rpc('nextval', { seq: 'receipt_number_seq' });
  if (error) {
    // Fallback: use timestamp + random if RPC fails
    const seq = Date.now().toString().slice(-6);
    return `RCP-${new Date().getFullYear()}-${seq}`;
  }
  const year = new Date().getFullYear();
  const seq = String(data).padStart(6, '0');
  return `RCP-${year}-${seq}`;
};

/**
 * Issue a receipt for a captured payment.
 * Idempotent: if a receipt already exists for this payment_id, return it.
 */
export default issueReceipt = async ({ payment_id, student_id }) => {
  // 1. Check for existing receipt (idempotent)
  const { data: existing } = await supabase
    .from('receipts')
    .select('*')
    .eq('payment_id', payment_id)
    .single();

  if (existing) return existing;

  // 2. Verify the payment exists and is captured
  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .select('id, status, amount, currency, student_id')
    .eq('id', payment_id)
    .single();

  if (payErr || !payment) {
    throw appError(404, 'PAYMENT_NOT_FOUND', `Payment ${payment_id} not found`);
  }
  if (payment.status !== 'captured') {
    throw appError(400, 'PAYMENT_NOT_CAPTURED',
      `Cannot issue receipt for payment with status '${payment.status}'. Payment must be captured first.`
    );
  }
  if (payment.student_id !== student_id) {
    throw appError(403, 'FORBIDDEN', 'Payment does not belong to this student');
  }

  // 3. Generate unique receipt number
  const receipt_number = await generateReceiptNumber();

  // 4. Insert receipt
  const { data: receipt, error: recErr } = await supabase
    .from('receipts')
    .insert({
      payment_id,
      student_id,
      receipt_number,
      amount_paise: payment.amount,
      currency: payment.currency,
    })
    .select()
    .single();

  if (recErr) throw appError(500, 'DB_ERROR', recErr.message);

  return receipt;
};

/**
 * Get a receipt by ID with joined payment details.
 */
export default getReceipt = async (receiptId) => {
  const { data, error } = await supabase
    .from('receipts')
    .select(`
      *,
      payments (
        id, razorpay_payment_id, razorpay_order_id,
        amount, currency, status,
        applications ( id, job_id, jobs ( title, companies ( name ) ) )
      )
    `)
    .eq('id', receiptId)
    .single();

  if (error || !data) {
    throw appError(404, 'RECEIPT_NOT_FOUND', `Receipt ${receiptId} not found`);
  }
  return data;
};

/**
 * Get receipt by payment_id — useful for frontend after payment capture.
 */
export default getReceiptByPaymentId = async (paymentId) => {
  const { data, error } = await supabase
    .from('receipts')
    .select('*, payments ( id, amount, currency, razorpay_payment_id )')
    .eq('payment_id', paymentId)
    .single();

  if (error || !data) {
    throw appError(404, 'RECEIPT_NOT_FOUND', `No receipt found for payment ${paymentId}`);
  }
  return data;
};

/**
 * List all receipts for a student.
 */
export default listStudentReceipts = async (studentId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('receipts')
    .select('*, payments ( amount, currency, razorpay_payment_id )', { count: 'exact' })
    .eq('student_id', studentId)
    .order('issued_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw appError(500, 'DB_ERROR', error.message);

  return {
    data: data || [],
    meta: { page, limit, total: count || 0, total_pages: Math.ceil((count || 0) / limit) },
  };
};
