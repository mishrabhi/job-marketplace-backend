# Authentication & Security

This module establishes the authentication and application security layer for PlaceMux, focusing on secure user registration, password hashing, JWT-based authentication, role-based access control, HTTP security headers, and request rate limiting.

The task ensures that user credentials are protected, authenticated sessions are securely represented through JWT tokens, and protected resources are accessible only to users with the required permissions.

# Core Architecture

The Authentication & Security layer focuses on the following responsibilities:

- **Authentication** — Registers users and verifies login credentials.
- **Password Hashing** — Protects user passwords using BCrypt hashing.
- **JWT Sessions** — Issues signed access tokens containing authenticated user context.
- **Role-Based Access Control** — Restricts protected endpoints according to user roles.
- **HTTP Security** — Applies security headers through Helmet.
- **Rate Limiting** — Protects authentication and API endpoints against excessive requests.

```text
Client
  │
  ▼
Authentication Request
  │
  ├── Signup ──► BCrypt Password Hash
  │
  └── Login ───► Credential Verification
                       │
                       ▼
                  JWT Generation
                       │
                       ▼
                 Access Token
                       │
                       ▼
              Protected API Route
                       │
                       ▼
                 JWT Validation
                       │
                       ▼
                    RBAC
                       │
                 ┌─────┴─────┐
                 │           │
              Allowed      Denied
                 │           │
                 ▼           ▼
             Resource      403
              Access      Forbidden
```

# Authentication Principles

## Password Hashing

User passwords are never returned as part of the user profile response.

During registration, the supplied password is hashed using BCrypt before being persisted.

```text
Plain Password
      │
      ▼
   BCrypt
      │
      ▼
Password Hash
      │
      ▼
Database
```

## JWT Authentication

After successful login, the backend generates an access token containing the authenticated user's identity and authorization context.

Protected endpoints require the token through the standard Authorization header:

```text
Authorization: Bearer <ACCESS_TOKEN>
```

## Role-Based Access Control

Authenticated users are associated with roles such as:

```text
STUDENT
ADMIN
```

RBAC middleware validates whether the authenticated user's role is permitted to access a protected endpoint.

## HTTP Security Headers

Helmet is used to apply recommended HTTP security headers to reduce common browser-based security risks.

## Rate Limiting

Rate limiting protects endpoints from excessive or abusive request patterns, particularly authentication-related routes.

# Verification Guide

## Step 1 — Register User Account

Register a new student account.

```bash
curl -X POST "http://localhost:3000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@placemux.edu",
    "password": "SecurePassword@123",
    "full_name": "Aarav Sharma",
    "role": "STUDENT"
  }'
```

### Expected Result

Returns **HTTP 201 Created**.

The response returns the user profile without exposing the stored password hash.

Example:

```json
{
  "success": true,
  "data": {
    "email": "student1@placemux.edu",
    "full_name": "Aarav Sharma",
    "role": "STUDENT"
  }
}
```

The password is stored as a BCrypt hash rather than as plain text.

# Step 2 — Authenticate & Receive JWT Token

Authenticate using the registered credentials.

```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@placemux.edu",
    "password": "SecurePassword@123"
  }'
```

### Expected Result

Returns **HTTP 200 OK** with an access token and expiration metadata.

Example:

```json
{
  "success": true,
  "data": {
    "access_token": "<JWT_ACCESS_TOKEN>",
    "expires_in": 3600
  }
}
```

Copy the returned `access_token` for the next verification step.

# Step 3 — Access Protected `/me` Route

Use the JWT received from Step 2 to access the authenticated user's profile.

```bash
curl -X GET "http://localhost:3000/api/v1/auth/me" \
  -H "Authorization: Bearer <INSERT_ACCESS_TOKEN_FROM_STEP_2>"
```

### Expected Result

Returns **HTTP 200 OK**.

The backend validates and decodes the JWT before returning the authenticated user's profile.

Example:

```json
{
  "success": true,
  "data": {
    "email": "student1@placemux.edu",
    "full_name": "Aarav Sharma",
    "role": "STUDENT"
  }
}
```

# Step 4 — Verify Role-Based Access Control

Attempt to access the admin dashboard using the `STUDENT` access token.

```bash
curl -X GET "http://localhost:3000/api/v1/auth/admin/dashboard" \
  -H "Authorization: Bearer <INSERT_ACCESS_TOKEN_FROM_STEP_2>"
```

### Expected Result

The request should be rejected because the authenticated user has the `STUDENT` role rather than the required administrative role.

Expected HTTP status:

```text
403 Forbidden
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

This confirms that authentication alone does not grant access to role-restricted resources.

# Authentication Workflow

```text
Signup
  │
  ▼
Validate User Input
  │
  ▼
Hash Password with BCrypt
  │
  ▼
Persist User
  │
  ▼
Return Safe User Profile
```

```text
Login
  │
  ▼
Find User
  │
  ▼
Verify BCrypt Password
  │
  ▼
Generate JWT
  │
  ▼
Return Access Token
```

# Protected Route Workflow

```text
Incoming Request
       │
       ▼
Authorization Header
       │
       ▼
Extract JWT
       │
       ▼
Verify JWT Signature
       │
       ▼
Load Authenticated User
       │
       ▼
Check Required Role
       │
   ┌───┴────┐
   │        │
Allowed   Denied
   │        │
   ▼        ▼
Access     403
Resource  Forbidden
```

# Security Controls

| Control | Purpose |
| ------- | ------- |
| BCrypt | Secure password hashing |
| JWT | Stateless authenticated sessions |
| RBAC | Role-based resource authorization |
| Helmet | HTTP security headers |
| Rate Limiting | Protection against excessive requests |
| Authorization Header | Secure access-token transmission |

# Authentication API Endpoints

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `POST` | `/api/v1/auth/signup` | Register a new user |
| `POST` | `/api/v1/auth/login` | Authenticate user and issue JWT |
| `GET` | `/api/v1/auth/me` | Retrieve authenticated user profile |
| `GET` | `/api/v1/auth/admin/dashboard` | Access admin-only dashboard |