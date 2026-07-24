# Growth Integration & Experiment Readout Engine

This module implements the **Growth Integration & Experiment Readout Engine** for the PlaceMux backend. It provides end-to-end experiment analytics by linking feature flag exposures with conversion outcomes, generating experiment performance reports, detecting **Sample Ratio Mismatch (SRM)**, and automatically cleaning up obsolete feature flags.

The platform enables engineering and product teams to evaluate experiments confidently while reducing technical debt through automated feature flag lifecycle management.


# Folder Structure

```text
phase3-task10-growth-analytics/
├── migrations/
│   └── 041_growth_analytics_tables.sql      # Growth analytics & experiment schema
├── src/
│   ├── config/
│   │   ├── db.js                            # Database connection
│   │   ├── env.js                           # Environment configuration
│   │   └── logger.js                        # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                  # Global error handler
│   ├── validators/
│   │   └── growthAnalytics.validator.js     # Request validation schemas
│   ├── controllers/
│   │   └── growthAnalytics.controller.js    # Growth analytics endpoints
│   ├── services/
│   │   └── growthAnalytics.service.js       # Experiment readout engine
│   └── routes/
│       ├── growthAnalytics.routes.js        # /api/v1/growth-analytics endpoints
│       └── index.js                         # Route registry
├── app.js                                   # Express application
├── server.js                                # Server bootstrap
├── package.json                             # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Conversion Outcome Tracking

The platform records user conversion events after feature exposure.

Each outcome captures:

- Feature Flag
- Assigned Variant
- User ID
- Tenant ID
- Outcome Event
- Timestamp

This creates a complete relationship between experimentation and business outcomes.


## 2. Experiment Readout

The analytics engine generates experiment performance summaries.

Each report includes:

- Variant Exposure Counts
- Conversion Counts
- Conversion Rate
- Statistical Summary
- Sample Ratio Mismatch (SRM) Status

These metrics help determine experiment performance and validity.


## 3. Zombie Flag Cleanup

To reduce technical debt, expired or abandoned feature flags are automatically detected and removed.

Cleanup operations include:

- Flag Removal
- Audit Log Creation
- Cleanup Timestamp
- Administrator Details

This keeps the experimentation platform clean and maintainable.

# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/041_growth_analytics_tables.sql
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
export BASE=http://localhost:3009/api/v1

export USER_UUID="4b111d42-ab12-4211-8224-2da21e48bc02"
export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
export ADMIN_UUID="6a226759-42b7-47b2-8490-67bc1e09bc48"
```


## Step 1 — Record a Conversion Outcome

```bash
curl -X POST "$BASE/growth-analytics/outcomes" \
  -H "Content-Type: application/json" \
  -d "{
    \"flag_key\": \"RECOMMENDATION_ENGINE_V2\",
    \"user_id\": \"$USER_UUID\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"assigned_variant\": \"treatment_a\",
    \"outcome_event_type\": \"APPLICATION_COMPLETED\",
    \"idempotency_key\": \"outcome-token-001\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "conversion_recorded": true
}
```

The conversion event is linked to the corresponding feature flag and assigned experiment variant.


## Step 2 — Generate Experiment Readout

```bash
curl -X GET "$BASE/growth-analytics/readout?flag_key=RECOMMENDATION_ENGINE_V2&tenant_id=$TENANT_UUID"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "variant_exposures": {
    "control": 120,
    "treatment_a": 118,
    "treatment_b": 121
  },
  "conversion_rates": {
    "control": 18.5,
    "treatment_a": 24.3,
    "treatment_b": 20.1
  },
  "srm_status": "PASSED"
}
```

The report provides experiment metrics including exposure counts, conversion rates, and Sample Ratio Mismatch (SRM) validation.


## Step 3 — Execute Zombie Flag Cleanup

```bash
curl -X POST "$BASE/growth-analytics/cleanup-zombies" \
  -H "Content-Type: application/json" \
  -d "{
    \"performed_by\": \"$ADMIN_UUID\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "zombie_flags_removed": 4,
  "audit_log_created": true
}
```

Expired or abandoned feature flags are removed, and an audit record is written to the cleanup log.


# Growth Analytics Features

- Feature Exposure Tracking
- Conversion Outcome Recording
- Experiment Readout Dashboard
- Sample Ratio Mismatch (SRM) Detection
- Variant Performance Metrics
- Zombie Feature Flag Cleanup
- Audit Trail Generation
- Persistent Experiment Analytics
- Production-ready Experimentation Platform


# Experiment Tracking Workflow

```text
User Exposure
      │
      ▼
Assign Variant
      │
      ▼
Record Exposure
      │
      ▼
Capture Conversion
      │
      ▼
Persist Analytics
```


# Experiment Readout Workflow

```text
Exposure Data
      │
      ▼
Join Conversion Events
      │
      ▼
Calculate Metrics
      │
      ▼
Run SRM Validation
      │
      ▼
Generate Readout
```


#  Zombie Flag Cleanup Workflow

```text
Scheduled Cleanup
        │
        ▼
Identify Expired Flags
        │
        ▼
Remove Obsolete Flags
        │
        ▼
Generate Audit Log
        │
        ▼
Return Cleanup Summary
```