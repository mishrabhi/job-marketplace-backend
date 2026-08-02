# SSO, SCIM & Enterprise Identity Engine (Phase 3 · Task 18)

This module implements the **SSO, SCIM & Enterprise Identity Engine** for the PlaceMux backend. It enables enterprise-grade identity management through **SAML/OIDC Single Sign-On (SSO)**, **SCIM 2.0 user provisioning**, automated joiner and leaver workflows, and immediate session revocation upon user deprovisioning.

The platform integrates seamlessly with enterprise Identity Providers (IdPs) while ensuring secure authentication, automated user lifecycle management, and instant access revocation.


# Folder Structure

```text
phase3-task18-enterprise-identity/
├── migrations/
│   └── 049_enterprise_identity_tables.sql      # SSO, SCIM & identity schema
├── src/
│   ├── config/
│   │   ├── db.js                               # Database connection
│   │   ├── env.js                              # Environment configuration
│   │   ├── logger.js                           # Structured logging
│   ├── middlewares/
│   │   ├── scimAuth.js                         # SCIM bearer authentication
│   │   └── errorHandler.js                     # Global error handler
│   ├── validators/
│   │   └── identity.validator.js              # Request validation schemas
│   ├── controllers/
│   │   └── identity.controller.js             # Identity endpoints
│   ├── services/
│   │   └── identity.service.js                # SSO & SCIM engine
│   └── routes/
│       ├── identity.routes.js                 # /api/v1/enterprise-identity endpoints
│       └── index.js                           # Route registry
├── app.js                                     # Express application
├── server.js                                  # Server bootstrap
├── package.json                               # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. Enterprise SSO

The platform supports enterprise authentication using:

- SAML 2.0
- OpenID Connect (OIDC)

Each tenant maintains its own Identity Provider (IdP) configuration, allowing organizations to authenticate users using their existing enterprise identity infrastructure.


## 2. SCIM 2.0 Provisioning

The engine implements SCIM 2.0 APIs for automated identity lifecycle management.

Supported operations include:

- User Provisioning (Joiner)
- User Updates
- User Deprovisioning (Leaver)

Provisioning requests are authenticated using tenant-specific SCIM bearer tokens.


## 3. Immediate Session Revocation

When a user is deprovisioned by the enterprise IdP:

- All active sessions are revoked immediately.
- Access tokens become invalid.
- Authentication attempts are rejected.
- Audit logs are recorded.

This guarantees immediate enforcement of enterprise access policies.

# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/049_enterprise_identity_tables.sql
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
export BASE=http://localhost:3009/api/v1/enterprise-identity

export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"

export IDP_USER_ID="idp_user_998877"

export SCIM_BEARER="scim_token_sandbox_12345"
```


## Step 1 — Configure Enterprise SSO

Create a SCIM bearer token in the database.

```sql
INSERT INTO scim_bearer_tokens (tenant_id, scim_token)
VALUES (
    'a1b23c44-dd55-66ee-77ff-88aa99bb0011',
    'scim_token_sandbox_12345'
)
ON CONFLICT DO NOTHING;
```

Configure the tenant's SAML SSO integration.

```bash
curl -X POST "$BASE/sso/configure" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"idp_entity_id\": \"https://idp.okta.com/exk12345\",
    \"sso_login_url\": \"https://idp.okta.com/app/sso/login\",
    \"certificate_fingerprint\": \"AA:BB:CC:DD:EE:FF:11:22:33:44\",
    \"protocol\": \"SAML2\",
    \"allow_break_glass\": true
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "sso_configured": true,
  "protocol": "SAML2"
}
```

The enterprise SSO configuration is successfully stored for the tenant.

## Step 2 — Provision a User (Joiner)

```bash
curl -X POST "$BASE/scim/v2/Users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SCIM_BEARER" \
  -d "{
    \"external_idp_id\": \"$IDP_USER_ID\",
    \"email\": \"emp.active@enterprise.com\",
    \"first_name\": \"John\",
    \"last_name\": \"Doe\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "user_provisioned": true,
  "session_token": "sess_abc123xyz"
}
```

The user is provisioned successfully, and an active session token is issued.


## Step 3 — Deprovision the User (Leaver)

```bash
curl -X DELETE "$BASE/scim/v2/Users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SCIM_BEARER" \
  -d "{
    \"external_idp_id\": \"$IDP_USER_ID\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "access_revoked_immediately": true
}
```

The user's access is revoked instantly, and all active sessions are invalidated.


## Step 4 — Validate Session Revocation

Attempt to validate the previously issued session token.

```bash
curl -X GET "$BASE/session/validate?session_token=<SESSION_TOKEN_FROM_STEP_2>&tenant_id=$TENANT_UUID"
```

### Expected Result

Returns **HTTP 401 Unauthorized**.

Example response:

```json
{
  "success": false,
  "message": "User access has been revoked or deprovisioned by enterprise IdP."
}
```

The session validation fails, confirming that deprovisioning immediately revokes user access.


# Identity & Security Features

- SAML 2.0 Single Sign-On (SSO)
- OpenID Connect (OIDC) Support
- SCIM 2.0 User Provisioning
- Automated Joiner Workflow
- Automated Leaver Workflow
- Immediate Session Revocation
- Tenant-Specific Identity Providers
- SCIM Bearer Authentication
- Production-ready Enterprise Identity Platform


# SSO Configuration Workflow

```text
Tenant Configuration
        │
        ▼
Register Identity Provider
        │
        ▼
Store SAML/OIDC Settings
        │
        ▼
Enable Enterprise Login
```


# SCIM Provisioning Workflow

```text
SCIM Request
      │
      ▼
Validate Bearer Token
      │
      ▼
Create Enterprise User
      │
      ▼
Generate Session
      │
      ▼
Persist Identity
```


# User Deprovisioning Workflow

```text
SCIM Delete Request
         │
         ▼
Locate User
         │
         ▼
Deactivate Identity
         │
         ▼
Revoke Active Sessions
         │
         ▼
Invalidate Tokens
         │
         ▼
Record Audit Log
```

