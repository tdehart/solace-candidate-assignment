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

```bash
npx drizzle-kit push
```

### 5. Add database indexes

Apply performance indexes for filtering and sorting:

```bash
docker compose exec -T db psql -U postgres -d solaceassignment -f - < src/db/migrations/add_indexes.sql
```

This creates indexes on city, years_of_experience, lower(last_name), and specialties for efficient pagination.

### 6. Seed the database

Option 1 – Seed via API (requires dev server running):

```bash
npm run dev
# new terminal
curl -X POST http://localhost:3000/api/seed
```

Option 2 – Run the script:

```bash
npm run seed
```

### 7. Start the dev server

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
