# Setup

**Last updated:** 2026-06-20

How to run Verdant Pages locally. For the condensed version, see [quickstart.md](quickstart.md).

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 24+ (LTS "Krypton") | Runtime — see `.nvmrc` |
| nvm | any | Node version management |
| npm | 11+ (ships with Node 24) | Package management |
| Cambium | running on `:8080` | API gateway — needed for all API calls |

Verdant can be developed for pure UI work without Cambium running. API calls will fail but the dev server and component rendering work independently.

---

## 1. Install the right Node version

The project requires Node 24 (Node 20 is past EOL as of April 2026). A `.nvmrc` file is included:

```bash
nvm install   # first time — downloads Node 24
nvm use       # subsequent runs — switches to .nvmrc version
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment

```bash
cp .env.example .env
```

For local development, `.env` can be left empty — the Vite proxy handles routing to Cambium.

```
# .env.example
VITE_CAMBIUM_URL=
```

`VITE_CAMBIUM_URL` is only needed for production builds where the app is not served same-origin as Cambium. Leave it empty locally.

---

## 4. Start Cambium (for API calls)

If you need real API data, Cambium must be running. See [`../cambium/docs/getting-started/setup.md`](../../../cambium/docs/getting-started/setup.md) for full instructions. The short version:

```bash
cd ../cambium
go run ./cmd/server/
# → listening on :8080
```

Rhizome must also be running on `:8001` for Cambium to proxy agent and data requests.

---

## 5. Start the dev server

```bash
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api` and `/auth` to `http://localhost:8080` (Cambium). No CORS configuration needed — it's all same-origin from the browser's perspective.

HMR is enabled — changes to React components and CSS update the browser without a full reload.

---

## 6. Verify

Open `http://localhost:5173`. You should see "Verdant Pages".

If Cambium is running, open the browser console and run:

```js
fetch('/health').then(r => r.json()).then(console.log)
// → {"status":"ok"}
```

---

## Running tests

**Unit and component tests (Vitest):**

```bash
npm run test        # watch mode — for development
npm run test:run    # single run — for CI
```

Tests run in jsdom and do not require Cambium. They cover component rendering, hook behaviour, and utility functions.

**E2E tests (Playwright):**

```bash
npm run test:e2e
```

Playwright auto-starts the Vite dev server if it isn't already running. Tests run in Chromium headless. Full E2E tests that hit real API endpoints require Cambium and Rhizome to be running.

---

## Production build

```bash
npm run build
# → dist/
```

TypeScript compiles first (`tsc -b`), then Vite bundles. The `dist/` output is served by Cambium as static files in production — see [`docs/architecture/build-phases.md`](../architecture/build-phases.md) (Phase 8) for the deploy process.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `nvm use` fails with "no such version" | Node 24 not installed yet | `nvm install` first, then `nvm use` |
| API calls return connection refused | Cambium isn't running | Start it per step 4 above — the frontend itself runs fine without it, but `/api`/`/auth` calls will fail |
| `npm run test:e2e` hangs on startup | Port `5173` already in use by another `npm run dev` | Stop the other dev server, or let Playwright reuse it (it detects an already-running server) |
| Vitest fails with a `node:util` / `styleText` error | Wrong Node version active in this shell | Re-run `nvm use` — Node 18 (the system default in some shells) doesn't support what Vite/Vitest need |
| Styles look wrong after pulling new changes | Stale Vite cache | `rm -rf node_modules/.vite` and restart `npm run dev` |

---

## Project layout

```
verdant-pages/
├── src/
│   ├── components/     UI primitives and composed components
│   ├── lib/
│   │   ├── api/        API modules + base fetch client
│   │   ├── auth/       AuthContext, useAuth hook
│   │   ├── query/      QueryClient setup
│   │   └── sse/        SSE stream consumer
│   ├── pages/          Page components (one per route)
│   ├── routes/         Router definition, ProtectedRoute
│   ├── styles/         tokens.css, global.css, utilities.css
│   ├── test/           Vitest setup (setup.ts)
│   └── App.tsx
├── e2e/                Playwright E2E tests
├── docs/               This documentation
├── public/             Static assets (favicon, icon sprite)
├── CLAUDE.md           Invariants and build commands for Claude Code
├── playwright.config.ts
├── vite.config.ts
└── .nvmrc              Node 24
```
