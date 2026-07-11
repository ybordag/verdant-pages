# Frontend Setup

**Last verified:** 2026-07-10

This guide covers Verdant itself. Use [full-stack development](full-stack.md) for Cambium, Rhizome, Postgres, providers, migrations, and fixture data.

## Prerequisites

| Tool | Version/source |
|---|---|
| Node | `.nvmrc` (currently Node 24) |
| npm | bundled with the selected Node version |
| nvm | recommended for switching Node versions |

## Run Modes

| Mode | Services | Suitable work |
|---|---|---|
| UI-only | Vite | Styling, routes, mocked tests, primitives |
| Gateway smoke | Vite + Cambium | Auth and gateway-only behavior; proxied domain calls may return 502 without Rhizome |
| Structured full stack | Vite + Cambium + Rhizome + Postgres | Domain reads/writes and deterministic fixture flows |
| Live agent | Full stack + provider configuration | Chat, triage, drafting, and other model-backed flows |

## Install

```bash
nvm install  # only when the .nvmrc version is missing
nvm use
npm ci
cp .env.example .env
```

For normal local development, leave `VITE_CAMBIUM_URL` empty. Vite proxies `/api` and `/auth` to `http://localhost:8080`.

Set `VITE_CAMBIUM_URL` only when the frontend must call a separately hosted Cambium origin.

## Run

```bash
npm run dev
```

Open `http://localhost:5173`. Vite hot-reloads React and CSS changes.

Cambium health is `http://localhost:8080/health`. Vite does not proxy `/health`, so `http://localhost:5173/health` is not the backend health check.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | TypeScript project build plus Vite production bundle |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | ESLint |
| `npm run test` | Vitest watch mode |
| `npm run test:run` | Vitest single run |
| `npm run test:e2e` | Playwright suite |

## Production Bundle

```bash
npm run build
```

The output is `dist/`. Cambium can serve this directory with SPA fallback when `STATIC_DIR` points to it. Production deployment and hardening remain Phase 9 work.

## Troubleshooting

| Symptom | Check |
|---|---|
| Vite says Node is unsupported or `CustomEvent` is missing | Run `nvm use`; confirm `node --version` matches `.nvmrc` |
| API connection refused | Start Cambium and check `curl http://localhost:8080/health` |
| API returns 502 | Cambium is up but Rhizome is not reachable; use `make stack-health` in Cambium |
| Domain tables/routes fail | Confirm Rhizome migrations used the same Postgres URL as the running service |
| Live chat reports missing provider credentials | Configure a supported provider in the backend/user account; see the full-stack guide |
| Styles remain stale after a branch change | Restart Vite; remove `node_modules/.vite` only if the cache is demonstrably stale |
| Playwright cannot start | Check whether another process owns port 5173 and whether Playwright can reuse it |

## Source Map

```text
src/components/   reusable UI and shell
src/lib/api/      typed Cambium clients and request tests
src/lib/types/    frontend DTOs
src/pages/        route-level workflows
src/routes/       router and guards
src/styles/       tokens and global styles
e2e/              Playwright tests and fixtures
docs/             product and engineering documentation
```

Continue with the [codebase tour](../architecture/codebase-tour.md).
