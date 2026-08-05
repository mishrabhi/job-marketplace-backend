# Security Hardening, Threat Model & Pen-Test Remediation Engine

This module implements the **Security Hardening, Threat Model & Pen-Test Remediation Engine** for the PlaceMux backend. It provides comprehensive application security through STRIDE threat modeling, IDOR (Insecure Direct Object Reference) protection, supply-chain dependency auditing, and penetration testing validation.

The platform continuously identifies security risks, validates defensive controls, and blocks vulnerable deployments before they reach production.


# Folder Structure

```text
phase3-task22-security-hardening/
├── migrations/
│   └── 053_security_hardening_tables.sql      # Threat model & security audit schema
├── src/
│   ├── config/
│   │   ├── db.js                             # Database connection
│   │   ├── env.js                            # Environment configuration
│   │   └── logger.js                         # Structured logging
│   ├── middlewares/
│   │   ├── auth.js                           # Authentication middleware
│   │   ├── tenantGuard.js                    # Tenant isolation middleware
│   │   └── errorHandler.js                   # Global error handler
│   ├── validators/
│   │   └── security.validator.js             # Request validation schemas
│   ├── controllers/
│   │   └── security.controller.js            # Security endpoints
│   ├── services/
│   │   └── security.service.js               # Threat modeling & security engine
│   └── routes/
│       ├── security.routes.js                # /api/v1/security endpoints
│       └── index.js                          # Route registry
├── app.js                                    # Express application
├── server.js                                 # Server bootstrap
├── package.json                              # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. STRIDE Threat Modeling

The engine enables structured identification and tracking of application threats using the STRIDE security model.

Supported categories include:

- Spoofing
- Tampering
- Repudiation
- Information Disclosure
- Denial of Service
- Elevation of Privilege

Each threat is recorded with mitigation details and audit metadata.

## 2. IDOR Protection

The platform defends against **Insecure Direct Object Reference (IDOR)** attacks through strict tenant-aware authorization.

Every resource request validates:

- Authenticated Tenant
- Resource Ownership
- Database-Level Tenant Constraints
- Access Permissions

Unauthorized cross-tenant access is automatically blocked.


## 3. Supply-Chain Security

The engine scans project dependencies for known vulnerabilities.

Security checks include:

- Vulnerable Package Detection
- CVE Matching
- Severity Classification
- Build Blocking
- Audit Logging

Applications containing critical vulnerabilities can be prevented from deployment.

# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/053_security_hardening_tables.sql
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
export BASE=http://localhost:3009/api/v1/security

export TENANT_A="a1b23c44-dd55-66ee-77ff-88aa99bb0011"

export TENANT_B="9fffffff-ffff-ffff-ffff-ffffffffffff"

export RESOURCE_UUID="8a329d41-cc21-4112-9114-1da21e48bc01"
```


## Step 1 — Record a STRIDE Threat

```bash
curl -X POST "$BASE/stride/threats" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_A\",
    \"surface_name\": \"CANDIDATE_DOSSIERS_API\",
    \"stride_category\": \"ELEVATION_OF_PRIVILEGE\",
    \"vulnerability_title\": \"Insecure Direct Object Reference on Candidate Dossier Retrieval\",
    \"severity\": \"HIGH\",
    \"mitigation_details\": \"Enforced mandatory tenant_id equality check in database query layer.\",
    \"idempotency_key\": \"stride-threat-token-001\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "threat_registered": true,
  "status": "MITIGATION_RECORDED"
}
```

The STRIDE threat is successfully documented along with its mitigation strategy.


## Step 2 — Execute an IDOR Defense Validation

Simulate an unauthorized cross-tenant resource access attempt.

```bash
curl -X POST "$BASE/pen-test/idor-check" \
  -H "Content-Type: application/json" \
  -d "{
    \"requesting_tenant_id\": \"$TENANT_A\",
    \"target_resource_id\": \"$RESOURCE_UUID\",
    \"resource_owner_tenant_id\": \"$TENANT_B\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "idor_blocked_by_database": true,
  "security_verdict": "BLOCKED_DEFENSE_SUCCESSFUL"
}
```

The platform confirms that tenant-aware authorization prevents unauthorized access to resources owned by another tenant.


## Step 3 — Execute a Supply-Chain Dependency Scan

```bash
curl -X POST "$BASE/supply-chain/scan" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_A\",
    \"package_manifest\": [
      {
        \"package_name\": \"express\",
        \"installed_version\": \"4.18.2\"
      },
      {
        \"package_name\": \"lodash\",
        \"installed_version\": \"4.17.15\"
      }
    ]
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "vulnerabilities_detected": [
    {
      "package": "lodash",
      "version": "4.17.15",
      "cve": "CVE-2021-23337",
      "severity": "HIGH"
    }
  ],
  "build_blocked": true
}
```

The engine detects vulnerable dependencies, records the findings, and prevents deployment until the issues are resolved.


# Security Features

- STRIDE Threat Modeling
- IDOR Attack Protection
- Tenant-Level Authorization
- Database-Level Access Enforcement
- Supply-Chain Dependency Scanning
- CVE Detection
- Build Blocking for Vulnerable Packages
- Structured Security Audit Logging
- Production-ready Security Hardening Platform


# STRIDE Threat Workflow

```text
Threat Discovery
       │
       ▼
Classify STRIDE Category
       │
       ▼
Assign Severity
       │
       ▼
Record Mitigation
       │
       ▼
Persist Security Audit
```

# IDOR Protection Workflow

```text
Incoming Request
        │
        ▼
Authenticate User
        │
        ▼
Validate Tenant
        │
        ▼
Verify Resource Ownership
        │
        ▼
Allow or Block Access
        │
        ▼
Record Security Event
```

# Supply-Chain Security Workflow

```text
Dependency Manifest
         │
         ▼
Scan Installed Packages
         │
         ▼
Match Known CVEs
         │
         ▼
Calculate Risk Level
         │
         ▼
Generate Security Report
         │
         ▼
Block Deployment (If Required)
```