# Build Phases

Eight phases from scaffold to feature-complete. Each phase has a clear deliverable you can review before the next begins.

**Dependency note:** Rhizome#120 P0 is already done — garden objects, tasks, and projects can be wired to real data immediately. Rhizome#120 P1 (triage, weather, interactions, incidents, threads) is still pending and blocks the Today page, Incidents page, and Agent chat. Phases 5a–5e can all proceed in parallel with P1 work.

---

## Phase 0 — Pre-build setup

Before writing any application code.

- Copy `docs/architecture/claude-md.md` to the repo root as `CLAUDE.md`
- Confirm Cambium is running locally on `:8080`
- Confirm Rhizome is running locally on `:8001`
- Confirm the test user exists (`POST /auth/register` once)

**Done when:** `curl http://localhost:8080/health` returns `{"status":"ok"}`

---

## Phase 1 — Scaffold + Build Tooling

**Deliverable:** Project boots, proxies to Cambium, TypeScript compiles clean with no errors.

```bash
npm create vite@latest verdant-pages -- --template react-ts
npm install react-router-dom @tanstack/react-query @tanstack/react-table
npm install -D eslint prettier typescript
```

- `vite.config.ts` — proxy `/api` and `/auth` to `http://localhost:8080`
- `tsconfig.json` — strict mode, path aliases (`@/` → `src/`)
- ESLint + Prettier config
- `.env.example` with `VITE_CAMBIUM_URL=`
- Empty `src/styles/`, `src/lib/`, `src/components/`, `src/pages/`, `src/routes/`
- `App.tsx` renders `<div>Verdant Pages</div>`

**Smoke test:**
- `npm run dev` starts without errors
- `fetch('/health')` from the browser console returns `{"status":"ok"}`
- `npm run build` produces a clean dist

---

## Phase 2 — Tokens, Theme, Fonts

**Deliverable:** Full visual foundation — light/dark toggle works, all four fonts load, the page looks like the prototype's background.

- `src/styles/tokens.css` — all CSS variables (both themes), port verbatim from prototype
- `src/styles/global.css` — reset, body, scrollbar, shared keyframes (`pIn`, `vsA`, `acceptGlow`)
- `src/styles/utilities.css` — `.dg`, `.gg`, `.chip`, `.hr`, `.cd`, `.nb`
- Google Fonts `<link>` in `index.html`
- `ThemeProvider` — reads/writes `localStorage('vp_theme')`, sets `data-theme` on `<html>`, defaults to `'dark'`
- `App.tsx` wrapped in `ThemeProvider`

**Smoke test:**
- Toggle switches between dark (`#181510`) and light (`#FAF6EE`) backgrounds
- Shantell Sans, Caveat, Nunito, Montserrat all render visibly different

---

## Phase 3 — Primitives + App Shell

**Deliverable:** The full app shell renders with working navigation, all 7 nav items, collapse behavior, theme toggle, and all routes stubbed.

**Primitives:**
- `Button` (primary/ghost/danger, sm/md)
- `Input`, `Select`, `Textarea`
- `Chip` (with optional remove)
- `FieldLabel`
- `Modal` (focus-trapped, Escape closes)
- `InlinePopover`
- `StatusBadge`, `ProgressBar`

**Layout:**
- `AppShell` (VPNav + content wrapper)
- `VPNav` — all 7 nav items with icons, badge slots, collapse to 52px, pending-state color dim
  - `QuickActionsPanel` (3 buttons, collapses to icons)
  - `GardenProfileCard` (mini plot, zone, links; collapses to icon)
  - `NavFooter` (avatar placeholder, theme toggle, notification bell)
- `Breadcrumb`
- `NotificationDrawer` shell (renders empty, wired in Phase 7)
- `Toast` shell (renders nothing, wired in Phase 7)

**Router:**
- `router.tsx` — all routes from [routes.md](routes.md) defined
- All page components stubbed as `<div className="pi">PageName</div>`
- `ProtectedRoute` — always passes (real auth in Phase 4)

**Smoke test:**
- All 7 nav items render with correct icons and labels
- Clicking each nav item changes the active state and renders the stub
- Collapse to 52px shows only icons; pending-state color dim works
- Nav badge slots render (with hardcoded numbers for now)
- `GardenProfileCard` and `QuickActionsPanel` visible and correctly positioned

---

## Phase 4 — Auth + API Client Foundation

**Deliverable:** Login and register work against the real Cambium API. Protected routes redirect correctly. Proactive token refresh runs. All API modules are written and typed.

**Token store + base client:**
- `src/lib/api/client.ts` — in-memory token, `apiFetch`, `ApiError`, 401→refresh→retry→redirect
- `src/lib/api/auth.ts` — `login`, `register`, `logout`, `tryRefreshToken`, `getSession`

**Auth context:**
- `src/lib/auth/context.tsx` — `AuthProvider`, `useAuth`
- Proactive refresh: `setInterval(tryRefreshToken, 12 * 60 * 1000)` after login
- `ProtectedRoute` — real auth check, redirects to `/login`

**Auth pages (botanical aesthetic):**
- `LoginPage` — centered card, Verdant Pages wordmark, email + password, submit
- `RegisterPage` — same design, "Create account" variant

**All domain API modules written:**
- `src/lib/api/` — `garden.ts`, `plants.ts`, `tasks.ts`, `projects.ts`, `chat.ts`, `triage.ts`, `weather.ts`, `incidents.ts`, `interactions.ts`, `activity.ts`, `alerts.ts`, `notifications.ts`, `shopping.ts`, `search.ts`, `calendar.ts`, `media.ts`
- `src/lib/types/rhizome.ts` — all P0 view model types matching `agent/api/views.py`
- `src/lib/types/cambium.ts` — Cambium types, `SSEEvent`, `NotificationEvent`
- `src/lib/api/stream.ts` — `consumeSSEStream`, `consumeNotificationStream`
- `QueryClientProvider` wired in `App.tsx`
- Vite proxy confirmed working end-to-end

**Smoke test:**
- Register a new user → redirected to Today stub
- Log out → redirected to login
- Log back in → redirected to Today stub
- `GET /api/v1/garden/profile` returns a real GardenProfileView JSON object (not `{"result": "..."}`)
- 15-minute refresh timer fires and silently issues a new token

---

## Phase 5a — Garden Objects

**Deliverable:** Full garden object pages wired to real data. Create, view, edit, care recording all functional.

**No blockers — all required endpoints are live.**

**Shared components (build first — used by all object pages):**
- `LedgerTable`
- `FilterRail`
- `TabNav`
- `ObjectDetailHeader`
- `CareStateStrip` (log button fires `POST /api/v1/garden/{type}/{id}/care` — rhizome#128, or placeholder until it lands)
- `ObjectLifecycleTimeline`
- `LinkedProjectChips`
- `LinkedTasksList`
- `ObjectActivityFeed`

**Pages:**
- `GardenPage` — map placeholder + `ProfilePanel` + `ConstraintsEditor` + tab previews
- `BedListPage` (`/app/beds`) — FilterRail + LedgerTable
- `BedDetailPage` (`/app/beds/:id`) — full detail with all shared components
- `BedCreatePage` (`/app/beds/new`) — `StaticForm`
- `ContainerListPage` (`/app/containers`) — same pattern as beds
- `ContainerDetailPage` (`/app/containers/:id`)
- `ContainerCreatePage` (`/app/containers/new`)
- `PlantsPage` (`/app/plants`) — FilterRail + card grid + ledger toggle
- `PlantDetailPage` (`/app/plants/:id`) — full detail + lifecycle timeline
- `PlantCreatePage` (`/app/plants/new`) — `WizardShell` 4-step wizard

**Smoke test:**
- List all plants → real data, sortable columns
- Click a plant → detail page with care state, lifecycle dates
- "Log watering" → care state strip updates
- Create a new bed → appears in list
- Filter beds by location → filters correctly

---

## Phase 5b — Tasks

**Deliverable:** Tasks page fully operational across all 6 views with real data, optimistic mutations, and velocity tracking.

**No blockers.**

**Shared components:**
- `TaskRow` (type markers, source colours, hover actions)
- `TaskGroup` (section header + rows)
- `DetailPanel` (right slide-in)
- `VelocityStrip` (uses `GET /api/v1/activity/stats` ✅)

**Pages:**
- `TasksPage` — all 6 views (Today, Week, Project, Kind, Area, Progress) with FilterRail
- `TaskDetailPage` (`/app/tasks/:id`)
- `TaskCreatePage` (`/app/tasks/new`) — `WizardShell` 3-step + quick inline mode
- `TaskSeriesPage` (`/app/tasks/series/:id`) — series rule editor

**Key interactions:**
- Complete task → optimistic strike-through → `POST .../complete`
- Defer → `InlinePopover` date picker → `POST .../defer`
- Skip → `InlinePopover` reason → `POST .../skip`
- Create task → `POST /api/v1/tasks` ✅
- Velocity strip → reads from `GET /api/v1/activity/stats` ✅

**Smoke test:**
- Today view shows prioritised task list
- Completing a task strikes through immediately, reverts if server errors
- Progress view shows 14-day completion bar chart
- Create task → appears in list with `is_user_modified: true`

---

## Phase 5c — Projects

**Deliverable:** Projects list and full project detail with planning mode (brief + proposals) and execution mode (Kanban + basic Gantt). Resource allocation, expenses, and shopping list are implemented where backend is ready.

**Partially blocked:** Gantt dependency drag (#121, #122), expenses (#124), shopping list (#125). Build around these with clear disabled states.

**Components:**
- `ProjectCard`
- `PhaseIndicatorStrip`
- `BriefPanel`
- `ResourceAllocationPanel` (uses `?available=true` ✅)
- `KanbanBoard` + `KanbanCard`
- `GanttChart` — task bars + date drag (full dependency drag blocked on #121, show dependency lines read-only for now)
- `ProjectProposalCard` (full cost/timeline/effort review)
- `PlantProgressPanel`
- `BudgetTracker` — **placeholder UI** until #124 lands
- `ShoppingListPanel` — **placeholder UI** until #125 lands

**Pages:**
- `ProjectsPage`
- `ProjectDetailPage`
- `ProjectCreatePage` — wizard
- `ProposalDetailPage`

**Smoke test:**
- Projects list groups by status with correct counts
- Planning mode shows brief form + generate proposal button
- Execution mode shows Gantt and Kanban with real tasks
- Resource allocation shows available beds/containers from API
- Accept a proposal → project transitions to active

---

## Phase 5d — Calendar

**Deliverable:** Full calendar renders tasks across the month, day detail panel works, week view works. Drag-to-reschedule functional. Annotations placeholder until #114 lands.

**Partially blocked:** Annotations (#114), full drag (works without it).

**Components:**
- `CalendarGrid` — render-prop pattern, month + week views
- `MiniCalendar` (wraps CalendarGrid)
- `DayDetailPanel`
- `CalendarMarginPanel`
- `WeatherIcon`

**Pragmatic DnD wired:** drag task chip between day cells → `PATCH /api/v1/tasks/:id` → optimistic update.

**Annotations:** render existing annotations from `GET /api/v1/calendar/annotations` if #114 has landed; otherwise show annotation input as disabled placeholder.

**Page:** `CalendarPage`

**Smoke test:**
- Month view shows all tasks from `tasks/due?days_ahead=30`
- Click a day → DayDetailPanel slides in with that day's tasks
- Drag a task to a different day → date updates in real time

---

## Phase 5e — Activity

**Deliverable:** Global activity feed page with full filtering. `ObjectActivityFeed` already built in 5a; this just wires the full-page variant.

**No blockers.**

**Page:** `ActivityPage` — `FilterRail` (category, event_type, date range, subject picker) + `ObjectActivityFeed` (full-page variant with `showFilters: true`)

**Smoke test:**
- Global feed shows recent events across all objects
- Filtering by category shows only those event types
- Infinite scroll loads more via `before_timestamp` cursor

---

## Phase 6 — Today page, Incidents, Agent chat (after rhizome#120 P1)

**Blocked on:** Rhizome#120 P1 — TriageSnapshotView, WeatherSnapshotView, InteractionEnvelopeView, IncidentView, TreatmentPlanView, ThreadView must land before these phases begin. Build all of Phase 5 first and run Phase 6 once P1 is confirmed.

### 6a — Today page

- `TodayConditionsPanel` (weather)
- `RhizomeBriefingPanel` (triage + inline `InteractionCard` for pending approvals)
- `TodayOverviewPanel` (projects + MiniCalendar)
- `TodayTasksStrip` (top 5 with quick-complete)
- `ThisWeekStrip`
- **Page:** `TodayPage`

### 6b — Incidents

- `IncidentRow`, `IncidentDetailHeader`, `AffectedSubjectsPicker`
- `TreatmentPlanSection` — dual path (AI draft + manual write)
- `TreatmentPlanCard`, `TreatmentStepsEditor`
- **Pages:** `IncidentsPage`, `IncidentDetailPage`
- Requires #129 (incident edit/delete/manual treatment) alongside P1

### 6c — Agent chat with SSE

- `SessionStrip`, `ContextStrip`
- `ChatThread` — `StreamingMessage`, `MessageBubble`, day separators
- `Composer`
- `InteractionPanel` — `PendingInteractionList` + `InteractionCard`
- Thread list/switcher in RhizomePage header
- Context-aware entry (URL params → pre-fill + new/existing thread choice)
- **Page:** `RhizomePage`

**Smoke test (6c):**
- Send a message → stream tokens appear in real time
- Receive an interaction event → panel slides open with review card
- Accept a proposal → stream resumes, follow-up message appears
- "Ask Rhizome about Cherry Tomatoes" from plant detail → opens pre-seeded thread

---

## Phase 7 — Feature backfill (as backend issues land)

Each item below is independent. Build in any order once the backend issue is closed.

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

## Phase 8 — Polish + Deploy

**Deliverable:** Production-ready app running on spark-thor.

**Deploy target:** Cambium serves the built static files directly on spark-thor. Same-origin — no CORS, no `VITE_CAMBIUM_URL` needed in production.

**Cambium changes needed:**
Add a static file handler to Cambium that serves the `dist/` output for all non-API routes. Any path not matched by `/api/v1/*` or `/auth/*` should serve `index.html` (required for client-side routing — React Router handles the URL, not the server).

```go
// In Cambium routes.go (approximate)
fs := http.FileServer(http.Dir("./dist"))
mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    // Serve index.html for all unknown paths (client-side routing)
    if _, err := os.Stat("./dist" + r.URL.Path); os.IsNotExist(err) {
        http.ServeFile(w, r, "./dist/index.html")
        return
    }
    fs.ServeHTTP(w, r)
}))
```

**Build process:**
```bash
# In verdant-pages/
npm run build          # produces dist/
cp -r dist/ ../cambium/dist/   # or configure STATIC_DIR env var
```

**Alternative — separate Dockerfile:** add a `Dockerfile` to verdant-pages that builds with Node, copies `dist/` as a build artifact, then passes it to the Cambium Docker image. Cleaner for CI.

**Raise a Cambium issue** for the static file handler when ready to deploy.

**Other polish tasks:**
- Write `CLAUDE.md` to repo root (copy from `docs/architecture/claude-md.md`, verify all invariants)
- Code splitting — lazy load all page components via `React.lazy` + `Suspense`
- Accessibility audit — keyboard navigation, focus management in Modal/Drawer, ARIA labels on nav
- Performance baseline — Lighthouse on Today, Tasks, Calendar pages
- Self-hosted fonts — download Google Fonts, serve from `/public/fonts/`, update `index.html` (see [design-tokens.md](design-tokens.md))
- Visual QA — compare all pages against prototype and mockups

---

## Build order summary

```
Phase 0   Pre-build setup (CLAUDE.md, verify local services)
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
          [Wait for rhizome#120 P1]
          ↓
Phase 6a  Today page
Phase 6b  Incidents       } all in parallel once P1 lands
Phase 6c  Agent chat SSE
          ↓
Phase 7   Feature backfill (independent, as each backend issue closes)
Phase 8   Polish + deploy
```

**Estimated phase sizes:**

| Phase | Size |
|---|---|
| 0 | < 1 hour |
| 1 | 2–3 hours |
| 2 | 2–3 hours |
| 3 | 1–2 days |
| 4 | 1–2 days |
| 5a | 2–3 days |
| 5b | 2–3 days |
| 5c | 3–4 days |
| 5d | 2 days |
| 5e | half day |
| 6a–6c | 3–4 days (after P1) |
| 7 | ongoing |
| 8 | 1–2 days |
