# Data Relationships & Population

This module establishes relational integrity and efficient data retrieval patterns for PlaceMux. It focuses on referential integrity enforcement, cascading rules, relational database seeding, and optimized tree retrievals that avoid unnecessary N+1 database queries.

# Core Architecture

The Data Relationships layer focuses on four primary responsibilities:

- **Referential Integrity** — Maintains valid relationships between companies, jobs, students, and applications.
- **Cascading Rules** — Controls how dependent records behave when parent records are deleted.
- **Relational Seeding** — Populates related entities within a single atomic database transaction.
- **Optimized Tree Retrieval** — Retrieves nested relational data and application counts without N+1 query overhead.

```text
Company
   │
   ├── Jobs
   │     │
   │     └── Applications
   │
   └── Related Data
```

# Referential Integrity Principles

## RESTRICT Constraint

The `RESTRICT` relationship prevents deletion of a parent record when dependent records still exist.

For example, a company with active job openings cannot be deleted until its dependent jobs are handled.

```text
Company
   │
   └── Active Jobs
          │
          ▼
    DELETE Company
          │
          ▼
       BLOCKED
```

This protects the database from invalid references and accidental deletion of active relational data.

## CASCADE Constraint

The `CASCADE` relationship automatically removes dependent records when their parent record is deleted.

For example:

```text
Job
 │
 └── Applications
```

Deleting the job automatically removes its dependent applications, preventing orphaned application records.

## Atomic Relational Seeding

The seeder creates related entities inside a single database transaction.

```text
Begin Transaction
       │
       ├── Companies
       ├── Jobs
       ├── Students
       └── Applications
              │
              ▼
        Transaction Commit
```

If any part of the seeding process fails, the complete transaction is rolled back.

# Verification Guide

## Step 1 — Run Relational Seeder Script

Run the database seeder:

```bash
npm run seed
```

### Expected Result

The seeder creates Companies, Jobs, Students, and Applications inside a single atomic transaction.

```text
Companies
    │
    ▼
Jobs
    │
    ▼
Students
    │
    ▼
Applications
```

All related records are committed together after the transaction completes successfully.

# Step 2 — Verify Anti-N+1 Single-Query Tree Retrieval

Fetch all companies together with their nested jobs and real-time application counts.

```bash
curl -X GET "http://localhost:3000/api/v1/relationships/companies/tree"
```

### Expected Result

Returns **HTTP 200 OK**.

The response provides a nested company tree containing:

- Companies
- Associated Jobs
- Application Counts

The retrieval is optimized to avoid an N+1 query pattern and retrieves the relational tree in a single database round-trip.

Example structure:

```json
{
  "success": true,
  "data": [
    {
      "company_id": "company-uuid",
      "company_name": "Google India",
      "jobs": [
        {
          "job_id": "job-uuid",
          "title": "Software Engineer",
          "application_count": 12
        }
      ]
    }
  ]
}
```

# Step 3 — Verify RESTRICT Referential Constraint

Attempt to delete a company that still has active job openings.

Replace `<INSERT_COMPANY_UUID>` with the target company UUID.

```bash
curl -X DELETE \
  "http://localhost:3000/api/v1/relationships/companies/<INSERT_COMPANY_UUID>/restrict"
```

### Expected Result

Returns **HTTP 409 Conflict**.

Expected error:

```text
FOREIGN_KEY_RESTRICT_VIOLATION
```

The database prevents deletion because dependent job records still reference the company.

```text
Company
   │
   └── Active Job
          │
          ▼
   DELETE Company
          │
          ▼
      409 Conflict
```

# Step 4 — Verify CASCADE Referential Deletion

Delete a job and verify that dependent applications are automatically removed.

Replace `<INSERT_JOB_UUID>` with the target job UUID.

```bash
curl -X DELETE \
  "http://localhost:3000/api/v1/relationships/jobs/<INSERT_JOB_UUID>/cascade"
```

### Expected Result

The job is deleted along with its dependent applications.

```text
Job
 │
 ├── Application 1
 ├── Application 2
 └── Application 3
        │
        ▼
   DELETE Job
        │
        ▼
   CASCADE DELETE
        │
        ├── Application 1 Removed
        ├── Application 2 Removed
        └── Application 3 Removed
```

This prevents orphaned application records from remaining after the parent job is removed.

# Relational Retrieval Workflow

```text
Client Request
      │
      ▼
GET /relationships/companies/tree
      │
      ▼
Relationship Query
      │
      ├── Companies
      ├── Jobs
      └── Application Counts
             │
             ▼
       Single DB Query
             │
             ▼
      Nested JSON Tree
```

# Relationship Model

```text
Company
   │
   │ 1:N
   ▼
 Job
   │
   │ 1:N
   ▼
Application

Student
   │
   │ 1:N
   ▼
Application
```

The relational structure ensures that applications maintain valid references to both students and jobs.

# Referential Behavior

| Parent Entity | Dependent Entity | Delete Behavior |
| -------------- | ---------------- | ---------------- |
| Company | Jobs | `RESTRICT` |
| Job | Applications | `CASCADE` |
| Student | Applications | Referential integrity enforced |

# API Endpoints

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `GET` | `/api/v1/relationships/companies/tree` | Retrieve companies with nested jobs and application counts |
| `DELETE` | `/api/v1/relationships/companies/:id/restrict` | Test company deletion with RESTRICT constraint |
| `DELETE` | `/api/v1/relationships/jobs/:id/cascade` | Delete job and cascade to dependent applications |