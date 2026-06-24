# Payments API Contract

POST /api/v1/payments/orders
- Request: JSON

  {
    "application_id": "uuid",
    "student_id": "uuid",
    "company_id": "uuid",
    "amount_paise": 50000,
    "idempotency_key": "string"
  }

- Success Response: 201

  {
    "success": true,
    "data": {
      "payment": { /* payment row */ },
      "razorpay_order": { "id": "order_xxx", "amount": 50000, "currency": "INR" }
    }
  }

- Errors:
  - 422 VALIDATION_ERROR
  - 404 APPLICATION_NOT_FOUND
  - 409 PAYMENT_ALREADY_EXISTS
  - 502 GATEWAY_ERROR

POST /api/v1/payments/verify
- Request:

  {
    "payment_id": "uuid",
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "hex-string"
  }

- Success Response: 200

  { "success": true, "data": { /* updated payment row with status: captured */ } }

- Errors:
  - 422 VALIDATION_ERROR
  - 404 PAYMENT_NOT_FOUND
  - 400 INVALID_SIGNATURE

POST /api/v1/webhooks/razorpay
- Headers: `X-Razorpay-Signature`
- Body: raw Razorpay event payload
- Response: always 200 when processed successfully

  { "received": true }

- Errors:
  - 400 INVALID_WEBHOOK_SIGNATURE (when signature mismatch)

GET /api/v1/payments/:id
- Response: 200
  { "success": true, "data": { /* payment row with related application/student/company */ } }
