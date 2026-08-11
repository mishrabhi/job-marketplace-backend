# Phase 3 Certification & Scale Go-Live v2.0

This module implements the **Phase 3 Certification & Scale Go-Live Engine** for the PlaceMux backend. It compiles and persists the Phase 3 v2.0 certification pack, executes staged canary production cutovers, validates deployment health against defined error-rate thresholds, and automatically rolls back unsafe production releases.

The engine provides the final operational gate before full production rollout.


# Folder Structure

```text
phase3-task25-golive/
├── migrations/
│   └── 057_golive_certification_tables.sql    # Certification & cutover schema
├── src/
│   ├── config/
│   │   ├── db.js                             # Database connection
│   │   ├── env.js                            # Environment configuration
│   │   └── logger.js                         # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                   # Global error handler
│   ├── validators/
│   │   └── golive.validator.js               # Go-live request validation
│   ├── controllers/
│   │   └── golive.controller.js              # Certification & cutover endpoints
│   ├── services/
│   │   └── golive.service.js                 # Go-live orchestration engine
│   └── routes/
│       ├── golive.routes.js                  # /api/v1/golive endpoints
│       └── index.js                          # Route registry
├── app.js                                    # Express application
├── server.js                                 # Server bootstrap
├── package.json                              # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. Phase 3 Certification Pack

The certification engine consolidates the final readiness checks from the Phase 3 platform into a single certification record.

The certification pack validates:

- SLO Status
- Load Test Results
- Security Audit Status
- Compliance Verification
- Disaster Recovery Restore Validation
- FinOps Target Achievement

A certification pack is persisted only when the required readiness checks have been evaluate

## 2. Staged Canary Cutover

Production deployment follows a controlled traffic progression model.

Example stages include:

```text
0% Traffic
    │
    ▼
50% Canary
    │
    ▼
100% Production
```

Each cutover records the configured traffic percentage and simulated/observed error rate.


## 3. Automatic Rollback Protection

The cutover engine continuously evaluates deployment error rates.

The configured safety threshold is:

```text
Maximum Allowed Error Rate: 2.0%
```

If the observed or simulated error rate exceeds the threshold:

- The cutover is marked as rolled back.
- Canary traffic is reset to `0%`.
- The unsafe release is prevented from remaining active.
- The rollback result is persisted for auditing.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/056_golive_certification_tables.sql
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
export BASE=http://localhost:3009/api/v1/golive

export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"

export ADMIN_UUID="6a226759-42b7-47b2-8490-67bc1e09bc48"
```


## Step 1 — Compile & Persist Phase 3 v2.0 Certification Pack

```bash
curl -X POST "$BASE/certification/pack" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"certified_by\": \"$ADMIN_UUID\",
    \"slo_status\": \"PASSED\",
    \"load_test_passed\": true,
    \"security_audit_clear\": true,
    \"compliance_verified\": true,
    \"dr_restore_proven\": true,
    \"finops_target_met\": true,
    \"idempotency_key\": \"cert-pack-v2.0-token-001\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "certification_pack_created": true,
  "version": "v2.0"
}
```

The certification pack confirms that the required Phase 3 readiness checks have passed and persists the certification record for the tenant.


## Step 2 — Execute Canary Cutover at 50% Traffic

```bash
curl -X POST "$BASE/cutover/execute" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"stage_name\": \"PHASED_50_PERCENT\",
    \"canary_traffic_pct\": 50,
    \"simulated_error_rate_pct\": 0.4,
    \"idempotency_key\": \"cutover-stage-50pct-001\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "status": "SUCCESSFUL",
  "canary_traffic_pct": 50,
  "error_rate_pct": 0.4
}
```

The deployment successfully passes the 50% canary stage because the simulated error rate of `0.4%` remains below the `2.0%` rollback threshold.


## Step 3 — Test Automatic Rollback

Simulate an error rate above the production safety threshold.

```bash
curl -X POST "$BASE/cutover/execute" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"stage_name\": \"PHASED_100_PERCENT\",
    \"canary_traffic_pct\": 100,
    \"simulated_error_rate_pct\": 5.5,
    \"idempotency_key\": \"cutover-stage-100pct-002\"
  }"
```

### Expected Result

Returns **HTTP 200 OK** with:

```json
{
  "success": true,
  "status": "ROLLED_BACK",
  "canary_traffic_pct": 0,
  "error_rate_pct": 5.5
}
```

Because the simulated error rate of `5.5%` exceeds the configured `2.0%` safety threshold, the deployment is automatically rolled back and active canary traffic is reset to `0%`.


# Go-Live Safety Features

- Phase 3 v2.0 Certification
- SLO Readiness Validation
- Load Test Verification
- Security Audit Verification
- Compliance Verification
- Disaster Recovery Validation
- FinOps Target Verification
- Staged Canary Deployment
- Error Rate Monitoring
- Automatic Rollback Protection
- Idempotent Cutover Operations
- Persistent Certification & Deployment Audit Logs

# Certification Workflow

```text
Phase 3 Readiness Checks
          │
          ▼
      SLO Passed
          │
          ▼
    Load Test Passed
          │
          ▼
  Security Audit Clear
          │
          ▼
 Compliance Verified
          │
          ▼
 DR Restore Proven
          │
          ▼
 FinOps Target Met
          │
          ▼
Certification Pack
     Persisted
```

# Canary Deployment Workflow

```text
Certification Approved
          │
          ▼
       0% Traffic
          │
          ▼
     50% Canary
          │
          ▼
   Monitor Error Rate
          │
     ┌────┴────┐
     │         │
   < 2.0%    > 2.0%
     │         │
     ▼         ▼
 Continue    Rollback
     │         │
     ▼         ▼
 100% Traffic 0% Traffic
```


# Automatic Rollback Workflow

```text
Production Cutover
        │
        ▼
Measure Error Rate
        │
        ▼
Compare Against 2.0%
        │
   ┌────┴────┐
   │         │
   ▼         ▼
Within      Above
Threshold   Threshold
   │         │
   ▼         ▼
Continue   Rollback
             │
             ▼
       Reset Traffic
          to 0%
             │
             ▼
       Persist Result
```

# Go-Live Decision Matrix

| Check | Required Status |
|---|---|
| SLO | `PASSED` |
| Load Testing | `PASSED` |
| Security Audit | `CLEAR` |
| Compliance | `VERIFIED` |
| DR Restore | `PROVEN` |
| FinOps Target | `MET` |
| Canary Error Rate | `< 2.0%` |
| Rollback Trigger | `> 2.0%` |
