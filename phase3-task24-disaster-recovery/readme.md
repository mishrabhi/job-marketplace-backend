# Disaster Recovery, Chaos Testing & Business Continuity Engine 

This module implements the **Disaster Recovery, Chaos Testing & Business Continuity Engine** for the PlaceMux backend. It provides database backup snapshot tracking, automated restore drill verification, RTO/RPO measurement, chaos simulation telemetry, and overall disaster recovery readiness reporting.

The engine enables the platform to validate that critical data can be restored reliably and that infrastructure failure scenarios can recover within defined operational targets.


# Folder Structure

```text
phase3-task24-disaster-recovery/
├── migrations/
│   └── 056_disaster_recovery_tables.sql       # Backup, restore & chaos schema
├── src/
│   ├── config/
│   │   ├── db.js                             # Database connection
│   │   ├── env.js                            # Environment configuration
│   │   └── logger.js                         # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                   # Global error handler
│   ├── validators/
│   │   └── dr.validator.js                   # Disaster recovery validation schemas
│   ├── controllers/
│   │   └── dr.controller.js                  # Disaster recovery endpoints
│   ├── services/
│   │   └── dr.service.js                     # Backup, restore & chaos engine
│   └── routes/
│       ├── dr.routes.js                      # /api/v1/dr endpoints
│       └── index.js                          # Route registry
├── app.js                                    # Express application
├── server.js                                 # Server bootstrap
├── package.json                              # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. Database Backup Snapshots

The platform maintains a persistent registry of database backup snapshots.

Each snapshot records:

- Tenant ID
- Snapshot Identifier
- Snapshot Type
- Storage Location
- Snapshot Size
- SHA-256 Verification Checksum
- Creation Metadata

The checksum provides an integrity verification mechanism for stored backups.

## 2. Disaster Recovery Restore Drills

Restore drills validate whether stored backups can be successfully restored into an isolated disaster recovery environment.

Each drill measures:

- Restore Success
- Recovery Time Objective (RTO)
- Recovery Point Objective (RPO)
- Target Environment
- Executing Administrator
- Drill Result

Restore operations are idempotent to prevent duplicate drill executions.

## 3. Chaos Testing

The chaos engine records controlled infrastructure failure simulations.

Supported scenarios can include:

- Database Failover
- Component Degradation
- Replica Promotion
- Recovery Testing

Each simulation records the degraded component, fallback mechanism, and measured recovery time.


## 4. DR Readiness Dashboard

The readiness endpoint aggregates disaster recovery metrics into a single operational summary.

Metrics include:

- Successful Restore Rate
- RTO Compliance
- RPO Compliance
- Chaos Test Results
- Recovery Performance
- Overall DR Readiness

# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/055_disaster_recovery_tables.sql
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
export BASE=http://localhost:3009/api/v1/dr

export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"

export ADMIN_UUID="6a226759-42b7-47b2-8490-67bc1e09bc48"
```

## Step 1 — Register a Database Backup Snapshot

```bash
curl -X POST "$BASE/snapshots" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"snapshot_identifier\": \"snap_full_20260811_001\",
    \"snapshot_type\": \"FULL\",
    \"storage_location\": \"s3://placemux-backups-cold/snap_full_20260811_001.sql.gz\",
    \"size_bytes\": 524288000
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "snapshot_created": true,
  "verification_checksum": "a8c91f2d..."
}
```

The snapshot record is persisted along with a generated SHA-256 verification checksum.

## Step 2 — Execute a DR Restore Drill

Use the snapshot UUID returned from Step 1.

```bash
curl -X POST "$BASE/restore-drills" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"snapshot_id\": \"<INSERT_SNAPSHOT_UUID_FROM_STEP_1>\",
    \"target_environment\": \"dr_sandbox_env\",
    \"executed_by\": \"$ADMIN_UUID\",
    \"idempotency_key\": \"dr-restore-token-001\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "restore_status": "SUCCESSFUL",
  "rto_ms": 3820,
  "rpo_seconds": 30,
  "rto_sla_compliant": true,
  "rpo_sla_compliant": true
}
```

The restore drill confirms that the snapshot can be restored successfully and records measured RTO/RPO values.


## Step 3 — Log a Chaos Simulation Event

```bash
curl -X POST "$BASE/chaos/simulate" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"scenario_type\": \"DB_FAILOVER\",
    \"degraded_component\": \"PRIMARY_POSTGRES_DB\",
    \"fallback_engaged\": \"READ_REPLICA_AUTO_PROMOTION\",
    \"recovery_time_ms\": 1450,
    \"idempotency_key\": \"chaos-sim-token-001\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "chaos_event_recorded": true,
  "recovery_time_ms": 1450
}
```

The simulated database failure and recovery event is persisted for disaster recovery analysis.


## Step 4 — Query DR Readiness Summary

```bash
curl -X GET "$BASE/summary?tenant_id=$TENANT_UUID"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "restore_success_rate_percent": 100,
  "chaos_tests_passed": 1,
  "rto_sla_compliant": true,
  "rpo_sla_compliant": true,
  "dr_ready": true
}
```

The summary provides an aggregated view of the tenant's disaster recovery readiness.

# Disaster Recovery Features

- Database Backup Snapshot Registry
- SHA-256 Backup Integrity Verification
- Automated Restore Drills
- RTO Measurement
- RPO Measurement
- RTO/RPO SLA Validation
- Controlled Chaos Testing
- Database Failover Simulation
- Recovery Telemetry
- DR Readiness Reporting
- Idempotent Recovery Operations
- Structured Disaster Recovery Audit Logging


# Backup & Verification Workflow

```text
Database Backup
       │
       ▼
Register Snapshot
       │
       ▼
Calculate SHA-256 Checksum
       │
       ▼
Persist Snapshot Metadata
       │
       ▼
Verify Backup Integrity
```

# Restore Drill Workflow

```text
Select Backup Snapshot
        │
        ▼
Validate Snapshot
        │
        ▼
Restore to DR Environment
        │
        ▼
Measure Recovery Time
        │
        ▼
Calculate RTO / RPO
        │
        ▼
Validate SLA Compliance
        │
        ▼
Persist Drill Results
```

# Chaos Testing Workflow

```text
Define Failure Scenario
        │
        ▼
Identify Degraded Component
        │
        ▼
Inject / Simulate Failure
        │
        ▼
Engage Fallback Mechanism
        │
        ▼
Measure Recovery Time
        │
        ▼
Persist Chaos Telemetry
```

# DR Readiness Workflow

```text
Backup Health
      │
      ├────────────► Restore Success Rate
      │
      ├────────────► RTO Compliance
      │
      ├────────────► RPO Compliance
      │
      └────────────► Chaos Test Results
                     │
                     ▼
              Aggregate Metrics
                     │
                     ▼
             DR Readiness Status
```
