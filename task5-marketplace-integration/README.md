# Task 5: Marketplace Integration

## Purpose
Combine all prior app tasks into one integrated marketplace backend:
- Companies, students, skills, KYC
- Job posting and thresholds
- Search and discovery
- Applications and shortlist workflows
- Health and readiness endpoints

## Structure

- `.env` / `.env.example`
- `.gitignore`
- `app.js`
- `server.js`
- `package.json`
- `package-lock.json`
- `jest.config.cjs`
- `scripts/migrate.js`
- `migrations/001_init_all_tables.sql`
- `migrations/002_add_search_features.sql`
- `src/app.js`
- `src/config/db.js`
- `src/config/env.js`
- `src/controllers/`
- `src/models/`
- `src/routes/`
- `src/services/`
- `src/validators/`
- `src/middlewares/`
- `tests/e2e/full-flow.test.js`
- `docs/api-contract.md`
- `docs/demo-script.md`

## Run

```bash
cd task5-marketplace-integration
npm install
npm run migrate
npm run dev
```

## Tests

```bash
npm test
```

## Notes

- `/api/v1` is the base route for all endpoints.
- Health probes are exposed at `/api/v1/health` and `/api/v1/health/ready`.
- Task 5 is the final consolidated backend and includes the complete E2E flow.
