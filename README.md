# Ecommerce SaaS Codex

Next.js (App Router) + TypeScript starter scaffold with baseline linting/formatting and environment setup.

## Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose

## 1) Start local dependencies with Docker

Use Docker Compose to run local services (for example, PostgreSQL):

```bash
docker compose up -d
```

If you do not yet have a `docker-compose.yml`, create one for your database/auth dependencies before running the app.

## 2) Configure environment variables

```bash
cp .env.example .env
```

Update `.env` values as needed for your machine.

## 3) Install dependencies

```bash
npm install
```

## 4) Run the Next.js app

```bash
npm run dev
```

Open http://localhost:3000.

## Available scripts

- `npm run dev` - Start Next.js in development mode.
- `npm run build` - Create a production build.
- `npm run start` - Start the production server.
- `npm run lint` - Run ESLint.
- `npm run db:generate` - Placeholder for DB client generation.
- `npm run db:migrate` - Placeholder for DB migrations.
- `npm run db:seed` - Placeholder for DB seed script.
