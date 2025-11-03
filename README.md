## Solace Candidate Assignment

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### 1. Install dependencies

```bash
npm i
```

### 2. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your database connection string if needed. The default points to a local PostgreSQL instance.

### 3. Set up the database

The application requires a PostgreSQL database. You can use the included Docker setup:

```bash
docker compose up -d
```

This will start PostgreSQL with the following defaults:
- User: `postgres`
- Password: `password`
- Database: `solaceassignment`
- Port: `5432`

### 4. Push the database schema

Push the schema to create the table with indexes:

```bash
npx drizzle-kit push
```

This creates the advocates table with performance indexes on city, years_of_experience, lower(last_name), and specialties for efficient pagination.

### 5. Seed the database

Seed via API (requires dev server running):

```bash
npm run dev
# In a new terminal:
curl -X POST http://localhost:3000/api/seed
```

### 6. View the application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Scripts

- `npm test` – run the Vitest suite
- `npm run test:watch` – watch mode
- `npm run test:coverage` – coverage report
- `npm run lint` – lint the project
- `npm run generate` – regenerate Drizzle SQL
- `npm run migrate:up` – run pending migrations

---

Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Change Log (PR1–PR4)

### Major Improvements
- Keyset (cursor-based) pagination with server-side filtering & sorting (`years`, `name`), plus URL-synced filters and debounced search.
- Responsive card-based search UI with prominent search, collapsible Advanced Filters, specialty popover, and floating Active Filters bar.
- Specialty-aware search (incl. substring matches); city filter switched to partial, case-insensitive matching.
- Modular architecture: `useAdvocates` data hook (typed + SWR), extracted `SearchBar`, `AdvancedFilters`, `AdvocateGrid`; refactored `src/app/page.tsx`.
- Performance-ready indexes on `city`, `years_of_experience`, `lower(last_name)`, and `specialties` (GIN).
- Validation & tests: Zod API validation, Vitest suite, unit tests for hook/components, expanded seed data (55) with pagination coverage.
- Accessibility & UX: roles/labels/`aria-live`, consistent loading/empty/error + skeleton states.

### Major Fixes
- Eliminated XSS by removing `innerHTML` in favor of safe React state.
- Replaced nested promise chains with `async/await` and proper error handling.
- Database init now fails explicitly (no mock fallbacks).
- Corrected React list keys and invalid table markup.
