# Verdant Pages

Verdant Pages is the React frontend for the Gardening Agent system. It is the primary interface through which users interact with Rhizome — managing their garden, tracking tasks, reviewing triage, chatting with the agent, and handling approvals.

## Where it fits

```
Browser → Verdant Pages → Cambium (:8080) → Rhizome (:8001)
```

Verdant talks exclusively to **Cambium** (the Go API gateway). It has no knowledge of Rhizome internals, LangGraph, SQLAlchemy, or Postgres. Cambium owns auth; Rhizome owns domain logic.

## Tech stack

Vite 8 · React 19 · TypeScript (strict) · React Router v7 · TanStack Query v5 · TanStack Table v8 · Pragmatic Drag and Drop · CSS custom properties

## Quick start

```bash
nvm use        # uses .nvmrc — requires Node 24
npm install
npm run dev    # dev server at localhost:5173, proxies /api + /auth to localhost:8080
```

Cambium must be running on `:8080` for API calls to work. The frontend itself can be developed without Cambium for pure UI work.

## Commands

```bash
npm run dev        # Vite dev server with HMR
npm run build      # TypeScript check + production build to dist/
npm run lint       # ESLint
npm run test       # Vitest (watch mode)
npm run test:run   # Vitest (single run — for CI)
npm run test:e2e   # Playwright E2E against localhost:5173
```

## Documentation

Full docs are in [`docs/`](docs/SUMMARY.md):

- [Purpose and design](docs/overview/purpose.md)
- [Getting started](docs/getting-started/setup.md)
- [Architecture](docs/README.md)
- [Testing](docs/development/testing.md)
- [Roadmap](docs/roadmap/overview.md)
- [Current work](docs/current_work/phase1_scaffold.md)

## Related repos

- **Cambium** (`../cambium`) — Go API gateway. Verdant's only backend.
- **Rhizome** (`../rhizome`) — Python domain engine and agent. Never called directly from Verdant.
- **Fairlead** (`../fairlead`) — Rust inference router. Rhizome talks to it; Verdant has no awareness of it.
