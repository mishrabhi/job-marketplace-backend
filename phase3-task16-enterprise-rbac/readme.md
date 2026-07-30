# Enterprise Multi-Tenancy & RBAC Engine

This module implements the **Enterprise Multi-Tenancy & Role-Based Access Control (RBAC) Engine** for the PlaceMux backend. It enforces strict tenant-scoped data isolation, role-permission authorization, and cross-tenant security validation to ensure that organizations can securely operate on a shared platform without any risk of data leakage.

The platform guarantees that every request is validated against tenant boundaries and assigned permissions before granting access to protected resources.


# Folder Structure

```text
phase3-task16-enterprise-rbac/
├── migrations/
│   └── 047_enterprise_rbac_tables.sql        # Tenant, RBAC & dossier schema
├── src/
│   ├── config/
│   │   ├── db.js                            # Database connection
│   │   ├── env.js                           # Environment configuration
│   │   └── logger.js                        # Structured logging
│   ├── middlewares/           
│   │   ├── rbacAuth.js                      # Permission enforcement middleware
│   │   └── errorHandler.js                  # Global error handler
│   ├── validators/
│   │   └── rbac.validator.js          # Request validation schemas
│   ├── controllers/
│   │   └── rbac.controller.js         # Enterprise endpoints
│   ├── services/
│   │   └── rbac.service.js            # RBAC & tenant isolation engine
│   └── routes/
│       ├── rbac.routes.js             # /api/v1/enterprise endpoints
│       └── index.js                         # Route registry
├── app.js                                   # Express application
├── server.js                                # Server bootstrap
├── package.json                             # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Multi-Tenant Isolation

Every resource in the system belongs to a specific tenant.

Each incoming request is validated against:

- Tenant ID
- Authenticated User
- Resource Ownership
- Tenant Context

This ensures complete isolation between organizations.


## 2. Role-Based Access Control (RBAC)

Every authenticated user is assigned one or more roles.

Each role contains a predefined permission set, such as:

- DOSSIERS_READ
- DOSSIERS_WRITE
- APPLICATIONS_READ
- APPLICATIONS_WRITE
- ADMIN_ACCESS

Every request is authorized before accessing protected resources.

## 3. Cross-Tenant Security Validation

The platform includes automated validation routines that simulate unauthorized cross-tenant access attempts.

These tests verify:

- No cross-tenant records are exposed
- Authorization policies are enforced
- Tenant boundaries remain intact


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/047_enterprise_rbac_tables.sql
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

export TENANT_A="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
export TENANT_B="9fffffff-ffff-ffff-ffff-ffffffffffff"

export USER_A="6a226759-42b7-47b2-8490-67bc1e09bc48"

export CANDIDATE_UUID="4b111d42-ab12-4211-8224-2da21e48bc02"
```


## Step 1 — Create Roles & Assign Permissions

Ensure the required role exists.

```sql
INSERT INTO rbac_roles (role_name, permissions)
VALUES (
    'RECRUITER',
    '["DOSSIERS_READ", "DOSSIERS_WRITE"]'
)
ON CONFLICT DO NOTHING;
```

Assign the role to the recruiter.

```bash
curl -X POST "$BASE/enterprise/roles/assign" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_A\",
    \"tenant_id\": \"$TENANT_A\",
    \"role_name\": \"RECRUITER\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "role_assigned": true
}
```

The recruiter is successfully assigned the specified role within the tenant.


## Step 2 — Create a Candidate Dossier

```bash
curl -X POST "$BASE/enterprise/dossiers" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_A" \
  -H "x-user-id: $USER_A" \
  -d "{
    \"candidate_id\": \"$CANDIDATE_UUID\",
    \"confidential_notes\": \"Confidential interview evaluation feedback for Tenant A placement drive.\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "dossier_created": true
}
```

The dossier is stored under **Tenant A** and becomes accessible only to authorized users within the same tenant.


## Step 3 — Execute Cross-Tenant Isolation Test

```bash
curl -X GET "$BASE/enterprise/dossiers/attack-test?target_tenant_id=$TENANT_B" \
  -H "x-tenant-id: $TENANT_A" \
  -H "x-user-id: $USER_A"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "cross_tenant_records_leaked": 0,
  "isolation_maintained": true
}
```

The validation confirms that no records belonging to **Tenant B** are exposed when accessed from **Tenant A**, demonstrating complete tenant isolation.


# Enterprise Security Features

- Multi-Tenant Data Isolation
- Role-Based Access Control (RBAC)
- Tenant Context Validation
- Permission-Based Authorization
- Secure Dossier Management
- Cross-Tenant Security Testing
- Structured Audit Logging
- Middleware-Based Authorization
- Production-ready Enterprise Security Platform


# RBAC Authorization Workflow

```text
Incoming Request
        │
        ▼
Authenticate User
        │
        ▼
Identify Tenant
        │
        ▼
Load User Roles
        │
        ▼
Validate Permissions
        │
        ▼
Authorize Request
        │
        ▼
Access Protected Resource
```

# Tenant Isolation Workflow

```text
Client Request
      │
      ▼
Read Tenant Context
      │
      ▼
Validate Resource Ownership
      │
      ▼
Apply Tenant Filter
      │
      ▼
Return Authorized Data
```

#  Cross-Tenant Attack Validation Workflow

```text
Unauthorized Request
        │
        ▼
Tenant Verification
        │
        ▼
Permission Validation
        │
        ▼
Block Cross-Tenant Access
        │
        ▼
Return Empty Result
        │
        ▼
Record Security Audit
```
