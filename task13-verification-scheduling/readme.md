# Public Document Verification & Interview Scheduler Interface

This module implements the **Public Document Verification** service and an **Atomic Interview Scheduler** for the PlaceMux backend. It enables anyone with a valid offer identifier and verification checksum to independently verify offer authenticity while providing a safe, idempotent interview scheduling system that prevents duplicate bookings.


# Folder Structure

```text id="hnm4tx"
task13-verification-interviews/
├── migrations/
│   └── 020_verification_interview_tables.sql   # Verification & interview scheduling schema
├── src/
│   ├── config/
│   │   ├── db.js                               # Database connection
│   │   ├── env.js                              # Environment configuration
│   │   └── logger.js                           # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                     # Global error handler
│   ├── validators/
│   │   ├── verification.validator.js           # Public verification validation
│   │   └── interview.validator.js              # Interview scheduling validation
│   ├── controllers/
│   │   ├── verification.controller.js          # Public verification endpoints
│   │   └── interview.controller.js             # Interview scheduling endpoints
│   ├── services/
│   │   ├── verification.service.js             # Document verification logic
│   │   └── interview.service.js                # Interview scheduling engine
│   └── routes/
│       ├── verification.routes.js              # /api/v1/verification endpoints
│       ├── interview.routes.js                 # /api/v1/interviews endpoints
│       └── index.js                            # Route registry
├── app.js                                      # Express application
├── server.js                                   # Server bootstrap
├── package.json                                # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Public Document Verification

The verification service allows any external party to verify the authenticity of a signed offer without requiring authentication.

Verification requires:

* Offer ID
* Cryptographic checksum

The verification engine:

1. Retrieves the offer record.
2. Recomputes the verification checksum.
3. Compares it with the provided checksum.
4. Returns the verification status.

This enables recruiters, students, and third parties to independently validate offer integrity.


## 2. Tamper Detection

Protected offer fields are included in the checksum calculation.

Examples include:

* Company Name
* Role
* Compensation
* Student ID
* Offer Identifier
* Signature Metadata

If any of these values change after signing, the recomputed checksum differs from the original one and the verification request fails immediately.


## 3. Atomic Interview Scheduling

Interview scheduling is implemented as an **idempotent booking operation**.

Each scheduling request includes a unique:

```text id="5xt6jv"
idempotency_key
```

The scheduler guarantees:

* Duplicate requests never create duplicate interviews.
* Existing bookings are returned immediately.
* Interview slots remain consistent even under client retries or temporary network failures.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration inside your PostgreSQL/Supabase instance.

```bash id="5m4t5z"
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/020_verification_interview_tables.sql
```


## 2. Install Dependencies

```bash id="nljlwm"
npm install
```


## 3. Start Development Server

```bash id="zkgc7u"
npm run dev
```


# Evaluator Validation Guide

Configure the API base URL.

```bash id="n4zq5j"
export BASE=http://localhost:3009/api/v1
```


## Step 1 — Verify a Signed Offer

```bash id="ngvh2d"
curl -X GET "$BASE/verification/public-verify?offer_id=<INSERT_OFFER_ID>&checksum=<INSERT_VERIFIABLE_FINGERPRINT>"
```

### Expected Result

```json id="f7xwqm"
{
  "verified": true,
  "offer_id": "<offer-id>",
  "verification_status": "VERIFIED"
}
```

If the checksum matches the recalculated value, the offer is confirmed to be authentic.


### Tamper Detection

If any protected database field is modified after signing, executing the same verification request returns:

```json id="3hvhb4"
{
  "verified": false,
  "verification_status": "TAMPER_DETECTED"
}
```

This immediately exposes unauthorized modifications.


## Step 2 — Schedule an Interview

```bash id="hvjlwm"
curl -X POST "$BASE/interviews/schedule" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": "8a329d41-cc21-4112-9114-1da21e48bc01",
    "interviewer_id": "11a22b33-cc44-55ee-66ff-77aa88bb99cc",
    "student_id": "4b111d42-ab12-4211-8224-2da21e48bc02",
    "scheduled_start": "2026-07-02T10:00:00Z",
    "scheduled_end": "2026-07-02T11:00:00Z",
    "meeting_link": "https://meet.google.com/abc-defg-hij",
    "idempotency_key": "unique-booking-intent-token-xyz-101"
  }'
```

### Expected Result

Returns:

```json id="fihxsp"
{
  "success": true,
  "interview_scheduled": true
}
```

If the same request is submitted again using the same `idempotency_key`, the existing booking is returned instead of creating a duplicate interview.


# Security Features

* Public cryptographic offer verification
* SHA-256 checksum validation
* Tamper-evident document integrity
* Idempotent interview scheduling
* Duplicate booking prevention
* Atomic database operations
* Structured audit logging
* Production-ready verification architecture


# Interview Scheduling Workflow

```text id="xkr4yf"
Interview Request
        │
        ▼
Validate Payload
        │
        ▼
Check Idempotency Key
        │
        ├──────────────► Existing Booking
        │                  │
        │                  ▼
        │          Return Existing Record
        │
        ▼
Create Interview Slot
        │
        ▼
Persist Schedule
        │
        ▼
Return Confirmation
```


# Public Verification Workflow

```text id="ldq9ia"
Offer ID + Checksum
        │
        ▼
Retrieve Offer
        │
        ▼
Recalculate Checksum
        │
        ▼
Compare Checksums
        │
        ├──────────────► Match
        │                  │
        │                  ▼
        │             VERIFIED
        │
        ▼
Mismatch
        │
        ▼
TAMPER_DETECTED
```

