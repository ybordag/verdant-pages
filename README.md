# Verdant Pages

Verdant Pages is the React frontend for the Gardening Agent system. It is the primary interface through which users interact with Rhizome — managing their garden, tracking tasks, reviewing triage, chatting with the agent, and handling approvals.

## Where it fits

```
Browser → Verdant Pages → Cambium (:8080) → Rhizome (:8001)
```

Verdant talks exclusively to **Cambium** (the Go API gateway). It has no knowledge of Rhizome internals, LangGraph, SQLAlchemy, or Postgres. Cambium owns auth; Rhizome owns domain logic.

## Tech stack

Vite 8 · React 19 · TypeScript (strict) · React Router v6 · TanStack Query v5 · TanStack Table v8 · Pragmatic Drag and Drop · CSS custom properties

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

Full docs are in [`docs/`](docs/README.md), which also explains how the docs tree itself is organized:

- [Purpose and design](docs/overview/purpose.md)
- [Quickstart](docs/getting-started/quickstart.md) · [full setup](docs/getting-started/setup.md)
- [Codebase tour](docs/architecture/codebase-tour.md) · [architecture index](docs/README.md)
- [Testing](docs/development/testing.md) · [error handling](docs/development/error-handling.md) · [deferred work](docs/development/deferred-work.md)
- [Roadmap](docs/roadmap/overview.md)

## Related repos

- **Cambium** (`../cambium`) — Go API gateway. Verdant's only backend.
- **Rhizome** (`../rhizome`) — Python domain engine and agent. Never called directly from Verdant.
- **Fairlead** (`../fairlead`) — Rust inference router. Rhizome talks to it; Verdant has no awareness of it.
