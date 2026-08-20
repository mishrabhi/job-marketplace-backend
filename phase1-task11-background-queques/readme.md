# Background Tasks & Queues

This module establishes the asynchronous job processing layer for PlaceMux using BullMQ and Redis. It provides background task execution, exponential retry handling, dead-letter queue routing, and idempotency protection for reliable asynchronous processing.

# Core Architecture

The Background Tasks & Queues layer focuses on four primary responsibilities:

- **Asynchronous Processing** — Moves non-critical workloads out of the synchronous API request lifecycle.
- **Retry Handling** — Automatically retries failed jobs using exponential backoff.
- **Dead-Letter Queue** — Routes jobs that exhaust all retry attempts into a dedicated failure queue.
- **Idempotency Protection** — Prevents duplicate background jobs from being created for the same operation.

```text
Client
  │
  ▼
API Endpoint
  │
  ▼
BullMQ Queue
  │
  ▼
Redis
  │
  ▼
Dedicated Worker
  │
  ├── Success ──────► Job Completed
  │
  └── Failure
         │
         ▼
     Retry Queue
         │
         ▼
   Exponential Backoff
         │
         ├── Retry Available ──► Worker
         │
         └── Retries Exhausted
                    │
                    ▼
              Dead-Letter Queue
```

# Background Processing Principles

## Asynchronous Job Processing

The API places background work onto a BullMQ queue instead of executing the complete operation during the HTTP request.

This allows the API to respond quickly while the dedicated worker processes the job asynchronously.

```text
HTTP Request
     │
     ▼
Queue Job
     │
     ▼
202 Accepted
     │
     ▼
Background Worker
```

## Dedicated Worker

The worker runs independently from the API server and continuously processes queued jobs.

Start the worker using:

```bash
npm run worker
```

The worker should be started in a separate terminal from the main application.

## Exponential Retry

Failed jobs are retried automatically using exponential backoff.

The failure verification flow demonstrates three processing attempts before the job is moved to the Dead-Letter Queue.

```text
Attempt 1
   │
   ▼
Failure
   │
   ▼
Backoff
   │
   ▼
Attempt 2
   │
   ▼
Failure
   │
   ▼
Backoff
   │
   ▼
Attempt 3
   │
   ▼
Failure
   │
   ▼
Dead-Letter Queue
```

## Dead-Letter Queue

When a job fails on all configured retry attempts, it is removed from the normal processing flow and routed to the Dead-Letter Queue for further inspection or recovery.

## Idempotency

Each dispatched job contains an `idempotency_key`.

This allows the system to recognize repeated requests representing the same operation and prevent duplicate background processing.

# Verification Guide

## Step 1 — Start the Dedicated Worker

Open a separate terminal and start the background worker:

```bash
npm run worker
```

### Expected Result

The worker starts successfully and begins listening for jobs from the BullMQ/Redis queue.

```text
API Server
    │
    ▼
Redis / BullMQ
    │
    ▼
Worker
```

# Step 2 — Enqueue Normal Background Task

Submit an email dispatch job through the API.

```bash
curl -X POST "http://localhost:3000/api/v1/dispatch/email" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "student@university.edu",
    "subject": "Interview Scheduled",
    "body": "Your interview is set for 10:00 AM.",
    "idempotency_key": "job-idempotency-token-001",
    "should_fail": false
  }'
```

### Expected Result

Returns **HTTP 202 Accepted** within approximately `<10ms`.

The API acknowledges the job while the worker processes it asynchronously.

Worker logs should show successful processing and completion.

```text
API
 │
 ▼
202 Accepted
 │
 ▼
BullMQ Queue
 │
 ▼
Worker
 │
 ▼
Job Completed
```

# Step 3 — Test Retry & Dead-Letter Queue

Trigger a simulated failing background job:

```bash
curl -X POST "http://localhost:3000/api/v1/dispatch/email" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "failing.student@university.edu",
    "subject": "Failing Job Test",
    "body": "Testing retry mechanics.",
    "idempotency_key": "job-failing-token-002",
    "should_fail": true
  }'
```

### Expected Result

Returns:

```text
202 Accepted
```

The worker should process the job and retry it after each failure.

The verification flow expects three failed attempts followed by Dead-Letter Queue routing.

Expected worker log:

```text
[Worker] Job failed on attempt 3: Simulated dispatch failure...
[Worker] Job exhausted all 3 attempts. Moving to Dead-Letter Queue!
```

Expected processing flow:

```text
Job Enqueued
     │
     ▼
Attempt 1
     │
     ▼
Failure
     │
     ▼
Retry
     │
     ▼
Attempt 2
     │
     ▼
Failure
     │
     ▼
Retry
     │
     ▼
Attempt 3
     │
     ▼
Failure
     │
     ▼
Dead-Letter Queue
```

# Step 4 — Check Queue & DLQ Metrics

Query the background processing metrics endpoint:

```bash
curl -X GET "http://localhost:3000/api/v1/dispatch/metrics"
```

### Expected Result

Returns queue and Dead-Letter Queue metrics that can be used to verify the current state of asynchronous processing.

The metrics provide visibility into background job execution and failed jobs routed to the DLQ.

# Background Job Lifecycle

```text
Request
  │
  ▼
Validate Payload
  │
  ▼
Check Idempotency Key
  │
  ▼
Create BullMQ Job
  │
  ▼
Redis Queue
  │
  ▼
202 Accepted
  │
  ▼
Worker Picks Job
  │
  ├──────────────► Success
  │                    │
  │                    ▼
  │                Completed
  │
  └──────────────► Failure
                       │
                       ▼
                 Retry with Backoff
                       │
                  ┌────┴────┐
                  │         │
               Retry     Exhausted
                  │         │
                  ▼         ▼
                Worker     DLQ
```

# Reliability Model

| Component | Responsibility |
| --------- | -------------- |
| BullMQ | Background job queue and job lifecycle management |
| Redis | Queue state and job storage |
| Worker | Asynchronous job execution |
| Retry Mechanism | Recovers from transient failures |
| Exponential Backoff | Spaces repeated retry attempts |
| Dead-Letter Queue | Stores permanently failed jobs |
| Idempotency Key | Prevents duplicate job processing |

# API Endpoints

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `POST` | `/api/v1/dispatch/email` | Enqueue an asynchronous email job |
| `GET` | `/api/v1/dispatch/metrics` | Retrieve queue and DLQ metrics |

# Processing Workflow

```text
Client
  │
  ▼
POST /api/v1/dispatch/email
  │
  ▼
Idempotency Check
  │
  ▼
BullMQ
  │
  ▼
Redis
  │
  ▼
Background Worker
  │
  ├── Successful Job
  │       │
  │       ▼
  │    Completed
  │
  └── Failed Job
          │
          ▼
      Exponential Retry
          │
          ├── Attempt 1
          ├── Attempt 2
          └── Attempt 3
                  │
                  ▼
                 DLQ
```

This architecture keeps long-running or failure-prone workloads outside the synchronous API request path while providing controlled retries, failure isolation, and visibility into background processing.