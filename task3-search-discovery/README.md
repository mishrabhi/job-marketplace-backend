# Task 3: Search & Discovery

## Purpose
Implement search and discovery features for published jobs:
- Keyword search
- Skill filters
- Ranked discovery feed
- Full-text search indexes

## Structure

- `.env` / `.env.example`
- `.gitignore`
- `app.js`
- `server.js`
- `package.json`
- `package-lock.json`
- `jest.config.cjs`
- `scripts/migrate.js`
- `migrations/008_add_search_indexes.sql`
- `migrations/009_create_search_log.sql`
- `docs/api-contract.md`

## Run

```bash
cd task3-search-discovery
npm install
npm run migrate
npm run dev
```

## Tests

```bash
npm test
```

## Notes

This task uses full-text search and ranking logic to surface jobs for students based on skill compatibility.
