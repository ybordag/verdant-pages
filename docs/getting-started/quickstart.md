# Quickstart

**Last verified:** 2026-07-10

## UI-Only

Use this for styling, routing, mocked browser tests, and component work:

```bash
nvm use
npm ci
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Real API requests will fail unless Cambium is running.

## Full Local Stack

After configuring the sibling repositories, start the backend from Cambium:

```bash
cd ../cambium
make dev-stack-db
```

In another terminal:

```bash
cd ../verdant-pages
nvm use
npm run dev
```

Verify both backend services:

```bash
cd ../cambium
make stack-health
```

Read [full-stack development](full-stack.md) before first setup, migrations, provider configuration, or fixture seeding. Read [setup](setup.md) for frontend environment details and troubleshooting.

## Checks

```bash
npm run test:run
npm run lint
npm run build
npm run test:e2e
```

The default browser suite starts/reuses Vite. Individual specs may use mocked routes, create real accounts, or require an explicitly enabled live backend mode; read [testing](../development/testing.md) before assuming the whole suite is backend-free.
