# Data-Subject Rights & Resilience Engine

This module implements the **Data-Subject Rights & Resilience Engine** for the PlaceMux backend. It focuses on privacy compliance, resilient data management, and operational safeguards by providing secure data-subject rights workflows, disaster recovery readiness, and system drift monitoring. The goal is to ensure that personal data is managed in accordance with privacy requirements while remaining reliable under real-world failures.


# Folder Structure

```text
task22-data-rights-resilience/
├── migrations/
│   └── 029_data_subject_rights_tables.sql   # Privacy, audit & resilience schema
├── src/
│   ├── config/
│   │   ├── db.js                            # Database connection
│   │   ├── env.js                           # Environment configuration
│   │   └── logger.js                        # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                  # Global error handler
│   ├── validators/
│   │   └── rights.validator.js              # Request validation schemas
│   ├── controllers/
│   │   └── rights.controller.js             # Data-subject rights endpoints
│   ├── services/
│   │   └── rights.service.js                # Rights workflow & resilience engine
│   └── routes/
│       ├── rights.routes.js                 # /api/v1/rights endpoints
│       └── index.js                         # Route registry
├── app.js                                   # Express application
├── server.js                                # Server bootstrap
├── package.json                             # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. Data-Subject Rights

The module implements privacy workflows allowing users to exercise their data rights.

Supported capabilities include:

* Personal data access
* Data correction
* Data deletion
* Consent management
* Audit trail generation

All operations are persisted and logged for compliance verification.


## 2. Disaster Recovery & Resilience

The service is designed to remain reliable under operational failures.

Key resilience principles include:

* Persistent data storage
* Failure handling
* Safe retries using idempotency
* Database-backed truth
* Operational recovery

## Data is considered complete only after it has been successfully written and verified from persistent storage.

## 3. Operational Drift Monitoring

The engine supports verification mechanisms that help identify:

* Missing persisted data
* Environment drift
* Incomplete workflows
* Failure-path regressions

This ensures the deployed system behaves consistently across development, staging, and production environments.


# Setup & Execution Guide

## 1. Deploy Database Schema

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/029_data_subject_rights_tables.sql
```


## 2. Install Dependencies

```bash
npm install
```


## 3. Start Development Server

```bash
npm run dev
```

# Validation Guide

The study guide emphasizes demonstrating **real, persisted workflows** rather than only successful API responses.

A complete demonstration should verify:

1. Data-subject rights endpoints execute successfully.
2. Data is actually persisted in the database.
3. Failure scenarios are handled correctly.
4. Rights workflows function end-to-end.
5. Recovery behavior is demonstrated using real data.


# Security & Resilience Features

* Data-subject rights workflows
* Privacy-compliant data management
* Idempotent operations
* Persistent database verification
* Disaster recovery readiness
* Failure handling
* Drift monitoring
* Structured audit logging
* Production-ready resilience architecture


# Rights Processing Workflow

```text
Client Request
      │
      ▼
Validate Request
      │
      ▼
Authorize User
      │
      ▼
Execute Rights Flow
      │
      ▼
Persist Database Changes
      │
      ▼
Verify Persistence
      │
      ▼
Record Audit Log
      │
      ▼
Return Response
```

# Resilience Verification Workflow

```text
Incoming Request
        │
        ▼
Execute Business Logic
        │
        ▼
Persist Data
        │
        ▼
Re-read Database
        │
        ▼
Verify State
        │
        ▼
Handle Failures
        │
        ▼
Return Verified Result
```

