# Task 7 — Pay-per-Application Flow

**PlaceMux Phase 2 Week 3 — Backend Engineer**

A student pays ₹100 (10000 paise) to apply to a job. The application is only confirmed after payment is captured. If payment fails, the application stays in a retryable `pending_payment` state — the student never loses their application slot silently.

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your Supabase and Razorpay test mode credentials
```

### 3. Run Migration

Run the SQL in `migrations/014_paid_apply_gate.sql` on your Supabase database:
- Adds `pending_payment` status to applications
- Adds `payment_id` FK to applications
- Creates `application_fee_config` table with default ₹100 fee
- Creates `payment_events` log table for webhooks

### 4. Start the Server

```bash
npm start
```

Server runs on `http://localhost:3007`

### 5. Run Tests

```bash
npm test
```

---

## API Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/v1/paid-applications` | Create pending_payment application + Razorpay order |
| `POST` | `/api/v1/paid-applications/confirm` | Verify signature, activate application |
| `GET` | `/api/v1/paid-applications/:id` | Check application + payment status |
| `POST` | `/api/v1/webhooks/razorpay` | Receive Razorpay payment events |
| `GET` | `/health` | Health check |

---

## Architecture

```
src/
├── config/
│   ├── env.js          # Validated config loader (freezes object)
│   ├── db.js           # Supabase client
│   └── razorpay.js     # Razorpay SDK init
├── middlewares/
│   ├── errorHandler.js # appError factory + global error handler
│   └── rawBody.js      # Raw body capture for webhook signature verification
├── services/
│   ├── paidApply.service.js    # Core logic: initiate, confirm, getStatus
│   └── webhook.service.js      # Webhook event handling
├── controllers/
│   ├── paidApply.controller.js # HTTP handlers
│   └── webhook.controller.js
├── validators/
│   └── paidApply.validator.js  # Zod schemas
├── routes/
│   ├── paidApply.routes.js
│   ├── webhook.routes.js
│   └── index.js
├── app.js              # Express setup + middleware
└── server.js           # Port binding
```

---

## Key Design Decisions

### 1. **Idempotency**

Every endpoint that creates state requires `idempotency_key`. Retrying with the same key returns the same result without creating duplicates.

```bash
curl POST /api/v1/paid-applications \
  -d '{ student_id, job_id, idempotency_key }'
# Returns same application.id every time
```

### 2. **Payment State Machine**

```
pending_payment ──(webhook: payment.captured)──> applied
              ──(webhook: payment.failed)────> pending_payment (retryable)
              ──(confirmPayment: bad sig)────> pending_payment (retryable)
              ──(webhook: refund.created)────> withdrawn
```

### 3. **Error Codes**

All errors follow the pattern:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { /* optional */ }
  }
}
```

### 4. **Webhook Always Returns 200**

Even if the signature is invalid, the webhook returns 200 to prevent Razorpay from retrying forever. Errors are logged internally.

### 5. **Raw Body Middleware**

The webhook route uses raw body middleware (not `express.json()`) to preserve the exact payload for signature verification:

```javascript
app.use((req, res, next) => {
  if (req.path === '/api/v1/webhooks/razorpay') {
    return rawBodyMiddleware(req, res, next);
  }
  express.json()(req, res, next);
});
```

---

## Service Functions

### `initiatePaidApply({ student_id, job_id, idempotency_key })`

**Steps:**
1. Check idempotency key (return existing if found)
2. Verify job exists and is published
3. Check student hasn't already applied
4. Fetch fee from `application_fee_config`
5. Create Razorpay order
6. Insert payment row
7. Insert application row (compensating delete if fails)

**Returns:** `{ application, payment, razorpay_order }`

**Errors:** JOB_NOT_FOUND, JOB_NOT_PUBLISHED, ALREADY_APPLIED, GATEWAY_ERROR

---

### `confirmPayment({ application_id, razorpay_order_id, razorpay_payment_id, razorpay_signature })`

**Steps:**
1. Fetch application
2. Verify status is `pending_payment`
3. Verify Razorpay signature (mark payment failed if invalid)
4. Update payment to `captured`
5. Update application to `applied`

**Returns:** `{ application, payment }`

**Errors:** APPLICATION_NOT_FOUND, PAYMENT_ALREADY_CONFIRMED, INVALID_SIGNATURE

---

### `handleWebhookEvent(rawBody, signatureHeader)`

**Handles:**
- `payment.captured` → payment: captured, application: applied
- `payment.failed` → payment: failed, application: pending_payment (unchanged)
- `refund.created` → payment: refunded, application: withdrawn
- Unknown events → logged, stored in payment_events

**Always stores event in `payment_events` table.**

**Returns:** `{ received: true, event_type }`

---

## Testing

### Unit Tests

```bash
npm test tests/unit/paidApply.service.test.js
npm test tests/unit/webhook.service.test.js
```

Covers all 11 required test cases (see Stage 9 spec).

### Integration Tests

```bash
npm test tests/integration/
```

(Placeholder for route-level tests with real/mock DB)

---

## Supabase Tables

### `applications`
Existing table, modified:
- ✅ `status` enum: now includes `pending_payment`
- ✅ `payment_id` FK to payments (nullable)

### `payments`
Existing table (created in Task 6):
- `id` UUID
- `student_id` UUID
- `company_id` UUID
- `application_id` UUID (nullable initially)
- `amount` integer (paise)
- `currency` text
- `status` enum: `created | captured | failed | refunded`
- `razorpay_order_id` text
- `razorpay_payment_id` text (nullable)
- `razorpay_signature` text (nullable)
- `failure_reason` text (nullable)
- `idempotency_key` text
- `created_at` timestamp

### `application_fee_config` (New)
Created by migration:
- `id` UUID PK
- `job_id` UUID FK (nullable — NULL = default fee)
- `amount_paise` integer (default 10000)
- `currency` text (default 'INR')
- `active` boolean (default true)
- `created_at` timestamp

### `payment_events` (Assumed Existing or Created)
Webhook event log:
- `id` UUID PK
- `payment_id` UUID FK (nullable if event unmatched)
- `event_type` text
- `payload` JSONB
- `created_at` timestamp

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `JOB_NOT_FOUND` | 404 | Job doesn't exist |
| `JOB_NOT_PUBLISHED` | 400 | Job not in published state |
| `ALREADY_APPLIED` | 409 | Student has active app for this job |
| `GATEWAY_ERROR` | 502 | Razorpay API failed |
| `PAYMENT_NOT_FOUND` | 404 | Payment not found (shouldn't happen) |
| `APPLICATION_NOT_FOUND` | 404 | Application not found or not owned by student |
| `PAYMENT_ALREADY_CONFIRMED` | 400 | Application not in pending_payment |
| `INVALID_SIGNATURE` | 400 | Razorpay payment signature mismatch |
| `INVALID_WEBHOOK_SIGNATURE` | 400 | Webhook X-Razorpay-Signature mismatch |
| `FEE_CONFIG_MISSING` | 500 | Fee config not found |
| `VALIDATION_ERROR` | 422 | Zod schema failed |
| `DB_ERROR` | 500 | Database error |

---

## Demo Walkthrough

See `docs/demo-script.md` for step-by-step curl examples demonstrating:
1. Initiating a paid application
2. Idempotency check
3. Webhook payment.captured
4. Reading application status
5. Payment failure scenario
6. Bad signature handling
7. Duplicate application rejection
8. Invalid webhook signature

---

## Definition of Done

- [x] Migration `014_paid_apply_gate.sql` created
- [x] `applications.status` accepts `pending_payment`
- [x] `initiatePaidApply` creates Razorpay order in test mode
- [x] Idempotency key prevents duplicate orders
- [x] `confirmPayment` verifies signature
- [x] Bad signature sets payment to `failed`, application stays retryable
- [x] Webhook `payment.captured` activates application
- [x] Webhook `payment.failed` keeps application retryable
- [x] All webhook events stored in `payment_events`
- [x] Unit tests for all service functions
- [x] API contract documentation
- [x] Demo script

---

## Next Steps (Frontend Handoff)

Frontend needs:
1. `POST /api/v1/paid-applications` → get `razorpay_order.id`
2. Open Razorpay SDK checkout with that order ID
3. User completes payment, SDK returns `razorpay_payment_id` + `razorpay_signature`
4. `POST /api/v1/paid-applications/confirm` with those values
5. `GET /api/v1/paid-applications/:id` to check status

---

## Stack

- **Node.js 18+**
- **Express.js** — HTTP server
- **Supabase** — PostgreSQL + real-time
- **Razorpay SDK** — Payment gateway (test mode)
- **Zod** — Schema validation
- **Jest + Supertest** — Testing
- **Winston** — Logging (optional, can add)

---

## Support

For questions about the implementation, see:
- `docs/api-contract.md` — Full API specification
- `docs/demo-script.md` — Step-by-step demo
- `tests/unit/` — Test examples for all scenarios
