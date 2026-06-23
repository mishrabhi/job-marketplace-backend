# Task 4: Applications & Shortlisting

## Purpose
Implement the student application lifecycle and company shortlist workflow:
- Student job applications
- Idempotent application submission
- Company candidate shortlisting
- Rejection/status tracking

## Structure

- `.env` / `.env.example`
- `.gitignore`
- `app.js`
- `server.js`
- `package.json`
- `package-lock.json`
- `jest.config.cjs`
- `scripts/migrate.js`
- `migrations/010_create_applications.sql`
- `migrations/011_create_shortlists.sql`
- `docs/api-contract.md`

## Run

```bash
cd task4-applications-shortlisting
npm install
npm run migrate
npm run dev
```

## Tests

```bash
npm test
```

## Notes

This task adds applications with idempotency and shortlist records, completing the workflow for recruiters to manage candidate pipelines.
