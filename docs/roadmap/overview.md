# Roadmap

**Last updated:** 2026-06-21

## How we work

Work is organised into **phases** — each phase has a clear deliverable and a smoke test. Phases 1–4 are sequential. Phases 5a–5e are independent and can run in parallel. Phase 6 is blocked on a Rhizome backend dependency.

This file is the single source of truth for phase planning and status — what to build, in what order, and what's actually done versus still planned. There's no separate per-phase history doc; as a phase completes, this file's entry for it is updated in place to describe what actually shipped (including any bugs found and fixed along the way), rather than just what was originally planned.

---

## Phase status

| Phase | Name | Status | Branch |
|---|---|---|---|
| 0 | Pre-build setup | **complete** | — |
| 1 | Scaffold + build tooling | **complete** | `willow` |
| 2 | Tokens + theme + fonts | **complete** | `aspen` |
| 3 | Primitives + app shell | **complete** | `cedar` |
| 4 | Auth + API client foundation | **in progress** — auth core + 12/16 domain modules + SSE streaming done; live-tested against real backend, found rhizome#141 | `birch` |
| 5a | Garden objects | not started | — |
| 5b | Tasks | not started | — |
| 5c | Projects | not started (partial blockers) | — |
| 5d | Calendar | not started (partial blockers) | — |
| 5e | Activity | not started | — |
| 6a | Today page | blocked on rhizome#120 P1 | — |
| 6b | Incidents | blocked on rhizome#120 P1 | — |
| 6c | Agent chat (SSE) | blocked on rhizome#120 P1 + rhizome#141 | — |
| 7 | Feature backfill | ongoing as backend issues close | — |
| 8 | Polish + deploy | not started | — |

---

## Phase 0 — Pre-build setup ✅

Before writing any application code.

- CLAUDE.md written to repo root
- Confirmed Cambium runs on `:8080`
- Confirmed Rhizome runs on `:8001`
- Confirmed test user exists (`POST /auth/register` once)

**Done when:** `curl http://localhost:8080/health` returns `{"status":"ok"}`

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

**Smoke test:** `npm run dev` starts without errors; `fetch('/health')` from the browser console returns `{"status":"ok"}`; `npm run build` produces a clean dist; App renders, `npm run build` clean.

---

## Phase 2 — Tokens + theme + fonts ✅

**Deliverable:** Full visual foundation — light/dark toggle works, all four fonts load.

- `src/styles/tokens.css` — full token system, port verbatim from the prototype study (now [`design/mockups/base/typography-and-surfaces.html`](../design/mockups/base/typography-and-surfaces.html)): inkwell/vellum scale, RGB channel variables, border radius scale, display variation tokens, semantic surface/text/line tokens for both themes
- `src/styles/global.css` — reset, body, scrollbar, shared keyframes (`pIn`, `vsA`, `acceptGlow`)
- `src/styles/utilities.css` — layout and chip utilities (`.dg`, `.gg`, `.chip`, `.hr`, `.cd`, `.nb`)
- Google Fonts `<link>` in `index.html` — Shantell Sans, Caveat, Nunito, Montserrat
- `ThemeProvider` — reads/writes `localStorage('theme')`, sets `data-theme` on `<html>`, defaults to dark
- `App.tsx` wrapped in `ThemeProvider`

**Smoke test:** Toggle switches between dark (`#181510`) and light (`#FAF6EE`) backgrounds; Shantell Sans, Caveat, Nunito, Montserrat all render visibly different.

**Tests:** 9 unit (ThemeProvider) + 3 E2E (default dark, toggle to light, persistence on reload) — folded into the broader suite in Phase 3.

---

## Phase 3 — Primitives + app shell ✅

**Deliverable:** Full app shell with navigation, all 7 nav items, collapse behavior, theme toggle, all routes stubbed.

**Primitives:** `Button` (primary/ghost/danger, sm/md), `Input`, `Select`, `Textarea`, `Chip` (with optional remove), `FieldLabel`, `Modal` (focus-trapped, Escape closes), `InlinePopover`, `StatusBadge`, `ProgressBar`

**Shell:** `AppShell` (renamed from `VPNav` for genericness), `AppNav` — all 7 nav items with icons, badge slots, collapse to 52px, pending-state color dim; `QuickActionsPanel`, `GardenProfileCard`, `NavFooter` (avatar placeholder, theme toggle, notification bell), `NotificationDrawer`/`Toast` empty shells (wired in Phase 7), `Breadcrumb`

**Router:** all routes from [routes.md](../architecture/routes.md), 27 page stubs, `ProtectedRoute` (passthrough until Phase 4)

**Smoke test:** All 7 nav items render with correct icons/labels and clicking each changes active state and renders the stub; collapse to 52px shows only icons with pending-state color dim; nav badge slots render; `GardenProfileCard`/`QuickActionsPanel` visible and positioned correctly.

**Tests:** 30 total (20 unit + 10 E2E) covering all 7 nav items, collapse/expand + persistence, pending-badge "lit icon" state, route navigation, notification drawer, theme toggle, Toast and Breadcrumb component behavior.

---

## Phase 4 — Auth + API client foundation 🚧 in progress (`birch`)

**Deliverable:** Login and register work against the real Cambium API. Protected routes redirect correctly. Proactive token refresh runs. All API modules are written and typed.

**Done so far — auth core, verified end-to-end against a real Cambium instance:**
- `LandingPage` — public marketing page at `/` (wordmark, tagline, GitHub link, theme toggle, Login/Sign Up)
- `src/lib/api/client.ts` — `apiFetch`, `ApiError`, in-memory token store, 401→refresh→retry. A 401 only triggers refresh when a token was actually attached, so a bad-login 401 surfaces as a normal `ApiError` instead of looping into the refresh/redirect path. Concurrent 401s share one in-flight refresh instead of racing two — refresh tokens rotate on every use, so two simultaneous refreshes would otherwise race and the loser would fail, forcing a spurious logout on an otherwise-healthy session.
- `src/lib/api/auth.ts` — `login`, `register`, `logout`, `tryRefreshToken`, `getSession`
- `src/lib/auth/context.tsx` — `AuthProvider`, `useAuth`; silent refresh on mount, `setInterval` proactive refresh every 12 minutes, `visibilitychange` refresh-if-stale
- `ProtectedRoute` / `PublicOnlyRoute` — real check, redirects to `/login` when unauthenticated (or to `/app/today` when already authenticated and hitting `/login`/`/register`), shows a loading state while resolving
- `AuthLayout`, `LoginPage`, `RegisterPage` — real forms wired to `useAuth().login`/`.register`, inline error messages for 401 (bad credentials) / 409 (email taken) / generic failure. Registration is intentionally public — obscurity is the gate for now; revisit if the project becomes more public.
- A "Log out" button landed in `AppNav`'s footer
- `QueryClientProvider` wired into `App.tsx`
- Vite proxy confirmed working end-to-end against real Cambium (manual `curl` + full Playwright suite)
- `ThemeToggle` extracted into a shared primitive, used by `AppNav`, `LandingPage`, and `AuthLayout`
- Password strength meter on `RegisterPage` — 4-bar indicator enforcing length, letters+numbers, uppercase, special-character requirements
- Fixed a real StrictMode bug in `context.tsx`: the mount effect was double-invoked in dev, firing `/auth/refresh` twice and racing one cookie rotation against the other's revoke. Fixed with a `hasMountedRef` guard; regression test added under `<StrictMode>`.
- Tests: full suite now 229 unit + 19 E2E, all passing against a live Cambium instance. `auth.spec.ts` covers register→logout→login, direct login, wrong-password rejection, registering an already-taken email, and the unauthenticated-redirect case.

**Domain modules — 12/16 built:** `garden.ts`, `plants.ts`, `tasks.ts`, `calendar.ts`, `shopping.ts`, `search.ts`, `alerts.ts`, `notifications.ts`, `interactions.ts`, `chat.ts`, `triage.ts`, `weather.ts`, plus `src/lib/types/rhizome.ts`. Built only against endpoints confirmed (by reading `agent/api/routers.py` directly) to return real structured JSON — see [deferred-work.md](../development/deferred-work.md) for the exact list of individually-omitted functions where a specific endpoint is still string-wrapped. `triage.ts`/`weather.ts` landed last, after independently verifying rhizome#133 (code review + a from-scratch happy-path test) rather than trusting the closed-issue label at face value.

**`src/lib/sse/stream.ts` is also built** (`consumeSSEStream`, `consumeNotificationStream`), unblocking `chat.ts`'s `streamChat`/`streamResume` and `notifications.ts`'s `streamNotifications`. Both accept an optional `AbortSignal` for client-side cancellation (logout, route change, unmount) — added after a coverage audit found there was previously no way to cancel an open stream.

**Live-verified against the real stack:** ran the actual SSE wire-parsing logic against running Cambium → Rhizome with two providers (default `google_genai`, explicit `openai`) — both failed identically with a real backend bug (LangGraph's checkpointer is wired sync-only, but the streaming endpoints need its async interface). Filed as [rhizome#141](https://github.com/ybordag/rhizome/issues/141). Non-streaming chat against the same thread/provider worked fine, confirming the bug is specific to the streaming path. Also found and fixed two frontend bugs during this pass: `stream.ts` sent the literal header `Bearer null` when logged out instead of omitting it, and there was no way to cancel an open stream at all.

229 total tests (101 new this pass).

**rhizome#140 closed — garden/plants/tasks CRUD writes + remaining activity feeds, verified before closing (code review, 50 new rhizome tests, full 798-test suite, live curl checks against a running instance — including a real route-ordering bug found and fixed: `PATCH /garden/plants/batch` was unreachable because it was registered after `{plant_id}`).** Unblocked almost everything that was previously omitted from `garden.ts`/`plants.ts`/`tasks.ts`: `updateGardenProfile`, `updateBed`, `createContainer`, `updateContainer`, `getBedActivity`, `getContainerActivity`, `getPlant`, `createPlant`, `updatePlant`, `createPlantBatch`, `batchUpdatePlants`, `getPlantActivity`, `getBatchActivity`, `updateTask`, `getTaskActivity`, `updateTaskSeries` — all now built, typed, tested, and live-verified against a running instance. New types: `ActivityEventView`, `ActivitySubjectView`, `PlantBatchResultView`; corrected a few existing request types (`CreateContainerRequest`, `CreatePlantRequest`, `UpdateTaskRequest`, `UpdateTaskSeriesRequest`) against the actual rhizome tool signatures.

245 total tests (16 new this pass).

**Coverage audit (2026-06-21):** cross-referenced every exported function in all 16 domain modules against its test file — full coverage confirmed, no gaps. Found and closed two real component-level gaps that had nothing to do with the recent backend work:
- `NotificationDrawer` had a `useEffect`-registered Escape-key listener with zero test coverage (the classic stale-closure/missed-cleanup bug shape) — E2E only covered open + close-via-button. New `NotificationDrawer.test.tsx` (8 tests) covers Escape, backdrop-click, click-inside-doesn't-close, and listener cleanup on unmount.
- `PasswordStrengthMeter`'s own rendering (bar count, color level, Weak/Fair/Good/Strong label, per-requirement met/unmet) was only indirectly exercised once through `RegisterPage.test.tsx`'s single "Strong" assertion — the scoring logic itself (`passwordStrength.ts`) was well-tested, but the component's render branches weren't. New `PasswordStrengthMeter.test.tsx` (6 tests) covers all four strength levels plus per-requirement met/unmet state.

259 total tests (14 new this pass).

**Still omitted:** `listTasksBlocked` (`GET /tasks/blocked`) and `batchRemovePlants` (`PATCH /garden/plants/batch/remove`) — different, smaller endpoints #140 didn't cover, still string-wrapped. `getTriageRecommendations` stays omitted — the route doesn't exist server-side at all.

**Not started:**
- `projects.ts`, `incidents.ts`, `activity.ts` — blocked on rhizome backend work (structured-JSON gaps, tracked as rhizome issues split by feature: #134/#135/#137). Note `GET /projects/{id}/activity` is already structured per #140 — pick it up once `projects.ts` itself gets built.
- `media.ts` — genuinely not started in rhizome at all (rhizome#117), separate from the structured-JSON backlog

See [deferred-work.md](../development/deferred-work.md) for the full breakdown of what's deferred and why.

---

## Phase 5a — Garden objects

**Deliverable:** Full garden object pages wired to real data. Create, view, edit, care recording all functional.

**No blockers — all required endpoints are live.**

**Shared components (build first — used by all object pages):** `LedgerTable`, `FilterRail`, `TabNav`, `ObjectDetailHeader`, `CareStateStrip` (log button fires `POST /api/v1/garden/{type}/{id}/care` — rhizome#128, or placeholder until it lands), `ObjectLifecycleTimeline`, `LinkedProjectChips`, `LinkedTasksList`, `ObjectActivityFeed`

**Pages:** `GardenPage` (map placeholder + `ProfilePanel` + `ConstraintsEditor` + tab previews), `BedListPage`/`BedDetailPage`/`BedCreatePage`, `ContainerListPage`/`ContainerDetailPage`/`ContainerCreatePage`, `PlantsPage` (FilterRail + card grid + ledger toggle), `PlantDetailPage`, `PlantCreatePage` (`WizardShell` 4-step wizard)

Full page-level spec: [pages/02-garden.md](../pages/02-garden.md), [pages/03-garden-objects.md](../pages/03-garden-objects.md).

**Smoke test:** List all plants → real data, sortable columns; click a plant → detail page with care state, lifecycle dates; "Log watering" → care state strip updates; create a new bed → appears in list; filter beds by location → filters correctly.

---

## Phase 5b — Tasks

**Deliverable:** Tasks page fully operational across all 6 views with real data, optimistic mutations, and velocity tracking.

**No blockers.**

**Shared components:** `TaskRow` (type markers, source colours, hover actions), `TaskGroup` (section header + rows), `DetailPanel` (right slide-in), `VelocityStrip` (uses `GET /api/v1/activity/stats` ✅)

**Pages:** `TasksPage` (all 6 views — Today, Week, Project, Kind, Area, Progress — with FilterRail), `TaskDetailPage`, `TaskCreatePage` (`WizardShell` 3-step + quick inline mode), `TaskSeriesPage` (series rule editor)

**Key interactions:** Complete → optimistic strike-through → `POST .../complete`; Defer → `InlinePopover` date picker → `POST .../defer`; Skip → `InlinePopover` reason → `POST .../skip`; Create → `POST /api/v1/tasks` ✅; Velocity strip reads `GET /api/v1/activity/stats` ✅

**Smoke test:** Today view shows prioritised task list; completing a task strikes through immediately and reverts if server errors; Progress view shows 14-day completion bar chart; creating a task appears in list with `is_user_modified: true`.

---

## Phase 5c — Projects

**Deliverable:** Projects list and full project detail with planning mode (brief + proposals) and execution mode (Kanban + basic Gantt). Resource allocation, expenses, and shopping list implemented where backend is ready.

**Partially blocked:** Gantt dependency drag (#121, #122), expenses (#124), shopping list (#125). Build around these with clear disabled states.

**Components:** `ProjectCard`, `PhaseIndicatorStrip`, `BriefPanel`, `ResourceAllocationPanel` (uses `?available=true` ✅), `KanbanBoard` + `KanbanCard`, `GanttChart` (task bars + date drag; full dependency drag blocked on #121, show dependency lines read-only for now), `ProjectProposalCard`, `PlantProgressPanel`, `BudgetTracker` (placeholder UI until #124 lands), `ShoppingListPanel` (placeholder UI until #125 lands)

**Pages:** `ProjectsPage`, `ProjectDetailPage`, `ProjectCreatePage` (wizard), `ProposalDetailPage`

**Smoke test:** Projects list groups by status with correct counts; planning mode shows brief form + generate proposal button; execution mode shows Gantt and Kanban with real tasks; resource allocation shows available beds/containers; accepting a proposal transitions the project to active.

---

## Phase 5d — Calendar

**Deliverable:** Full calendar renders tasks across the month, day detail panel works, week view works. Drag-to-reschedule functional. Annotations placeholder until #114 lands.

**Partially blocked:** Annotations (#114); full drag works without it.

**Components:** `CalendarGrid` (render-prop, month + week views), `MiniCalendar`, `DayDetailPanel`, `CalendarMarginPanel`, `WeatherIcon`

**Pragmatic DnD:** drag task chip between day cells → `PATCH /api/v1/tasks/:id` → optimistic update. Annotations render from `GET /api/v1/calendar/annotations` if #114 has landed; otherwise disabled placeholder input.

**Page:** `CalendarPage`

**Smoke test:** Month view shows all tasks from `tasks/due?days_ahead=30`; clicking a day slides in `DayDetailPanel` with that day's tasks; dragging a task to a different day updates the date in real time.

---

## Phase 5e — Activity

**Deliverable:** Global activity feed page with full filtering. `ObjectActivityFeed` already built in 5a; this wires the full-page variant.

**No blockers.**

**Page:** `ActivityPage` — `FilterRail` (category, event_type, date range, subject picker) + `ObjectActivityFeed` (full-page variant, `showFilters: true`)

**Smoke test:** Global feed shows recent events across all objects; filtering by category shows only those event types; infinite scroll loads more via `before_timestamp` cursor.

---

## Phase 6 — Today page, Incidents, Agent chat

**Blocked on:** rhizome#120 P1 — `TriageSnapshotView`, `WeatherSnapshotView`, `InteractionEnvelopeView`, `IncidentView`, `ThreadView` must land first. 6c is additionally blocked on [rhizome#141](https://github.com/ybordag/rhizome/issues/141) (streaming is wired but non-functional server-side). Build all of Phase 5 first and run Phase 6 once these are confirmed.

### 6a — Today page

`TodayConditionsPanel` (weather), `RhizomeBriefingPanel` (triage + inline `InteractionCard` for pending approvals), `TodayOverviewPanel` (projects + MiniCalendar), `TodayTasksStrip` (top 5 with quick-complete), `ThisWeekStrip`. **Page:** `TodayPage`

### 6b — Incidents

`IncidentRow`, `IncidentDetailHeader`, `AffectedSubjectsPicker`, `TreatmentPlanSection` (dual path — AI draft + manual write), `TreatmentPlanCard`, `TreatmentStepsEditor`. **Pages:** `IncidentsPage`, `IncidentDetailPage`. Requires #129 (incident edit/delete/manual treatment) alongside P1.

### 6c — Agent chat with SSE

`SessionStrip`, `ContextStrip`, `ChatThread` (`StreamingMessage`, `MessageBubble`, day separators), `Composer`, `InteractionPanel` (`PendingInteractionList` + `InteractionCard`), thread list/switcher in the page header, context-aware entry (URL params → pre-fill + new/existing thread choice). **Page:** `RhizomePage`

Whether a new thread auto-opens on first visit, or the user sees a thread list/picker first, is still an open product decision — see [pages/05-agent.md](../pages/05-agent.md).

**Smoke test:** Send a message → tokens stream in real time; receive an interaction event → panel slides open with review card; accept a proposal → stream resumes, follow-up message appears; "Ask Rhizome about Cherry Tomatoes" from plant detail → opens pre-seeded thread.

---

## Phase 7 — Feature backfill

Each item is independent. Build in any order as backend issues close.

| Feature | Depends on | Component(s) |
|---|---|---|
| Context search + pinned context | rhizome#126 + #127 | `ContextSearchModal`, `ContextStrip` wired |
| Care recording quick actions | rhizome#128 | `CareStateStrip` log button live |
| Full Gantt dependency drag | rhizome#121 + #122 | `GanttDependencyLine` draggable, `GanttTaskBar` create-dependency drag |
| Project expenses | rhizome#124 | `BudgetTracker` fully wired |
| Shopping list | rhizome#125 | `ShoppingListPanel` fully wired |
| Media gallery | rhizome#117 | `MediaGallery` upload + lightbox |
| Garden map | rhizome#118 | `GardenMap` minimap + `ExpandedMapOverlay` |
| Calendar annotations | rhizome#114 | `AnnotationEditor` in `DayDetailPanel` + `CalendarMarginPanel` |
| Notification drawer + toasts | rhizome#130 | `NotificationDrawer` live, `JobProgressTree`, `Toast` |
| Task series CRUD | rhizome#113 | Task creation wizard "Make recurring" toggle live |
| Incident media | rhizome#117 | `MediaGallery` on `IncidentDetailPage` |

---

## Phase 8 — Polish + deploy

**Deliverable:** Production-ready app running on spark-thor.

**Deploy target:** Cambium serves the built static files directly on spark-thor — same-origin, no CORS, no `VITE_CAMBIUM_URL` needed in production.

**Cambium changes needed:** a static file handler serving `dist/` for all non-API routes, falling back to `index.html` for any unmatched path (required for client-side routing):

```go
// In Cambium routes.go (approximate)
fs := http.FileServer(http.Dir("./dist"))
mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if _, err := os.Stat("./dist" + r.URL.Path); os.IsNotExist(err) {
        http.ServeFile(w, r, "./dist/index.html")
        return
    }
    fs.ServeHTTP(w, r)
}))
```

**Build process:**
```bash
npm run build                  # produces dist/
cp -r dist/ ../cambium/dist/    # or configure STATIC_DIR env var
```

**Alternative:** a separate `Dockerfile` for verdant-pages that builds with Node and copies `dist/` as a build artifact into the Cambium image — cleaner for CI.

Raise a Cambium issue for the static file handler when ready to deploy.

**Other polish tasks:**
- Code splitting — lazy load all page components via `React.lazy` + `Suspense`
- Accessibility audit — keyboard navigation, focus management in Modal/Drawer, ARIA labels on nav
- Performance baseline — Lighthouse on Today, Tasks, Calendar pages
- Self-hosted fonts — see [design-tokens.md](../architecture/design-tokens.md)
- Visual QA — compare all pages against the mockups in [design/mockups/](../design/mockups/)

---

## Build order summary

```
Phase 1   Scaffold + Vite config
Phase 2   Tokens + theme + fonts
Phase 3   Primitives + app shell (can use before auth)
Phase 4   Auth + API client foundation
          ↓
Phase 5a  Garden objects ← no blockers
Phase 5b  Tasks          ← no blockers    } all in parallel
Phase 5c  Projects       ← partial blockers (expenses, shopping, Gantt dependencies)
Phase 5d  Calendar       ← partial blockers (annotations)
Phase 5e  Activity       ← no blockers
          ↓
          [Wait for rhizome#120 P1 + #141]
          ↓
Phase 6a  Today page
Phase 6b  Incidents       } all in parallel once P1 + #141 land
Phase 6c  Agent chat SSE
          ↓
Phase 7   Feature backfill (independent, as each backend issue closes)
Phase 8   Polish + deploy
```

**Estimated phase sizes:**

| Phase | Size |
|---|---|
| 5a | 2–3 days |
| 5b | 2–3 days |
| 5c | 3–4 days |
| 5d | 2 days |
| 5e | half day |
| 6a–6c | 3–4 days (after P1 + #141) |
| 7 | ongoing |
| 8 | 1–2 days |
