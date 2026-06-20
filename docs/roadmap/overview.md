# Roadmap

## How we work

Work is organised into **phases** — each phase has a clear deliverable and a smoke test. Phases 1–4 are sequential. Phases 5a–5e are independent and can run in parallel. Phase 6 is blocked on a Rhizome backend dependency.

Active phase work gets a doc in `docs/current_work/`. Completed phase docs stay there as a record.

---

## Phase status

| Phase | Name | Status | Branch |
|---|---|---|---|
| 0 | Pre-build setup | **complete** | — |
| 1 | Scaffold + build tooling | **complete** | `willow` |
| 2 | Tokens + theme + fonts | not started | — |
| 3 | Primitives + app shell | not started | — |
| 4 | Auth + API client foundation | not started | — |
| 5a | Garden objects | not started | — |
| 5b | Tasks | not started | — |
| 5c | Projects | not started (partial blockers) | — |
| 5d | Calendar | not started (partial blockers) | — |
| 5e | Activity | not started | — |
| 6a | Today page | blocked on rhizome#120 P1 | — |
| 6b | Incidents | blocked on rhizome#120 P1 | — |
| 6c | Agent chat (SSE) | blocked on rhizome#120 P1 | — |
| 7 | Feature backfill | ongoing as backend issues close | — |
| 8 | Polish + deploy | not started | — |

---

## Phase 0 — Pre-build setup ✅

- CLAUDE.md written to repo root
- Confirmed Cambium runs on `:8080`
- Confirmed Rhizome runs on `:8001`
- Confirmed test user exists

---

## Phase 1 — Scaffold + build tooling ✅

**Deliverable:** Project boots, proxies to Cambium, TypeScript compiles clean.

Done:
- Vite 8, React 19, TypeScript strict mode
- Vite proxy: `/api` + `/auth` → `localhost:8080`
- `@/` path alias
- `react-router-dom`, `@tanstack/react-query`, `@tanstack/react-table` installed
- Prettier, ESLint
- `.env.example`, `.nvmrc` (Node 24)
- Empty `src/styles/`, `src/lib/`, `src/components/`, `src/pages/`, `src/routes/`
- `App.tsx` renders `<div>Verdant Pages</div>`
- **Vitest + @testing-library/react** — unit/component test scaffold
- **Playwright** — E2E scaffold with Chromium
- Smoke tests passing: App renders, `npm run build` clean

---

## Phase 2 — Tokens + theme + fonts

**Deliverable:** Full visual foundation — light/dark toggle works, all fonts load.

- `src/styles/tokens.css` — all CSS variables, both themes, ported from prototype
- `src/styles/global.css` — reset, body, scrollbar, shared keyframes
- `src/styles/utilities.css` — layout and chip utilities
- Google Fonts `<link>` in `index.html`
- `ThemeProvider` — reads/writes `localStorage('vp_theme')`, sets `data-theme` on `<html>`
- App.tsx wrapped in ThemeProvider

**Tests:**
- `ThemeProvider` reads `localStorage` on mount
- `ThemeProvider` toggles `data-theme` between `dark` and `light`
- Token CSS variables resolve (smoke)

---

## Phase 3 — Primitives + app shell

**Deliverable:** Full app shell with navigation, all routes stubbed, all 7 nav items.

Key components: `Button`, `Input`, `Modal`, `Chip`, `AppShell`, `VPNav`, `Breadcrumb`

**Tests:**
- Each primitive renders in all variants
- `Modal` traps focus and closes on Escape
- All 7 nav items render and respond to click
- Route stubs all resolve without crashing

---

## Phase 4 — Auth + API client foundation

**Deliverable:** Login and register work. Protected routes redirect correctly. All API modules typed.

Key files: `src/lib/api/client.ts`, `src/lib/auth/context.tsx`, all `src/lib/api/*.ts` domain modules

**Tests:**
- `apiFetch` attaches `Authorization` header
- 401 response triggers refresh → retry → redirect
- `ProtectedRoute` redirects unauthenticated users to `/login`
- Login / register forms submit and redirect

---

## Phases 5a–5e — Feature pages (parallel)

All require Phase 4 complete. No ordering between 5a–5e.

**5a Garden objects** — beds, containers, plants (list, detail, create, care)  
**5b Tasks** — 6 views, optimistic mutations, velocity strip ← highest priority  
**5c Projects** — planning mode, Gantt, Kanban (partial blockers: expenses #124, shopping #125, Gantt dependencies #121/#122)  
**5d Calendar** — drag-to-reschedule, month/week views (partial blocker: annotations #114)  
**5e Activity** — global feed with filtering and infinite scroll

---

## Phase 6 — Today, Incidents, Agent chat

**Blocked on:** rhizome#120 P1 — `TriageSnapshotView`, `WeatherSnapshotView`, `InteractionEnvelopeView`, `IncidentView`, `ThreadView` must land first.

**6a** Today page  
**6b** Incidents + treatment plans  
**6c** Agent chat with SSE streaming ← the user's milestone

---

## Phase 7 — Feature backfill

Each item is independent. Build in any order as backend issues close.

| Feature | Blocks on |
|---|---|
| Context search + pinned context | rhizome#126 + #127 |
| Care recording quick actions | rhizome#128 |
| Full Gantt dependency drag | rhizome#121 + #122 |
| Project expenses | rhizome#124 |
| Shopping list | rhizome#125 |
| Media gallery | rhizome#117 |
| Garden map | rhizome#118 |
| Calendar annotations | rhizome#114 |
| Notification drawer + toasts | rhizome#130 |
| Task series CRUD | rhizome#113 |

---

## Phase 8 — Polish + deploy

- Code splitting (`React.lazy` + `Suspense`)
- Accessibility audit
- Lighthouse baseline
- Self-hosted fonts
- Cambium static file handler (cambium#21)
- Deploy to spark-thor

---

## Dependency map

```
Phase 1 (scaffold)
  └── Phase 2 (tokens)
        └── Phase 3 (shell)
              └── Phase 4 (auth + API client)
                    ├── Phase 5a (garden objects)
                    ├── Phase 5b (tasks) ← priority
                    ├── Phase 5c (projects)
                    ├── Phase 5d (calendar)
                    └── Phase 5e (activity)
                          └── [wait for rhizome#120 P1]
                                ├── Phase 6a (today)
                                ├── Phase 6b (incidents)
                                └── Phase 6c (agent chat) ← the milestone
```
