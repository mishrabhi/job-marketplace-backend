# Data Schema Validation Middleware

This module establishes reusable request validation and sanitization middleware for PlaceMux using Zod. It validates incoming request payloads at the API boundary, normalizes supported values, rejects malformed data, and prevents unexpected or potentially malicious properties from reaching the application layer.

# Core Architecture

The Data Schema Validation layer focuses on three primary responsibilities:

- **Schema Validation** — Validates request bodies and parameters against predefined Zod schemas.
- **Input Sanitization** — Normalizes supported input values such as trimming whitespace and converting emails to lowercase.
- **Strict Schema Enforcement** — Rejects unknown properties and malformed values before they reach business logic.

```text
Incoming Request
      │
      ▼
Validation Middleware
      │
      ▼
Zod Schema
      │
      ├── Valid Input
      │      │
      │      ▼
      │   Sanitization
      │      │
      │      ▼
      │   Controller
      │
      └── Invalid Input
             │
             ▼
        400 Bad Request
```

# Validation Principles

## Request Body Validation

Student registration requests are validated against defined constraints for:

```text
full_name
email
gpa
grad_year
skills
```

Invalid values are rejected before persistence or business logic execution.

## Input Sanitization

Supported fields are normalized automatically.

For example:

```text
"  Aarav Sharma  "
        │
        ▼
"Aarav Sharma"
```

and:

```text
"AARAV.SHARMA@UNIVERSITY.EDU"
        │
        ▼
"aarav.sharma@university.edu"
```

## Strict Schema Validation

Unexpected properties are rejected instead of silently being accepted.

For example:

```json
{
  "full_name": "Priya Patel",
  "email": "priya@university.edu",
  "gpa": 9.1,
  "grad_year": 2026,
  "skills": ["React"],
  "is_admin": true
}
```

The unexpected `is_admin` property causes validation to fail with an `unrecognized_keys` error.

## Path Parameter Validation

Resource identifiers such as UUIDs are validated before the request reaches the resource lookup layer.

Invalid identifiers are rejected as malformed requests.

# Verification Guide

## Step 1 — Test Valid Request

Submit a valid student registration request containing intentionally untrimmed and uppercase values.

```bash
curl -X POST "http://localhost:3000/api/v1/students" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "  Aarav Sharma  ",
    "email": "AARAV.SHARMA@UNIVERSITY.EDU",
    "gpa": 8.75,
    "grad_year": 2026,
    "skills": ["Node.js", "Express", "Zod"]
  }'
```

### Expected Result

Returns **HTTP 201 Created**.

The validation middleware sanitizes the input before passing it to the application layer.

Expected normalized values:

```json
{
  "full_name": "Aarav Sharma",
  "email": "aarav.sharma@university.edu"
}
```

# Step 2 — Test Invalid Request

Submit a request containing values outside the defined validation rules.

```bash
curl -X POST "http://localhost:3000/api/v1/students" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "A",
    "email": "not-an-email",
    "gpa": 15.5,
    "grad_year": 1999,
    "skills": []
  }'
```

### Expected Result

Returns **HTTP 400 Bad Request**.

The response contains structured field-level validation errors for the invalid fields, including:

- `full_name`
- `email`
- `gpa`
- `grad_year`
- `skills`

Example response structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "fields": {
      "full_name": "Invalid value",
      "email": "Invalid email address",
      "gpa": "Value is outside the allowed range",
      "grad_year": "Invalid graduation year",
      "skills": "At least one skill is required"
    }
  }
}
```

# Step 3 — Test Unknown / Malicious Injected Property

Send an unexpected `is_admin` property.

```bash
curl -X POST "http://localhost:3000/api/v1/students" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Priya Patel",
    "email": "priya@university.edu",
    "gpa": 9.1,
    "grad_year": 2026,
    "skills": ["React"],
    "is_admin": true
  }'
```

### Expected Result

Returns **HTTP 400 Bad Request**.

The strict Zod schema rejects the unexpected property and returns an `unrecognized_keys` validation error.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "type": "unrecognized_keys"
  }
}
```

The unexpected property must not be persisted or passed to the application logic.

# Step 4 — Test Path Parameter UUID Validation

Send an invalid UUID as the student identifier.

```bash
curl -X GET "http://localhost:3000/api/v1/students/invalid-uuid-123"
```

### Expected Result

The request is rejected because the path parameter does not conform to the expected UUID format.

The validation layer prevents the malformed identifier from reaching the database lookup.

# Validation Workflow

```text
HTTP Request
      │
      ▼
Extract Body / Parameters
      │
      ▼
Apply Zod Schema
      │
      ├── Valid
      │    │
      │    ▼
      │  Sanitize
      │    │
      │    ▼
      │  Controller
      │
      └── Invalid
           │
           ▼
      Validation Error
           │
           ▼
       HTTP 400
```

# Student Request Schema

| Field | Validation Purpose |
| ----- | ------------------ |
| `full_name` | Validates and trims student name |
| `email` | Validates email format and normalizes to lowercase |
| `gpa` | Enforces GPA boundaries |
| `grad_year` | Validates graduation year |
| `skills` | Ensures valid skill collection |
| Path `id` | Validates UUID format |

# API Endpoints

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `POST` | `/api/v1/students` | Validate, sanitize, and create a student |
| `GET` | `/api/v1/students/:id` | Validate student UUID before resource lookup |