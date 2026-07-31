# Public API, Signed Webhooks & ATS Partner Integrations Engine

This module implements the **Public API, Signed Webhooks & ATS Partner Integrations Engine** for the PlaceMux backend. It provides versioned public APIs, secure ATS partner onboarding, HMAC-SHA256 signed webhook delivery, replay attack protection, API key authentication, and isolated sandbox environments for external integrations.

The platform enables third-party Applicant Tracking Systems (ATS) and enterprise partners to integrate securely while ensuring webhook authenticity, integrity, and protection against replay attacks.


# Folder Structure

```text
phase3-task17-partner-webhooks/
├── migrations/
│   └── 049_partner_webhooks_sandbox.sql     # Partner API & webhook schema
├── src/
│   ├── config/
│   │   ├── db.js                               # Database connection
│   │   ├── env.js                              # Environment configuration
│   │   ├── logger.js                           # Structured logging            
│   ├── middlewares/
│   │   └── errorHandler.js                     # Global error handler
│   ├── validators/
│   │   └── partner.validator.js               # Request validation schemas
│   ├── controllers/
│   │   └── partner.controller.js              # Partner integration endpoints
│   ├── services/
│   │   └── partner.service.js                 # API & webhook engine
│   └── routes/
│       ├── partner.routes.js                  # /api/v1/partner endpoints
│       └── index.js                           # Route registry
├── app.js                                     # Express application
├── server.js                                  # Server bootstrap
├── package.json                               # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. Partner Registration

The platform allows trusted ATS providers and enterprise partners to register for API access.

Each partner receives:

- API Key
- Webhook Secret
- Environment Assignment
- Rate Limit Configuration
- Tenant Association

Partners can operate independently in sandbox or production environments.

## 2. Signed Webhook Delivery

All outbound webhooks are cryptographically signed using **HMAC-SHA256**.

Each webhook includes:

- Signature Header
- Timestamp
- Event Type
- Payload
- Replay Protection Metadata

Receiving systems can independently verify authenticity before processing the event.


## 3. Replay Protection

To prevent malicious replay attacks, every webhook contains a timestamp and unique signing metadata.

The verification engine validates:

- Signature Integrity
- Timestamp Freshness
- Secret Matching
- Payload Integrity

Only valid requests are accepted.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/048_partner_integrations_tables.sql
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Start Development Server

```bash
npm run dev
```


# Evaluator Validation Guide

Configure the required environment variables.

```bash
export BASE=http://localhost:3009/api/v1/partner

export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
```


## Step 1 — Register a Sandbox Partner

```bash
curl -X POST "$BASE/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"partner_name\": \"Greenhouse ATS Integration\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"environment\": \"sandbox\",
    \"rate_limit_per_min\": 60
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "api_key": "pk_live_xxxxxxxxxxxxxxxxx",
  "webhook_secret": "whsec_xxxxxxxxxxxxxxxxx"
}
```

The partner is successfully registered and receives credentials for authenticated API access and webhook verification.


## Step 2 — Trigger a Signed Webhook

```bash
curl -X POST "$BASE/webhooks/trigger" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <INSERT_API_KEY_FROM_STEP_1>" \
  -d "{
    \"target_url\": \"https://webhook.site/test-receiver\",
    \"event_type\": \"ATS_CANDIDATE_EXPORTED\",
    \"payload\": {
      \"candidate_id\": \"4b111d42-ab12-4211-8224-2da21e48bc02\",
      \"status\": \"SHORTLISTED\"
    },
    \"idempotency_key\": \"wh-trigger-token-101\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "signature_header": "sha256=7c8b0d0f0e4f5b8f...",
  "timestamp": 1753459200
}
```

The webhook is successfully signed using **HMAC-SHA256**, and replay protection metadata is included.


## Step 3 — Verify Webhook Signature

```bash
curl -X POST "$BASE/webhooks/verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"raw_payload\": {
      \"candidate_id\": \"4b111d42-ab12-4211-8224-2da21e48bc02\",
      \"status\": \"SHORTLISTED\"
    },
    \"signature_header\": \"<INSERT_SIGNATURE_HEADER_FROM_STEP_2>\",
    \"webhook_secret\": \"<INSERT_WEBHOOK_SECRET_FROM_STEP_1>\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "signature_valid": true,
  "replay_attack_detected": false
}
```

The verification confirms that the webhook signature is authentic, the payload has not been modified, and replay protection checks have passed.


# Integration Features

- Versioned Public APIs
- ATS Partner Registration
- API Key Authentication
- HMAC-SHA256 Signed Webhooks
- Replay Attack Protection
- Sandbox & Production Environments
- Partner Rate Limiting
- Idempotent Webhook Delivery
- Production-ready Integration Platform


# Partner Registration Workflow

```text
Partner Registration
        │
        ▼
Validate Request
        │
        ▼
Generate API Key
        │
        ▼
Generate Webhook Secret
        │
        ▼
Assign Environment
        │
        ▼
Persist Partner Record
```


# Webhook Delivery Workflow

```text
Webhook Event
      │
      ▼
Generate Payload
      │
      ▼
Compute HMAC-SHA256 Signature
      │
      ▼
Attach Timestamp
      │
      ▼
Send Webhook
      │
      ▼
Record Delivery Audit
```

# Webhook Verification Workflow

```text
Incoming Webhook
        │
        ▼
Read Signature
        │
        ▼
Compute Expected HMAC
        │
        ▼
Compare Signatures
        │
        ▼
Validate Timestamp
        │
        ▼
Accept or Reject Request
```
