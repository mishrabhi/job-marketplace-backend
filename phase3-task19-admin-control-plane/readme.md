# White-Label Configurability & Admin Control Plane 

This module implements the **White-Label Configurability & Admin Control Plane** for the PlaceMux backend. It enables enterprise tenants to customize platform branding and operational settings while enforcing strict validation guardrails, maintaining immutable audit logs, and supporting configuration rollback through snapshot restoration.

The platform ensures all administrative configuration changes are validated, versioned, auditable, and reversible.


# Folder Structure

```text
phase3-task19-admin-control-plane/
├── migrations/
│   └── 050_admin_control_plane_tables.sql      # Tenant configuration & audit schema
├── src/
│   ├── config/
│   │   ├── db.js                               # Database connection
│   │   ├── env.js                              # Environment configuration
│   │   └── logger.js                           # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                     # Global error handler
│   ├── validators/
│   │   └── config.validator.js            # Request validation schemas
│   ├── controllers/
│   │   └── config.controller.js           # Admin configuration endpoints
│   ├── services/
│   │   └── config.service.js              # White-label configuration engine
│   └── routes/
│       ├── config.routes.js               # /api/v1/admin endpoints
│       └── index.js                            # Route registry
├── app.js                                      # Express application
├── server.js                                   # Server bootstrap
├── package.json                                # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. White-Label Configuration

Enterprise administrators can customize platform appearance and operational settings.

Supported configuration includes:

- Primary Brand Color
- Company Logo
- Platform Limits
- Rate Limits
- Tenant Branding
- Operational Parameters

Each configuration change is validated before being applied.

## 2. Configuration Guardrails

Every update passes through strict validation rules to prevent invalid or unsafe configuration values.

Validation includes:

- Valid HEX color codes
- Valid URL format
- Operational limit boundaries
- Numeric constraint validation
- Required field verification

Invalid requests are rejected before modifying any tenant settings.

## 3. Audited Configuration Changes

Every successful configuration update creates an immutable audit record containing:

- Previous Configuration Snapshot
- Updated Configuration Snapshot
- Administrator Information
- Change Reason
- Timestamp

This provides a complete history of tenant configuration changes.


## 4. Snapshot Rollback

Administrators can restore a previous configuration using any historical audit snapshot.

Rollback operations:

- Restore previous settings
- Record rollback event
- Preserve audit history
- Support idempotent rollback requests

# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/050_admin_control_plane_tables.sql
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

export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"

export ADMIN_UUID="6a226759-42b7-47b2-8490-67bc1e09bc48"
```


## Step 1 — Apply a Valid Tenant Configuration

```bash
curl -X POST "$BASE/admin/config" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"admin_user_id\": \"$ADMIN_UUID\",
    \"primary_color_hex\": \"#2563EB\",
    \"company_logo_url\": \"https://enterprise.com/assets/logo.png\",
    \"max_concurrent_jobs\": 100,
    \"rate_limit_per_min\": 600,
    \"reason_notes\": \"Updating tenant branding and operational capacity limits.\",
    \"idempotency_key\": \"admin-cfg-change-101\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "configuration_updated": true,
  "audit_log_created": true
}
```

The configuration is successfully applied and an audit record is created containing both the previous and updated configuration snapshots.


## Step 2 — Verify Configuration Guardrails

Attempt to submit invalid configuration values.

```bash
curl -X POST "$BASE/admin/config" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"admin_user_id\": \"$ADMIN_UUID\",
    \"primary_color_hex\": \"INVALID_COLOR\",
    \"company_logo_url\": \"https://enterprise.com/assets/logo.png\",
    \"max_concurrent_jobs\": 100,
    \"rate_limit_per_min\": 999999,
    \"reason_notes\": \"Attempting bad config\",
    \"idempotency_key\": \"admin-cfg-change-102\"
  }"
```

### Expected Result

Returns **HTTP 400 Bad Request**.

Example response:

```json
{
  "success": false,
  "error": "VALIDATION_FAILED",
  "message": "Configuration contains invalid values."
}
```

The request is rejected because the configuration violates validation guardrails, preventing unsafe changes from being persisted.


## Step 3 — Roll Back Configuration

Restore a previous configuration snapshot.

```bash
curl -X POST "$BASE/admin/config/rollback" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"admin_user_id\": \"$ADMIN_UUID\",
    \"target_audit_log_id\": \"<INSERT_AUDIT_LOG_ID_FROM_STEP_1>\",
    \"reason_notes\": \"Reverting branding changes to baseline settings.\",
    \"idempotency_key\": \"admin-rollback-token-201\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "status": "ROLLBACK_SUCCESSFUL"
}
```

The tenant configuration is restored from the selected audit snapshot, and the rollback action is recorded in the audit history.


# Admin Control Features

- White-Label Branding Configuration
- Tenant Configuration Management
- Input Validation Guardrails
- Immutable Audit Logging
- Configuration Snapshot Versioning
- One-Click Rollback
- Administrator Authorization
- Idempotent Configuration Updates
- Production-ready Enterprise Admin Control Plane


# Configuration Update Workflow

```text
Admin Request
      │
      ▼
Validate Input
      │
      ▼
Apply Guardrails
      │
      ▼
Capture Previous Snapshot
      │
      ▼
Persist New Configuration
      │
      ▼
Create Audit Record
      │
      ▼
Return Success
```


# Rollback Workflow

```text
Rollback Request
        │
        ▼
Locate Audit Snapshot
        │
        ▼
Restore Configuration
        │
        ▼
Persist Updated Settings
        │
        ▼
Create Rollback Audit
        │
        ▼
Return Success
```


# Audit Logging Workflow

```text
Configuration Change
         │
         ▼
Capture Previous State
         │
         ▼
Capture New State
         │
         ▼
Store Audit Record
         │
         ▼
Enable Future Rollback
```
