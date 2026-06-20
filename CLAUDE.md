# Verdant Pages — Claude Code Memory

**Last updated:** 2026-06-20

## What this is

Verdant Pages is the React frontend for the Gardening Agent system — the only
surface a user actually lives in. It talks to **Cambium** (the Go API gateway)
— never directly to Rhizome. Rhizome is an internal ClusterIP service
unreachable from outside the cluster.

```
Browser → Verdant Pages → Cambium (:8080) → Rhizome (:8001) → Fairlead
```

This file is the fast-orientation doc — invariants, current status, where
things live. For *why* things are built this way, see
[docs/overview/purpose.md](docs/overview/purpose.md) (design principles,
ownership boundaries) and [docs/README.md](docs/README.md) (full doc index).

## Related repos

All siblings under the same parent directory:

| Repo | Role | Verdant's relationship to it |
|---|---|---|
| `../cambium` | Go API gateway — auth, versioned JSON API | Verdant's *only* backend dependency. All calls go through it. |
| `../rhizome` | Python agent + domain engine, Postgres | Never called directly. Cambium absorbs its API surface. |
| `../fairlead` | Rust inference router (vLLM) | No awareness of this at all — it's behind Rhizome. |

## Build + run commands

```bash
npm install
npm run dev        # Vite dev server (proxies /api + /auth to Cambium), localhost:5173
npm run build      # tsc -b + production build to dist/
npm run lint       # ESLint
npm run test       # Vitest, watch mode
npm run test:run   # Vitest, single run (CI)
npm run test:e2e   # Playwright, Chromium, auto-starts dev server
```

No other services needed for pure UI work — just Cambium running on `:8080` for real API calls. See [docs/getting-started/quickstart.md](docs/getting-started/quickstart.md) for the fast path or [setup.md](docs/getting-started/setup.md) for the full walkthrough + troubleshooting.

Requires **Node 24** (`.nvmrc`) — `nvm use` before anything else. A stale Node 18 shell produces a `node:util`/`styleText` error from Vitest, not an obviously-Node-related one.

## Environment

```
VITE_CAMBIUM_URL=  # empty = use Vite proxy; set to full URL for production
```

## Project layout

```
src/
├── components/
│   ├── primitives/   Generic UI atoms (Button, Input, Modal, ...) — no domain knowledge
│   └── shell/        AppShell, AppNav, NotificationDrawer, Toast, Breadcrumb
├── lib/
│   ├── api/          client.ts + auth.ts built; domain modules (garden.ts, tasks.ts, ...) — EMPTY, Phase 4 follow-up
│   ├── auth/         AuthContext, useAuth — built, Phase 4
│   ├── query/        still EMPTY — QueryClientProvider is wired directly in App.tsx instead
│   ├── sse/          consumeSSEStream() — EMPTY, needed Phase 4/6
│   └── theme/        ThemeProvider — built, Phase 2
├── pages/            One file per route, 27 stubs today — built out per docs/pages/*.md, Phase 5+
├── routes/           router.tsx, ProtectedRoute.tsx
├── styles/           tokens.css (single source of truth), global.css, utilities.css
└── test/             Vitest setup.ts
e2e/                  Playwright specs
docs/                 Architecture decisions, page designs, roadmap — see docs/README.md
```

`lib/api`, `lib/auth`, `lib/query`, `lib/sse` being empty is not an oversight —
see [docs/development/deferred-work.md](docs/development/deferred-work.md).

## Current status

| Phase | Name | Status |
|---|---|---|
| 1 | Scaffold + build tooling | complete |
| 2 | Tokens + theme + fonts | complete |
| 3 | Primitives + app shell | complete (current — `cedar` branch) |
| 4 | Auth + API client | in progress — auth core done, domain modules next |
| 5a–5e | Feature pages | not started |
| 6a–6c | Today / Incidents / Agent chat | blocked on rhizome#120 P1 |

Full detail: [docs/roadmap/overview.md](docs/roadmap/overview.md). Per-phase build records: [docs/current_work/](docs/current_work/).

## Known issues / deferred work

Untested primitives, empty `lib/` dirs, unwired `NotificationDrawer`/`Toast`,
and the offline-banner/SSE-retry UI specified in `error-handling.md` are all
*intentional* deferrals with documented re-enable conditions — see
[docs/development/deferred-work.md](docs/development/deferred-work.md) before
assuming any of these is a bug.

## Architecture

SPA: Vite + React 18 + TypeScript + React Router v7.
Auth: JWT access token in-memory (module variable), refresh token in httpOnly cookie.
      On every page load, POST /auth/refresh runs before the app renders.
Server state: TanStack Query v5.
Styling: CSS custom properties (src/styles/tokens.css).
Tables: TanStack Table v8.
Drag and drop: Pragmatic Drag and Drop (not @dnd-kit).

Error handling contract (status codes, network failure, SSE drops →
UI behavior) is fully specified in
[docs/development/error-handling.md](docs/development/error-handling.md).

## Invariants — never violate

- **The frontend calls Cambium, never Rhizome directly.** All endpoints are under
  Cambium's /api/v1 or /auth. There is no direct Rhizome URL in this repo.
- **Never use EventSource for SSE.** Chat streaming uses fetch + ReadableStream
  because Cambium requires Authorization: Bearer in the header.
- **Token in Authorization header, never in query params.** JWT in a URL
  leaks in browser history, server logs, and Referer headers.
- **apiFetch handles 401.** All API calls go through src/lib/api/client.ts.
  Never call fetch() directly in page components.
- **No inline styles for tokens.** Use CSS custom properties. Don't hardcode
  color values in components — reference var(--chartreuse) etc.
- **Port the design, don't restyle.** Tokens and font choices come from the
  prototype. Changes to the visual language need explicit sign-off.
- **Access token is in-memory only.** Never write it to localStorage,
  sessionStorage, or any cookie. It lives in a module variable in client.ts.
- **No drawers.** The notification drawer is the only drawer in the app.
  All other creation/editing flows use dedicated /new pages or inline interactions.

## Key files

src/styles/tokens.css          — ALL design tokens (both themes). Single source of truth.
src/lib/api/client.ts          — Base fetch wrapper, in-memory token, 401 handling, refresh retry.
src/lib/auth/context.tsx       — AuthContext, useAuth hook.
src/lib/sse/stream.ts          — consumeSSEStream() async generator.
src/routes/router.tsx          — All routes.
src/routes/ProtectedRoute.tsx  — Auth guard.
docs/                          — Architecture decisions and page design docs.

## Where to start

Read docs/architecture/build-phases.md for the full phased plan.
The architecture docs in docs/architecture/ cover every decision made.
The page designs in docs/pages/ cover every page in the app.
docs/README.md explains how the whole docs/ tree is organized if you're lost.
