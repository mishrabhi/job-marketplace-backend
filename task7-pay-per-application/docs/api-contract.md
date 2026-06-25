# Task 7 — Pay-per-Application API Contract

**Base URL:** `http://localhost:3007`

---

## Health Check

### `GET /health`

Check service status.

**Response 200:**
```json
{
  "status": "ok",
  "task": "task7-pay-per-application"
}
```

---

## Paid Applications

### `POST /api/v1/paid-applications` — Initiate Paid Apply

Create a `pending_payment` application and Razorpay order.

**Request:**
```json
{
  "student_id": "uuid",
  "job_id": "uuid",
  "idempotency_key": "string (min 8 chars, e.g., apply-student-uuid-job-uuid)"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "uuid",
      "student_id": "uuid",
      "job_id": "uuid",
      "status": "pending_payment",
      "payment_id": "uuid",
      "idempotency_key": "string",
      "created_at": "2024-06-25T10:30:00Z"
    },
    "payment": {
      "id": "uuid",
      "student_id": "uuid",
      "company_id": "uuid",
      "amount": 10000,
      "currency": "INR",
      "status": "created",
      "razorpay_order_id": "order_xxx",
      "idempotency_key": "string",
      "created_at": "2024-06-25T10:30:00Z"
    },
    "razorpay_order": {
      "id": "order_xxx",
      "amount": 10000,
      "currency": "INR"
    }
  }
}
```

**Error 404 — JOB_NOT_FOUND:**
```json
{
  "success": false,
  "error": {
    "code": "JOB_NOT_FOUND",
    "message": "Job not found"
  }
}
```

**Error 400 — JOB_NOT_PUBLISHED:**
```json
{
  "success": false,
  "error": {
    "code": "JOB_NOT_PUBLISHED",
    "message": "Job is not published"
  }
}
```

**Error 409 — ALREADY_APPLIED:**
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_APPLIED",
    "message": "Student already has an active application for this job"
  }
}
```

**Error 502 — GATEWAY_ERROR:**
```json
{
  "success": false,
  "error": {
    "code": "GATEWAY_ERROR",
    "message": "Razorpay error message"
  }
}
```

**Error 422 — VALIDATION_ERROR:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": ["student_id"],
        "message": "Expected string, received number"
      }
    ]
  }
}
```

**Frontend Flow:**
1. Receive `razorpay_order.id`
2. Open Razorpay checkout modal with Razorpay SDK
3. User completes payment in modal
4. SDK returns `razorpay_payment_id` and `razorpay_signature` in success callback
5. Call `POST /api/v1/paid-applications/confirm` with these values

---

### `POST /api/v1/paid-applications/confirm` — Confirm Payment

Verify Razorpay signature and activate the application.

**Request:**
```json
{
  "application_id": "uuid",
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "hex-string (min 10 chars)"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "application": {
      "id": "uuid",
      "student_id": "uuid",
      "job_id": "uuid",
      "status": "applied",
      "payment_id": "uuid",
      "created_at": "2024-06-25T10:30:00Z"
    },
    "payment": {
      "id": "uuid",
      "status": "captured",
      "amount": 10000,
      "currency": "INR",
      "razorpay_order_id": "order_xxx",
      "razorpay_payment_id": "pay_xxx",
      "razorpay_signature": "hex-string",
      "created_at": "2024-06-25T10:30:00Z"
    }
  }
}
```

**Error 404 — APPLICATION_NOT_FOUND:**
```json
{
  "success": false,
  "error": {
    "code": "APPLICATION_NOT_FOUND",
    "message": "Application not found"
  }
}
```

**Error 400 — PAYMENT_ALREADY_CONFIRMED:**
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_ALREADY_CONFIRMED",
    "message": "Application is not in pending_payment state"
  }
}
```

**Error 400 — INVALID_SIGNATURE:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Payment signature verification failed"
  }
}
```

Payment is marked as `failed` when signature fails — student can retry.

---

### `GET /api/v1/paid-applications/:id` — Get Application Status

Fetch application with linked payment, job, and company details.

**Query Parameters:**
- `student_id` (uuid) — Required for testing; in production comes from JWT token

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "job_id": "uuid",
    "status": "applied | pending_payment | shortlisted | rejected | withdrawn",
    "payment_id": "uuid",
    "created_at": "2024-06-25T10:30:00Z",
    "payments": {
      "id": "uuid",
      "status": "created | captured | failed | refunded",
      "amount": 10000,
      "currency": "INR",
      "razorpay_payment_id": "pay_xxx | null",
      "created_at": "2024-06-25T10:30:00Z"
    },
    "jobs": {
      "id": "uuid",
      "title": "Senior Backend Engineer",
      "description": "Build scalable systems...",
      "companies": {
        "id": "uuid",
        "name": "TechCorp"
      }
    }
  }
}
```

**Error 404 — APPLICATION_NOT_FOUND:**
```json
{
  "success": false,
  "error": {
    "code": "APPLICATION_NOT_FOUND",
    "message": "Application not found"
  }
}
```

---

## Webhooks

### `POST /api/v1/webhooks/razorpay` — Razorpay Webhook Receiver

Receives and processes Razorpay events. **Always responds 200 to prevent Razorpay retries.**

**Headers:**
```
Content-Type: application/json
X-Razorpay-Signature: <hmac-sha256-of-raw-body>
```

**Request (Raw JSON Body):**

Example for `payment.captured`:
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxx",
        "order_id": "order_yyy",
        "amount": 10000,
        "currency": "INR",
        "status": "captured"
      }
    }
  }
}
```

Example for `payment.failed`:
```json
{
  "event": "payment.failed",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_xxx",
        "order_id": "order_yyy",
        "error_description": "Insufficient funds",
        "status": "failed"
      }
    }
  }
}
```

Example for `refund.created`:
```json
{
  "event": "refund.created",
  "payload": {
    "refund": {
      "entity": {
        "id": "rfnd_xxx",
        "payment_id": "pay_xxx",
        "amount": 10000,
        "currency": "INR",
        "status": "processed"
      }
    }
  }
}
```

**Response 200 (always):**
```json
{
  "received": true,
  "event_type": "payment.captured | payment.failed | refund.created | ..."
}
```

**Event Handling:**

| Event | Action | Application Status | Payment Status |
|-------|--------|-------------------|-----------------|
| `payment.captured` | Update payment, link application, activate | `applied` | `captured` |
| `payment.failed` | Update payment with failure reason | `pending_payment` (no change) | `failed` |
| `refund.created` | Update payment, withdraw application | `withdrawn` | `refunded` |
| Unknown | Log, store in `payment_events` | (no change) | (no change) |

**Important:** Even on signature verification failure, respond 200 to prevent Razorpay retrying forever. Invalid webhooks are logged but not processed.

---

## Idempotency

All endpoints that create state use `idempotency_key`:

- `POST /api/v1/paid-applications` → uses `idempotency_key` in request
- Subsequent requests with the same `idempotency_key` return the existing application without creating a new Razorpay order

**Example:**
```
Request 1: POST /paid-applications { student_id, job_id, idempotency_key: "key-123" }
Response: application-id-A, order-id-X

Request 2: POST /paid-applications { student_id, job_id, idempotency_key: "key-123" }
Response: application-id-A, order-id-X (SAME — no duplicate order)
```

---

## State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│  initiatePaidApply()                                            │
│  ↓                                                              │
│  application.status = pending_payment                          │
│  payment.status = created                                      │
└─────────────────────────────────────────────────────────────────┘
       │
       ├─→ confirmPayment() [valid sig]
       │   ↓
       │   application.status = applied ← ACTIVE
       │   payment.status = captured
       │
       ├─→ confirmPayment() [bad sig]
       │   ↓
       │   application.status = pending_payment (no change)
       │   payment.status = failed
       │   (Student can retry)
       │
       ├─→ webhook: payment.captured
       │   ↓
       │   application.status = applied ← ACTIVE
       │   payment.status = captured
       │
       ├─→ webhook: payment.failed
       │   ↓
       │   application.status = pending_payment (no change)
       │   payment.status = failed
       │   (Student can retry)
       │
       └─→ webhook: refund.created
           ↓
           application.status = withdrawn
           payment.status = refunded
```

---

## Error Codes Reference

| Code | HTTP | Cause |
|------|------|-------|
| `JOB_NOT_FOUND` | 404 | job_id doesn't exist |
| `JOB_NOT_PUBLISHED` | 400 | Job is draft or closed |
| `ALREADY_APPLIED` | 409 | Student has active application for this job |
| `GATEWAY_ERROR` | 502 | Razorpay order creation failed |
| `PAYMENT_NOT_FOUND` | 404 | payment_id not found (DB issue) |
| `APPLICATION_NOT_FOUND` | 404 | application_id not found or not owned by student |
| `PAYMENT_ALREADY_CONFIRMED` | 400 | Application is not in pending_payment state |
| `INVALID_SIGNATURE` | 400 | Razorpay payment signature mismatch |
| `INVALID_WEBHOOK_SIGNATURE` | 400 | Webhook X-Razorpay-Signature mismatch |
| `FEE_CONFIG_MISSING` | 500 | No fee config row found (data issue) |
| `VALIDATION_ERROR` | 422 | Zod schema failure |
| `DB_ERROR` | 500 | Supabase query error |
| `INTERNAL_ERROR` | 500 | Unhandled error |

---

## Demo/Testing Walkthrough

See `demo-script.md` for a complete curl-based walkthrough.
