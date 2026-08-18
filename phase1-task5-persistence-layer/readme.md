# Persistence Layer & Transactional Operations

This module establishes a safe and reliable persistence layer for PlaceMux, focusing on transactional database operations, connection pooling, parameterized queries, and database error translation.

The task ensures that multi-step database operations either complete successfully as a single atomic unit or roll back completely when an operation fails.

# Core Architecture

The Persistence Layer focuses on four primary responsibilities:

- **Connection Pooling** — Manages reusable database connections for efficient and reliable database access.
- **Transactional Operations** — Groups multiple database mutations into atomic transactions.
- **Parameterized Queries** — Protects database operations by using parameterized queries instead of unsafe string interpolation.
- **Database Error Translation** — Converts low-level database failures into structured application-level errors.

```text
API Request
     │
     ▼
Controller
     │
     ▼
Persistence Service
     │
     ▼
Connection Pool
     │
     ▼
Database Transaction
     │
     ├── Create Parent Record
     ├── Create Child Records
     └── Create Audit Record
            │
            ▼
       Commit / Rollback
```

# Transaction Integrity Principles

## Atomic Transactions

Multi-step operations are executed within a single database transaction.

For example, creating a placement drive requires:

```text
Placement Drive
      │
      ├── Placement Roles
      │
      └── Audit Log
```

All related records must be committed together.

If any operation fails, the entire transaction is rolled back.

## Connection Pooling

The persistence layer uses a connection pool to efficiently manage database connections.

The pool provides:

- Active connection tracking
- Idle connection tracking
- Connection reuse
- Better resource utilization
- Improved concurrent request handling

## Parameterized Queries

Database queries use parameterized values rather than dynamically constructed SQL statements.

This improves:

- SQL injection protection
- Query safety
- Data consistency
- Database reliability

## Database Error Translation

Low-level database errors are translated into application-level responses so that API consumers receive predictable HTTP status codes and error messages.

# Verification Guide

## Step 1 — Check DB Pool Health & Metrics

```bash
curl -X GET "http://localhost:3000/health"
```

### Expected Result

Returns **HTTP 200 OK**.

The health endpoint returns database pool information, including active and idle connection metrics.

Example:

```json
{
  "status": "healthy",
  "pool": {
    "active_connections": 2,
    "idle_connections": 5
  }
}
```

# Step 2 — Create Placement Drive

Create a placement drive containing multiple child roles.

```bash
curl -X POST "http://localhost:3000/api/v1/drives" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Google India",
    "drive_title": "Campus Recruitment 2026",
    "min_gpa": 8.0,
    "roles": [
      {
        "role_title": "Software Engineer (Backend)",
        "openings_count": 15,
        "ctc_lpa": 24.5
      },
      {
        "role_title": "Site Reliability Engineer",
        "openings_count": 5,
        "ctc_lpa": 22.0
      }
    ]
  }'
```

### Expected Result

Returns **HTTP 201 Created**.

The operation creates the placement drive, its child roles, and the corresponding audit log atomically.

```text
Transaction Started
       │
       ▼
Create Placement Drive
       │
       ▼
Create Backend Engineer Role
       │
       ▼
Create SRE Role
       │
       ▼
Create Audit Log
       │
       ▼
Transaction Commit
```

# Step 3 — Verify Transaction Rollback

Send an invalid role payload containing a negative `openings_count`.

```bash
curl -X POST "http://localhost:3000/api/v1/drives" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Microsoft",
    "drive_title": "Failing Transaction Test",
    "min_gpa": 7.5,
    "roles": [
      {
        "role_title": "Valid Role",
        "openings_count": 5,
        "ctc_lpa": 20.0
      },
      {
        "role_title": "Invalid Role",
        "openings_count": -5,
        "ctc_lpa": 20.0
      }
    ]
  }'
```

### Expected Result

Returns **HTTP 400 Bad Request**.

The invalid role causes the entire transaction to roll back.

The valid role must not remain in the database as an orphaned record.

```text
Transaction Started
       │
       ▼
Create Placement Drive
       │
       ▼
Create Valid Role
       │
       ▼
Invalid Role Detected
       │
       ▼
Transaction Rollback
       │
       ├── Drive Removed
       ├── Valid Role Removed
       └── No Partial Audit Record
```

# Step 4 — Update Status & Delete Drive

Update the status of an existing placement drive:

```bash
curl -X PATCH "http://localhost:3000/api/v1/drives/<DRIVE_UUID>/status" \
  -H "Content-Type: application/json" \
  -d '{
    "drive_status": "ACTIVE"
  }'
```

Then delete the drive:

```bash
curl -X DELETE "http://localhost:3000/api/v1/drives/<DRIVE_UUID>"
```

### Expected Result

The PATCH operation updates the placement drive status safely, while the DELETE operation removes the requested drive according to the configured persistence and relational constraints.

# Transaction Workflow

```text
Client Request
      │
      ▼
Validate Payload
      │
      ▼
Acquire Database Connection
      │
      ▼
Begin Transaction
      │
      ├── Parent Record
      │
      ├── Child Records
      │
      └── Audit Record
             │
             ▼
       Validate Operations
             │
        ┌────┴────┐
        │         │
     Success    Failure
        │         │
        ▼         ▼
     COMMIT    ROLLBACK
        │         │
        ▼         ▼
   Return 201   Return 400
```

# Persistence API Endpoints

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `GET` | `/health` | Check database pool health and connection metrics |
| `POST` | `/api/v1/drives` | Create a placement drive and related roles atomically |
| `PATCH` | `/api/v1/drives/:id/status` | Update placement drive status |
| `DELETE` | `/api/v1/drives/:id` | Delete a placement drive |

# Placement Drive Fields

| Field | Purpose |
| ----- | ------- |
| `company_name` | Company conducting the placement drive |
| `drive_title` | Name/title of the placement drive |
| `min_gpa` | Minimum GPA eligibility requirement |
| `roles` | Collection of roles associated with the drive |
| `role_title` | Position title |
| `openings_count` | Number of available positions |
| `ctc_lpa` | Compensation package in LPA |
| `drive_status` | Current lifecycle status of the placement drive |