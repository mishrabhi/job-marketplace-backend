# Distributed Rate Limiting & Security Policy

## 1. Multi-Tier Distributed Rate Limit Matrix

| Route / Tier | Identifier / Key | Window (Seconds) | Max Requests | Storage Engine | Action on Breach |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth / Sensitive (`/auth/*`)** | `ip:<client_ip>` | 60s (1 min) | 5 req / min | Redis Store | `429 Too Many Requests` + Abuse Strike |
| **Public API Tier (`/public/*`)** | `ip:<client_ip>` | 60s (1 min) | 30 req / min | Redis Store | `429 Too Many Requests` |
| **Authenticated API Tier (`/api/v1/*`)** | `user:<user_id>` (fallback `ip`) | 60s (1 min) | 120 req / min | Redis Store | `429 Too Many Requests` |

## 2. Abuse Detection & Automated Quarantine
* **Detection Trigger:** If a single IP triggers 3 rate limit breaches within a rolling 5-minute window, it is flagged as malicious abuse.
* **Quarantine Enforcement:** IP is temporarily blacklisted in Redis (`SET blacklist:<ip> 1 EX 900`) for 15 minutes (`403 Forbidden - IP Quarantined`).

## 3. HTTP Security Headers (Helmet) & CORS
* Strict CORS allowlist matching explicit environment origins.
* Content-Security-Policy (CSP), HSTS, DNS prefetch control, Frameguard (Clickjacking prevention), and XSS filters enforced via Helmet