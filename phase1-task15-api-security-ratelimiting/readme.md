# API Security & Rate Limiting

This module establishes the API security and traffic protection layer for PlaceMux, focusing on distributed Redis-based rate limiting, tier-based request quotas, HTTP security headers, CORS protection, and automated abuse quarantine.

The task protects sensitive API endpoints from excessive traffic and unauthorized browser origins while providing controlled mechanisms for identifying and isolating abusive clients.

## Core Architecture

The API Security layer focuses on four primary responsibilities:

- **Distributed Rate Limiting** — Uses Redis to maintain rate-limit state across application instances.
- **Tier-Based Quotas** — Applies different request limits based on endpoint or access tier.
- **HTTP Security Protection** — Uses Helmet to enforce secure HTTP response headers.
- **Abuse Quarantine** — Tracks repeated rate-limit violations and automatically blacklists abusive IP addresses.

```text
Incoming Request
       │
       ▼
Security Middleware
       │
       ├── CORS Validation
       │
       ├── Helmet Headers
       │
       ├── Redis Rate Limiter
       │
       └── Abuse Detection
              │
              ▼
        Request Allowed
              │
              ▼
        API Controller