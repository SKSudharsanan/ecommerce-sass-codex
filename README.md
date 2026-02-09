# Ecommerce SaaS Codex

Next.js (App Router) + TypeScript starter scaffold with Prisma/Postgres persistence and Better Auth role-based routing.

## Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose

## 1) Configure environment variables

```bash
cp .env.example .env
```

Set `BETTER_AUTH_SECRET` to a long random string before running the app.

The local DB setup uses the `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` values from `.env`.

## 2) Start local PostgreSQL with Docker

```bash
npm run db:up
```

This starts the `postgres` service defined in `docker-compose.yml`, exposing PostgreSQL on `localhost:5432` and persisting data in the `postgres_data` named volume.

## 3) Health check and connection flow

1. Confirm the container is running:

   ```bash
   docker compose ps
   ```

2. Inspect service logs (and keep streaming while it initializes if needed):

   ```bash
   npm run db:logs
   ```

3. Verify readiness using the built-in health check:

   ```bash
   docker compose ps postgres
   ```

   Wait until the service reports `healthy`.

4. Connect using `DATABASE_URL` from `.env`:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce
   ```

5. Stop the DB when done:

   ```bash
   npm run db:down
   ```

## 4) Install dependencies

```bash
npm install
```

## 5) Initialize Prisma schema and seed demo data

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The Prisma schema lives in `prisma/schema.prisma` and initial SQL migration files are tracked in `prisma/migrations`.

## 6) Run the Next.js app

```bash
npm run dev
```

Open http://localhost:3000.

## Available scripts

- `npm run dev` - Start Next.js in development mode.
- `npm run build` - Create a production build.
- `npm run start` - Start the production server.
- `npm run lint` - Run ESLint.
- `npm run db:up` - Start local Docker services in detached mode.
- `npm run db:down` - Stop and remove local Docker services.
- `npm run db:logs` - Stream PostgreSQL logs.
- `npm run db:generate` - Generate the Prisma client.
- `npm run db:migrate` - Run interactive Prisma dev migrations.
- `npm run db:migrate:deploy` - Apply committed migrations in CI/production.
- `npm run db:seed` - Seed demo catalog data for supermarket, clothes, and medicines templates.
