# Portal Scaffold & Reporting API Foundations 

This module establishes the **College Portal Foundation** for the PlaceMux backend. It introduces tenant-aware reporting APIs, institutional administrator access controls, and secure data isolation mechanisms to ensure that college-specific analytics remain visible only to authorized users.

The reporting engine enforces strict tenant boundaries, preventing cross-college data exposure while providing administrators with accurate institutional metrics.


# Folder Structure

```text
task16-college-portal/
├── migrations/
│   └── 023_college_portal_tables.sql      # College portal & reporting schema
├── src/
│   ├── config/
│   │   ├── db.js                          # Database connection
│   │   ├── env.js                         # Environment configuration
│   │   └── logger.js                      # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                # Global error handler
│   ├── validators/
│   │   └── college.validator.js           # Request validation schemas
│   ├── controllers/
│   │   └── college.controller.js          # College reporting endpoints
│   ├── services/
│   │   └── college.service.js             # Reporting & authorization engine
│   └── routes/
│       ├── college.routes.js              # /api/v1/colleges endpoints
│       └── index.js                       # Route registry
├── app.js                                 # Express application
├── server.js                              # Server bootstrap
├── package.json                           # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Multi-Tenant College Portal

The system is designed using a **tenant-aware architecture**, where every college operates as an isolated tenant.

Each request is validated against:

* College ID
* Requesting User ID
* User-to-College mapping
* Access permissions

Only users associated with a specific institution can access its reports.


## 2. Secure Reporting Engine

The reporting service aggregates institution-specific data directly from persistent database tables.

Available analytics may include:

* Total student registrations
* Active applications
* Placement statistics
* Offer generation metrics
* Interview activity
* Hiring summaries

All reports are generated within the requesting tenant's scope.

## 3. Cross-Tenant Access Protection

Before generating any report, the authorization layer validates whether the requesting user belongs to the target college.

Workflow:

```text
Incoming Request
        │
        ▼
Validate User Identity
        │
        ▼
Verify College Membership
        │
        ▼
Authorized?
        │
   ┌────┴────┐
   │         │
  Yes        No
   │         │
   ▼         ▼
Generate   Return
Report     Access Denied
```

This ensures complete tenant isolation and prevents unauthorized access to institutional data.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/023_college_portal_tables.sql
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

export COLLEGE_A_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
export OFFICER_A_UUID="2a226759-42b7-47b2-8490-67bc1e09bc33"
export FRAUD_OFFICER_UUID="9fffffff-ffff-ffff-ffff-ffffffffffff"
```


## Step 1 — Retrieve Authorized College Report

```bash
curl -X GET "$BASE/colleges/portal-report?college_id=$COLLEGE_A_UUID&requesting_user_id=$OFFICER_A_UUID"
```

### Expected Result

Returns **HTTP 200 OK** with institution-specific analytics.

Example:

```json
{
  "success": true,
  "college_id": "<college-id>",
  "report": {
    "total_students": 450,
    "applications": 218,
    "interviews": 96,
    "offers_generated": 41,
    "placements": 33
  }
}
```

The returned metrics are generated exclusively from records belonging to the requested college.


## Step 2 — Verify Cross-Tenant Protection

Simulate an unauthorized access attempt using a user who is not associated with the requested college.

```bash
curl -X GET "$BASE/colleges/portal-report?college_id=$COLLEGE_A_UUID&requesting_user_id=$FRAUD_OFFICER_UUID"
```

### Expected Result

Returns **HTTP 403 Forbidden**.

Example:

```json
{
  "success": false,
  "error": "UNAUTHORIZED_COLLEGE_ACCESS"
}
```

The authorization layer blocks the request, preventing any cross-tenant data exposure.


# Security Features

* Multi-tenant architecture
* Tenant-aware reporting APIs
* College-level data isolation
* Role-based authorization
* Cross-tenant access prevention
* Secure analytics generation
* Structured audit logging
* Persistent reporting infrastructure


# Reporting Workflow

```text
Report Request
        │
        ▼
Validate Request
        │
        ▼
Authenticate User
        │
        ▼
Verify College Mapping
        │
        ▼
Retrieve College Metrics
        │
        ▼
Generate Report
        │
        ▼
Return Response
```


# Authorization Workflow

```text
Incoming Request
        │
        ▼
Read College ID
        │
        ▼
Read Requesting User
        │
        ▼
Verify User Belongs to College
        │
        ├──────────────► Authorized
        │                  │
        │                  ▼
        │          Generate Report
        │
        ▼
Unauthorized
        │
        ▼
Return 403 Forbidden
```

