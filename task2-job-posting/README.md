# Task 2: Job Posting

## Purpose
Add job posting and skill threshold features:
- Job creation
- Required skill thresholds
- Publish workflow
- Assessment link generation

## Structure

- `.env` / `.env.example`
- `.gitignore`
- `app.js`
- `server.js`
- `package.json`
- `package-lock.json`
- `jest.config.cjs`
- `scripts/migrate.js`
- `migrations/005_create_jobs.sql`
- `migrations/006_create_skill_thresholds.sql`
- `migrations/007_create_assessment_links.sql`
- `docs/api-contract.md`

## Run

```bash
cd task2-job-posting
npm install
npm run migrate
npm run dev
```

## Tests

```bash
npm test
```

## Notes

This task extends Task 1 with job and threshold entities. It also includes idempotent assessment link creation on publish.
