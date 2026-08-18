# The Data Architect

This module establishes the **relational data architecture** for PlaceMux, focusing on normalized schema design, versioned database migrations, foreign-key relationships, validation rules, and database-level constraint enforcement.

The task ensures that core marketplace data is stored consistently and that invalid relationships or malformed records are rejected at the data layer.


## Core Architecture

The Data Architect layer focuses on three primary responsibilities:

- **Relational Schema Design** — Defines structured entities and their relationships.
- **Versioned Migrations** — Provides controlled and repeatable database schema evolution.
- **Constraint Enforcement** — Uses validation and foreign-key constraints to preserve data integrity.

```text
API Request
     │
     ▼
Request Validation
     │
     ▼
Data Layer
     │
     ▼
Relational Database
     │
     ├── Foreign-Key Constraints
     ├── Field Constraints
     └── Referential Integrity
```

# Data Integrity Principles

## Foreign-Key Validation

Entities that depend on other resources must reference valid records.

For example, a student profile requires a valid:

```text
college_id
```

The database foreign-key relationship prevents student records from being associated with a non-existent college.

## Schema Validation

Incoming student data is validated before persistence.

The registration payload contains:

- `college_id`
- `full_name`
- `email`
- `gpa`
- `grad_year`

Invalid payloads should be rejected without creating a database record.

## Versioned Migrations

Database changes are managed through versioned migration scripts rather than uncontrolled manual schema modifications.

This allows:

- Reproducible database setup
- Controlled schema evolution
- Consistent development environments
- Safer deployment workflows
- Easier rollback and auditing


# Verification Guide

## Step 1 — Register a Student Profile

This test verifies both request validation and the foreign-key relationship between the student and college entities.

Replace `<INSERT_COLLEGE_UUID>` with an existing college UUID.

```bash
curl -X POST "http://localhost:3000/api/v1/data/students" \
  -H "Content-Type: application/json" \
  -d '{
    "college_id": "<INSERT_COLLEGE_UUID>",
    "full_name": "Siddharth Rao",
    "email": "siddharth.rao@university.edu",
    "gpa": 8.75,
    "grad_year": 2026
  }'
```

### Expected Result

A valid request with an existing `college_id` should successfully create the student profile.

Example successful response:

```json
{
  "success": true,
  "data": {
    "full_name": "Siddharth Rao",
    "email": "siddharth.rao@university.edu",
    "gpa": 8.75,
    "grad_year": 2026
  }
}
```

# Verification Scenarios

### Valid College Reference

```text
Existing College UUID
        │
        ▼
Student Registration
        │
        ▼
Foreign-Key Validation
        │
        ▼
Student Created
```

### Invalid College Reference

```text
Non-existent College UUID
        │
        ▼
Student Registration
        │
        ▼
Foreign-Key Constraint
        │
        ▼
Request Rejected
```

This ensures that orphaned student records cannot be inserted into the database.


# Data Registration Workflow

```text
Client
  │
  ▼
POST /api/v1/data/students
  │
  ▼
Validate Request Payload
  │
  ▼
Validate College Reference
  │
  ▼
Apply Database Constraints
  │
  ▼
Persist Student Profile
  │
  ▼
Return Standardized Response
```

# Relational Data Model

The module is designed around relational entities and their dependencies.

```text
College
   │
   │ 1:N
   ▼
Student
```

The `college_id` relationship ensures that every registered student belongs to a valid college record.


# 🚀 API Endpoint

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/data/students` | Register a student profile |

# Student Registration Fields

| Field | Purpose |
|---|---|
| `college_id` | Associates the student with a college |
| `full_name` | Student's full name |
| `email` | Student's email address |
| `gpa` | Academic GPA |
| `grad_year` | Expected graduation year |

