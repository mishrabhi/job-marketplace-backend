# Failure Handling & Resilience

This module hardens the core payment infrastructure of the PlaceMux backend. By introducing a deterministic state machine, a structured webhook retry worker with exponential backoff, a Dead Letter Queue (DLQ), and manual/automated recovery endpoints, we ensure that no financial or application state is silently dropped or left in an unrecoverable half-completed state.



# Folder Structure

```text
task9-failure-handling/
├── migrations/
│   └── 016_failure_handling_tables.sql   # Schema updates (Retry queue, DLQ, Failure logs)
├── docs/
│   └── api-contract.md                   # API Endpoint Specifications
├── src/
│   ├── config/
│   │   ├── db.js                         # Supabase client initialization
│   │   ├── env.js                        # Zod-validated environment config
│   │   ├── logger.js                     # Structured Winston logging extension
│   │   └── razorpay.js                   # Razorpay SDK initialization
│   ├── middlewares/
│   │   ├── errorHandler.js               # Global centralized error handler
│   │   └── rawBody.js                    # Raw buffer collector for webhook signing
│   ├── validators/
│   │   └── failure.validator.js          # Zod request payload schemas
│   ├── controllers/
│   │   ├── failure.controller.js         # Recovery & diagnostics handlers
│   │   └── webhook.controller.js         # Safe webhook collection endpoint
│   ├── services/
│   │   ├── failureHandling.service.js    # Stuck sweepers, state machines & recovery logic
│   │   ├── webhookRetry.service.js       # Background retry worker with exponential backoff
│   │   └── webhook.service.js            # Atomic webhook processing layer
│   └── routes/
│       ├── failure.routes.js             # /api/v1/failures routes
│       ├── webhook.routes.js             # /api/v1/webhooks routes
│       └── index.js                      # Route registry
├── tests/
│   ├── unit/
│   │   ├── failureHandling.service.test.js
│   │   └── webhookRetry.service.test.js
│   └── integration/
│       └── failure.routes.test.js
├── app.js                                # Express application setup
├── server.js                             # Server bootstrap & cron execution
└── package.json                          # Project manifest
```


# Core Resilience Concepts & Architecture

## 1. The Stuck Payment Sweeper (`detectStuckPayments`)

Payments may become trapped in intermediate states due to network failures or missing third-party callbacks. The sweeper periodically scans for such records using predefined timeout rules.

### Timeout Rules

| Payment Status | Considered Stuck After |
| -------------- | ---------------------- |
| `created`      | **30 minutes**         |
| `authorized`   | **15 minutes**         |

> Razorpay automatically captures authorized payments within approximately **5 minutes**, so anything beyond **15 minutes** is treated as anomalous.

Whenever a stuck payment is detected, a record is inserted into the `payment_failure_log` table for auditing and manual recovery.


## 2. Webhook Failure Loop & Exponential Backoff

Every incoming Razorpay webhook is immediately written to the `payment_events` audit table.

If processing fails due to:

* Database outage
* Internal server error
* Unexpected exception
* Temporary infrastructure failure

the system behaves safely:

1. Stores the payload in `webhook_retry_queue`
2. Marks its status as `pending`
3. Responds with **HTTP 200 OK** to Razorpay to avoid webhook delivery throttling
4. Allows a background retry worker to process it later

### Retry Schedule

| Attempt | Delay       |
| ------- | ----------- |
| 1       | 30 seconds  |
| 2       | 60 seconds  |
| 3       | 120 seconds |
| 4       | 240 seconds |
| 5       | 480 seconds |

After the fifth unsuccessful retry, the event is automatically moved into the **Dead Letter Queue (DLQ)** for manual investigation.


## 3. State Machine Transition Safeguards

The `recoverPayment()` service enforces strict state transitions so that invalid or contradictory updates cannot occur.

| Recovery Action  | Allowed Current State(s) | Result                                                                      |
| ---------------- | ------------------------ | --------------------------------------------------------------------------- |
| `mark_failed`    | `created`, `authorized`  | Payment → `failed`, Application → `pending_payment`                         |
| `mark_captured`  | `authorized`             | Payment → `captured`, Application → `applied`                               |
| `trigger_refund` | `captured`               | Razorpay Refund API called, Payment → `refunded`, Application → `withdrawn` |
| `dismiss`        | Any                      | No payment changes. Marks failure log as resolved.                          |

These safeguards ensure every payment follows a deterministic lifecycle.


# Setup & Execution Guide

## 1. Prerequisites

Run the database migration inside your Supabase SQL environment.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/016_failure_handling_tables.sql
```


## 2. Environment Variables

Create a `.env` file in the project root.

```env
PORT=3009
NODE_ENV=development

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-test-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```


## 3. Install Dependencies

```bash
npm install
```


## 4. Start Development Server

```bash
npm run dev
```


## 5. Run Test Suites

Run all tests:

```bash
npm test
```

Run only unit tests:

```bash
npm run test:unit
```

Run only integration tests:

```bash
npm run test:integration
```


# Evaluator Walkthrough (Demo Script)

## Configure Environment Variables

```bash
export BASE=http://localhost:3009/api/v1
export RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

export PAYMENT_ID="<uuid-of-stuck-created-payment>"
export CAPTURED_PAYMENT_ID="<uuid-of-captured-payment>"
```



## Step 1 — Verify Baseline Health

```bash
curl "$BASE/failures/summary"
```

### Expected

* Returns **HTTP 200 OK**
* Provides summary counts for:

  * Failure Logs
  * Retry Queue
  * Dead Letter Queue
* Returns:

```json
{
  "healthy": true
}
```

when no stale records exist.


## Step 2 — Detect Stuck Payments

```bash
curl -X POST "$BASE/failures/detect-stuck"
```

### Expected

Payments exceeding the operational timeout are identified and inserted into the `payment_failure_log` table.


## Step 3 — Simulate a Failed Webhook

```bash
PAYLOAD='{"event":"payment.captured","payload":{}}'

SIG=$(echo -n "$PAYLOAD" \
| openssl dgst -sha256 -hmac "$RAZORPAY_WEBHOOK_SECRET" \
| awk '{print $2}')

curl -X POST "$BASE/webhooks/razorpay" \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: $SIG" \
  -d "$PAYLOAD"
```

### Expected

```json
{
  "received": true,
  "queued": true
}
```

The webhook fails validation safely and is placed into the retry queue instead of being lost.

Verify the new record inside:

```
webhook_retry_queue
```


## Step 4 — Recover a Stuck Payment

```bash
curl -X POST "$BASE/failures/recover" \
  -H "Content-Type: application/json" \
  -d "{
    \"payment_id\": \"$PAYMENT_ID\",
    \"action\": \"mark_failed\",
    \"resolution_note\": \"Stuck transaction cleared manually so the student can retry checkout.\"
  }"
```

### Expected

The recovery service:

* Marks payment as **failed**
* Rolls application back to **pending_payment**
* Preserves the student's slot so checkout can be attempted again


## Step 5 — Verify Invalid Transition Protection

```bash
curl -X POST "$BASE/failures/recover" \
  -H "Content-Type: application/json" \
  -d "{
    \"payment_id\": \"$PAYMENT_ID\",
    \"action\": \"mark_captured\"
  }"
```

### Expected

Returns:

```http
400 Bad Request
```

with an error similar to:

```json
{
  "error": "INVALID_RECOVERY_ACTION"
}
```

The state machine correctly prevents an already failed payment from transitioning to the `captured` state.


# Key Features

* Deterministic payment state machine
* Automated stuck payment detection
* Webhook retry queue with exponential backoff
* Dead Letter Queue (DLQ) for exhausted retries
* Atomic payment recovery operations
* Structured failure logging
* Manual recovery endpoints
* Full unit and integration test coverage
* Production-ready resilience architecture
