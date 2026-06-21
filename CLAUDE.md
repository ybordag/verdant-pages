# Verdant Pages — Claude Code Memory

**Last updated:** 2026-06-21

This file is updated continuously as work happens, not just at phase boundaries — the "Currently working on" section below is the live record of what's in flight. There's no separate `docs/current_work/` history folder; `docs/roadmap/overview.md` carries the full per-phase plan and build record, and this file is the fast day-to-day pointer into it.

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
│   ├── api/          client.ts + auth.ts built. 15/16 domain modules built (garden, plants,
│   │                 tasks, calendar, shopping, search, alerts, notifications, interactions,
│   │                 chat, triage, weather, incidents, projects, activity) — see docs/development/deferred-work.md
│   │                 for what's still blocked and which individual functions are intentionally
│   │                 omitted
│   ├── auth/         AuthContext, useAuth — built, Phase 4
│   ├── connectivity/ Offline detection (reportNetworkFailure/Success, useConnectivity) — built
│   ├── query/        createQueryClient() — custom retry (skips ApiError, retries network
│   │                 failures with a toast per attempt) — built
│   ├── sse/          consumeSSEStream() + consumeNotificationStream() — built
│   ├── theme/        ThemeProvider — built, Phase 2
│   └── toast/        toastStore — generic module-level toast store — built
├── pages/            One file per route, 27 stubs today — built out per docs/pages/*.md, Phase 5+
├── routes/           router.tsx, ProtectedRoute.tsx
├── styles/           tokens.css (single source of truth), global.css, utilities.css
└── test/             Vitest setup.ts
e2e/                  Playwright specs
docs/                 Architecture decisions, page designs, roadmap — see docs/README.md
```

See [docs/development/deferred-work.md](docs/development/deferred-work.md)
for the remaining `lib/api` endpoint-level deferrals.

## Current status

| Phase | Name | Status |
|---|---|---|
| 1 | Scaffold + build tooling | complete |
| 2 | Tokens + theme + fonts | complete |
| 3 | Primitives + app shell | complete |
| 4 | Auth + API client | in progress (`birch` branch) — auth core + 15/16 domain modules + SSE streaming built |
| 5 | Chat and context (Agent chat, Today, Incidents, Activity) | not started — no real blockers |
| 6 | Tasks and projects (Tasks, Calendar, Projects) | not started — no real blockers |
| 7a–7b | Garden hub & objects, Plants | not started — no blockers |
| 8 | App polish (Settings, Notifications, deploy) | not started — no blockers |

Renumbered 2026-06-21 — the old 5a–5e/6a–6c/7/8 split is gone; see [docs/roadmap/overview.md](docs/roadmap/overview.md) for why and the full per-phase detail, including what shipped along the way.

## Currently working on

- Phase 4 domain modules: 15/16 built (`garden`, `plants`, `tasks`, `calendar`, `shopping`, `search`, `alerts`, `notifications`, `interactions`, `chat`, `triage`, `weather`, `incidents`, `projects`, `activity`). `projects.ts`/`activity.ts` landed 2026-06-21 after rhizome#134/#137 were verified and closed. `media.ts` remains blocked on rhizome#117.
- [rhizome#140](https://github.com/ybordag/rhizome/issues/140) closed (verified — code review, tests, live curl checks) — unblocked almost every previously-omitted function in `garden.ts`/`plants.ts`/`tasks.ts`: `updateGardenProfile`, `updateBed`, `createContainer`, `updateContainer`, `getPlant`, `createPlant`, `updatePlant`, `createPlantBatch`, `batchUpdatePlants`, `updateTask`, plus per-entity activity feeds (`getBedActivity`, `getContainerActivity`, `getPlantActivity`, `getBatchActivity`, `getTaskActivity`) and `updateTaskSeries`. `listTasksBlocked` and `batchRemovePlants` are now also built against structured backend responses, so the small structured endpoint cleanup bucket is closed.
- [rhizome#141](https://github.com/ybordag/rhizome/issues/141) (streaming chat 200'd with zero bytes for every provider — sync-only LangGraph checkpointer) and [rhizome#135](https://github.com/ybordag/rhizome/issues/135) (incidents/treatment-plan structured JSON) are both fixed, live-verified against the running stack, and closed (2026-06-21). Note: the live stream still shows a duplicate-reply quirk, tracked separately as [rhizome#142](https://github.com/ybordag/rhizome/issues/142) — doesn't block building Phase 5's agent chat, just don't be surprised by it.
- Offline banner + retry-visibility toasts built (2026-06-21): `lib/connectivity`, `lib/toast`, `lib/query` now hold real code. The notification-stream auto-reconnect-with-backoff that `error-handling.md` previously claimed was built actually wasn't (`stream.ts` had no reconnect logic) — corrected; it's spec'd, scheduled for Phase 8 (its only real dependency, rhizome#130, is closed). The chat SSE manual-retry button is also still deferred — documented in `docs/pages/05-agent.md`'s "Connection handling" section, but there's no chat UI yet to attach it to (that's Phase 5).
- Roadmap re-planned 2026-06-21: most of the structured-JSON backlog (#132's split) closed since the original 5a–5e/6/7/8 phase plan was written, so phases were regrouped around product usability instead of backend-unblock order. See [docs/roadmap/overview.md](docs/roadmap/overview.md).
- Latest verification: `npm run lint`, `npm run test:run` (317 tests), and `npm run build` all pass on Node 24.

## Known issues / deferred work

Untested primitives, empty `lib/` dirs, unwired `NotificationDrawer`/`Toast`,
and the offline-banner/SSE-retry UI specified in `error-handling.md` are all
*intentional* deferrals with documented re-enable conditions — see
[docs/development/deferred-work.md](docs/development/deferred-work.md) before
assuming any of these is a bug.

## Architecture

SPA: Vite + React 19 + TypeScript + React Router v6.
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
src/lib/sse/stream.ts          — consumeSSEStream() + consumeNotificationStream() async generators.
src/routes/router.tsx          — All routes.
src/routes/ProtectedRoute.tsx  — Auth guard.
docs/                          — Architecture decisions and page design docs.

## Where to start

Read docs/roadmap/overview.md for the full phased plan.
The architecture docs in docs/architecture/ cover every decision made.
The page designs in docs/pages/ cover every page in the app.
docs/README.md explains how the whole docs/ tree is organized if you're lost.
