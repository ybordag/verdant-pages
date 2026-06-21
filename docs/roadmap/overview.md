# Roadmap

**Last updated:** 2026-06-21 (offline banner + retry-visibility toasts)

## How we work

Work is organised into **phases** — each phase has a clear deliverable and a smoke test. Phases 1–4 are complete; remaining incomplete items are explicit backend-blocked or phase-sequenced deferrals, not hidden Phase 4 work.

**Phases 5–8 were re-planned on 2026-06-21**, replacing the original 5a–5e/6/7/8 split. The original split was organized by *what the backend would unblock next* (it assumed most pages stayed blocked until rhizome#120's P1 tier landed). Re-checking every cited blocker found that picture was stale — #112–#130 and the relevant #132 follow-up issues (#133/#134/#137) are now closed. With nearly everything unblocked, the new split is organized by *what makes the product usable soonest*: agent chat first (it exercises the full stack top to bottom and is the product's differentiator), then the daily-operations pages, then garden/plant management, then polish. See each phase below for current per-feature blocker status — don't trust old "blocked on #120" citations anywhere else in this repo's docs without rechecking.

This file is the single source of truth for phase planning and status — what to build, in what order, and what's actually done versus still planned. There's no separate per-phase history doc; as a phase completes, this file's entry for it is updated in place to describe what actually shipped (including any bugs found and fixed along the way), rather than just what was originally planned.

---

## Phase status

| Phase | Name | Status | Branch |
|---|---|---|---|
| 0 | Pre-build setup | **complete** | — |
| 1 | Scaffold + build tooling | **complete** | `willow` |
| 2 | Tokens + theme + fonts | **complete** | `aspen` |
| 3 | Primitives + app shell | **complete** | `cedar` |
| 4 | Auth + API client foundation | **complete** — auth core + 15/16 domain modules + SSE streaming done; structured cleanup complete; media intentionally deferred | `birch` |
| 5 | Chat and context (Agent chat, Today, Incidents, Activity) | not started | — |
| 6 | Tasks and projects (Tasks, Calendar, Projects) | not started | — |
| 7a | Garden hub & objects (beds, containers) | not started | — |
| 7b | Plants | not started | — |
| 8 | App polish (Settings, Notifications, deploy) | not started | — |

Renumbered 2026-06-21 — see "How we work" above for why. The old 5a–5e/6/7/8 numbering is gone; nothing below reuses it.

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

**Smoke test:** `npm run dev` starts without errors; `curl http://localhost:8080/health` returns `{"status":"ok"}` against Cambium; `npm run build` produces a clean dist; App renders.

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

**Shell:** `AppShell` (renamed from `VPNav` for genericness), `AppNav` — all 7 nav items with icons, badge slots, collapse to 52px, pending-state color dim; `QuickActionsPanel`, `GardenProfileCard`, `NavFooter` (avatar placeholder, theme toggle, notification bell), `NotificationDrawer`/`Toast` empty shells (wired in Phase 8), `Breadcrumb`

**Router:** all routes from [routes.md](../architecture/routes.md), 27 page stubs, `ProtectedRoute` (passthrough until Phase 4)

**Smoke test:** All 7 nav items render with correct icons/labels and clicking each changes active state and renders the stub; collapse to 52px shows only icons with pending-state color dim; nav badge slots render; `GardenProfileCard`/`QuickActionsPanel` visible and positioned correctly.

**Tests:** 30 total (20 unit + 10 E2E) covering all 7 nav items, collapse/expand + persistence, pending-badge "lit icon" state, route navigation, notification drawer, theme toggle, Toast and Breadcrumb component behavior.

---

## Phase 4 — Auth + API client foundation ✅ complete (`birch`)

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

**Domain modules — 15/16 built:** `garden.ts`, `plants.ts`, `tasks.ts`, `calendar.ts`, `shopping.ts`, `search.ts`, `alerts.ts`, `notifications.ts`, `interactions.ts`, `chat.ts`, `triage.ts`, `weather.ts`, `incidents.ts`, `projects.ts`, `activity.ts`, plus `src/lib/types/rhizome.ts`. Built only against endpoints confirmed to return real structured JSON. `triage.ts`/`weather.ts` landed after independently verifying rhizome#133, `projects.ts`/`activity.ts` landed after rhizome#134/#137 were verified and closed, and the final structured cleanup (`listTasksBlocked`, `batchRemovePlants`, intentionally absent `getTriageRecommendations`) is complete.

**`src/lib/sse/stream.ts` is also built** (`consumeSSEStream`, `consumeNotificationStream`), unblocking `chat.ts`'s `streamChat`/`streamResume` and `notifications.ts`'s `streamNotifications`. Both accept an optional `AbortSignal` for client-side cancellation (logout, route change, unmount) — added after a coverage audit found there was previously no way to cancel an open stream.

**Live-verified against the real stack:** ran the actual SSE wire-parsing logic against running Cambium → Rhizome with two providers (default `google_genai`, explicit `openai`). That pass found rhizome#141, a real backend bug in the streaming path; the backend fix was later verified and the issue was closed. The same pass found and fixed two frontend bugs: `stream.ts` sent the literal header `Bearer null` when logged out instead of omitting it, and there was no way to cancel an open stream at all.

229 total tests (101 new this pass).

**rhizome#140 closed — garden/plants/tasks CRUD writes + remaining activity feeds, verified before closing (code review, 50 new rhizome tests, full 798-test suite, live curl checks against a running instance — including a real route-ordering bug found and fixed: `PATCH /garden/plants/batch` was unreachable because it was registered after `{plant_id}`).** Unblocked almost everything that was previously omitted from `garden.ts`/`plants.ts`/`tasks.ts`: `updateGardenProfile`, `updateBed`, `createContainer`, `updateContainer`, `getBedActivity`, `getContainerActivity`, `getPlant`, `createPlant`, `updatePlant`, `createPlantBatch`, `batchUpdatePlants`, `getPlantActivity`, `getBatchActivity`, `updateTask`, `getTaskActivity`, `updateTaskSeries` — all now built, typed, tested, and live-verified against a running instance. New types: `ActivityEventView`, `ActivitySubjectView`, `PlantBatchResultView`; corrected a few existing request types (`CreateContainerRequest`, `CreatePlantRequest`, `UpdateTaskRequest`, `UpdateTaskSeriesRequest`) against the actual rhizome tool signatures.

245 total tests (16 new this pass).

**Coverage audit (2026-06-21):** cross-referenced every exported function in all 16 domain modules against its test file — full coverage confirmed, no gaps. Found and closed two real component-level gaps that had nothing to do with the recent backend work:
- `NotificationDrawer` had a `useEffect`-registered Escape-key listener with zero test coverage (the classic stale-closure/missed-cleanup bug shape) — E2E only covered open + close-via-button. New `NotificationDrawer.test.tsx` (8 tests) covers Escape, backdrop-click, click-inside-doesn't-close, and listener cleanup on unmount.
- `PasswordStrengthMeter`'s own rendering (bar count, color level, Weak/Fair/Good/Strong label, per-requirement met/unmet) was only indirectly exercised once through `RegisterPage.test.tsx`'s single "Strong" assertion — the scoring logic itself (`passwordStrength.ts`) was well-tested, but the component's render branches weren't. New `PasswordStrengthMeter.test.tsx` (6 tests) covers all four strength levels plus per-requirement met/unmet state.

259 total tests (14 new this pass).

**Offline banner + retry-visibility toasts (2026-06-21):** built the connectivity/toast plumbing that `error-handling.md` had specified since before Phase 4 started but never had anything to attach to. `src/lib/toast/toastStore.ts` (generic module-level toast store), `src/lib/connectivity/connectivity.ts` (offline detection: native `online`/`offline` events + a three-consecutive-failure fallback), `OfflineBanner` in `AppShell`, and `src/lib/query/queryClient.ts` (custom `retry`: skips `ApiError` entirely, retries a raw network failure up to 3x with a toast per attempt) — this also fills in `lib/query/`, previously empty. Also corrected a stale claim in `error-handling.md`: the notification stream's auto-reconnect-with-backoff was documented as built but `stream.ts` never had any reconnect logic — re-spec'd as not-yet-built and scheduled with notification UI wiring in Phase 8.

285 total tests (26 new this pass).

**`incidents.ts` built (2026-06-21), unblocked by rhizome#135's closure.** Full incident CRUD (`listIncidents`, `getIncident`, `createIncident`, `updateIncident`, `deleteIncident`, `resolveIncident`) plus treatment-plan management (`getIncidentTreatment`, `createManualTreatmentPlan`, `updateTreatmentPlan`, `deleteTreatmentPlan`, `approveTreatmentPlan`), `getIncidentActivity`, and the AI-trigger `draftTreatmentPlan(id, threadId)` (Cambium's `triggerTreatmentDraft`, same pattern as `triage.ts`'s `runTriage`). New types in `rhizome.ts`. 15 new tests.

300 total tests at this checkpoint (15 new this pass).

**`projects.ts` and `activity.ts` built (2026-06-21), unblocked by rhizome#134/#137.** Projects covers project CRUD, progress, briefs, proposals, project tasks/task graph, task generation trigger, series, bed/container/plant assignment envelopes, activity, expenses, expense summary, and shopping. Activity covers the global activity feed and stats. 17 focused API tests added.

**Structured cleanup complete:** `listTasksBlocked` is built against structured `GET /tasks/blocked`, and `batchRemovePlants` is built against structured `PATCH /garden/plants/batch/remove`. There is intentionally no `getTriageRecommendations` because `getLatestTriage()` is the supported structured path.

**Completion verification (2026-06-21):** `npm run lint`, `npm run test:run` (323 Vitest tests), `npm run build`, and `npm run test:e2e` (20 Playwright tests) all pass on Node 24. The final test audit added direct `refreshAccessToken` coverage for success, rejected refresh, and concurrent refresh de-duplication.

**Intentionally deferred:** `media.ts` — genuinely not started in Rhizome at all (rhizome#117), separate from the structured-JSON backlog.

See [deferred-work.md](../development/deferred-work.md) for the full breakdown of what's deferred and why.

---

## Phase 5 — Chat and context

**Deliverable:** Agent chat fully functional end to end (streaming, interaction approval, context-aware entry from other pages), Today page live with real briefing data, Incidents fully CRUD-able with the treatment plan flow, and the global Activity feed with filtering. This phase deliberately exercises the full stack — auth, SSE, multi-page context-passing — before building out the rest of the app, and gives a way to both *direct* Rhizome (chat) and *verify* what it did (Activity).

**No real blockers left.** #136 (interactions), #126/#127 (search + pinned context), #135 (incidents), #141 (SSE streaming), #142 (duplicate/internal chat-stream tokens), and #134 (global activity) are all closed.

### Agent chat (Rhizome)

`SessionStrip`, thread home + scrollable thread list, topbar thread switcher, model selector display, `ContextStrip` + `ContextSearchModal` (unified + typed search, #126/#127 closed), `ChatThread` (`StreamingMessage`, `MessageBubble`, day separators), `Composer`, `InteractionPanel` (`PendingInteractionList` + `InteractionCard`), context-aware entry (URL params → pre-fill + new/existing thread choice). **Page:** `RhizomePage`

`/app/rhizome` is the thread home. It does not silently auto-create a thread. With no threads, show a blank new-thread composer state; with existing threads, show a scrollable recent-thread list plus a new-thread entrypoint. `Upload Photo` is omitted until media endpoints land. The model selector lives in the topbar; it displays `preferred_provider`/`preferred_model` from session now and becomes editable once cambium#20 lands.

Startup intake remains a backend contract gap tracked as rhizome#146: Rhizome infers time/energy/focus from opener text internally, but Verdant needs a structured thread/session intake shape to display and edit those values in `SessionStrip`.

**Smoke test:** Send a message → tokens stream in real time; receive an interaction event → panel slides open with review card; accept a proposal → stream resumes, follow-up message appears; "Ask Rhizome about Cherry Tomatoes" from plant detail → opens pre-seeded thread.

### Phase 5 subphases

Each subphase should be a separate branch and PR so Phase 5 stays reviewable. Branch names continue the tree theme.

| Subphase | Branch | Tangible output | Smoke test |
|---|---|---|---|
| 5.0 Roadmap/spec lock | `maple` | Phase 5 plan, Rhizome workbench decisions, backend gap issue for startup intake | Docs clearly specify thread home/list, model selector, omitted upload photo, and subphase sequence |
| 5.1 Activity foundation | `alder` | `FilterRail`, `ObjectActivityFeed`, `ActivityPage` with real `GET /api/v1/activity` data and cursor pagination | Global feed renders recent events; category filter narrows results; Load more uses `before_timestamp` |
| 5.2 Thread home and streaming chat | `rowan` | `/app/rhizome` thread home/list, `/app/rhizome/:threadId`, composer, streaming messages, topbar thread switcher, read-only model display | No-thread state can start a thread; existing threads are selectable; sending a message streams tokens and ends cleanly |
| 5.3 Interactions and context | `laurel` | Interaction panel, compact interaction summaries, resume stream actions, context strip/search/pinning, context-aware entry modal | Pending interaction opens review panel; approve resumes stream; adding/removing context updates chips and backend |
| 5.4 Incidents and treatment plans | `hawthorn` | Incidents list/detail/new route, filters, manual treatment plan editor, Rhizome draft trigger, approve/resolve flows | Create incident; add manual plan; approve plan generates tasks; resolve incident updates status |
| 5.5 Today page integration | `juniper` | Real Today page using weather, latest triage, pending interactions, active projects, top tasks, mini calendar | Today shows real briefing/conditions/tasks; pending interaction is actionable; links navigate to Rhizome/Tasks/Calendar |
| 5.6 Phase 5 hardening | `cypress` | Cross-page polish, loading/error/empty states, E2E coverage for core Phase 5 flows, docs finalization | Full Phase 5 smoke suite passes against live Cambium/Rhizome |

### Today page

`TodayConditionsPanel` (weather), `RhizomeBriefingPanel` (triage + inline `InteractionCard` for pending approvals), `TodayOverviewPanel` (projects + `MiniCalendar`), `TodayTasksStrip` (top 5 with quick-complete), `ThisWeekStrip`. **Page:** `TodayPage`

Build this one deliberately thin at first — real data for everything above, but expect to come back and add widgets as Phase 6/7 land (e.g. richer project status once Projects is built). Don't over-build it now.

**Smoke test:** Today's briefing paragraph reflects real `GET /api/v1/triage/latest` data; pending interactions render inline and are actionable; clicking the mini-calendar navigates to `/app/calendar` (stub is fine until Phase 6).

### Incidents

`IncidentRow`, `IncidentDetailHeader`, `AffectedSubjectsPicker`, `TreatmentPlanSection` (dual path — AI draft + manual write), `TreatmentPlanCard`, `TreatmentStepsEditor`. **Pages:** `IncidentsPage`, `IncidentDetailPage`.

**Smoke test:** Create an incident → appears in list; "Write my own plan" → treatment plan saved and shown with steps; approve a plan → tasks generated; resolve an incident with notes → status updates.

### Activity

`ActivityPage` — `FilterRail` (category, event_type, date range, subject picker) + `ObjectActivityFeed` (full-page variant, `showFilters: true`). The same `ObjectActivityFeed` component is reused (not rebuilt) on every other detail page across later phases.

**Smoke test:** Global feed shows recent events across all objects; filtering by category shows only those event types; infinite scroll loads more via `before_timestamp` cursor.

---

## Phase 6 — Tasks and projects

**Deliverable:** Full task ledger (all 6 views), calendar with drag-to-reschedule and annotations, and projects covering both planning mode (brief + proposals) and execution mode (Gantt, Kanban, resources, budget, shopping).

**No real blockers left.** Tasks, Calendar, and Projects are unblocked: #113/#114 cover task series and annotations, #121/#122 cover project task graph and bulk date updates, #123/#124/#125 cover resource availability, expenses, and shopping, and #137 covers project planning plus project create/update/delete.

### Tasks

**Shared components:** `TaskRow` (type markers, source colours, hover actions), `TaskGroup` (section header + rows), `DetailPanel` (right slide-in), `VelocityStrip` (`GET /api/v1/activity/stats`)

**Pages:** `TasksPage` (all 6 views — Today, Week, Project, Kind, Area, Progress — with `FilterRail`), `TaskDetailPage`, `TaskCreatePage` (`WizardShell` 3-step + quick inline mode, "Make recurring" toggle fully live), `TaskSeriesPage` (series rule editor)

**Key interactions:** Complete → optimistic strike-through → `POST .../complete`; Defer → `InlinePopover` date picker → `POST .../defer`; Skip → `InlinePopover` reason → `POST .../skip`; Create → `POST /api/v1/tasks`

**Smoke test:** Today view shows prioritised task list; completing a task strikes through immediately and reverts if server errors; Progress view shows 14-day completion bar chart; creating a recurring task generates a `TaskSeries`.

### Calendar

**Components:** `CalendarGrid` (render-prop, month + week views), `MiniCalendar`, `DayDetailPanel`, `CalendarMarginPanel`, `WeatherIcon`, `AnnotationEditor` (fully live, not a placeholder)

**Pragmatic DnD:** drag task chip between day cells → `PATCH /api/v1/tasks/:id` → optimistic update.

**Page:** `CalendarPage`

**Smoke test:** Month view shows all tasks from `tasks/due?days_ahead=30`; dragging a task to a different day updates the date in real time; annotating a day saves and persists on reload.

### Projects

**Components:** `ProjectCard`, `PhaseIndicatorStrip`, `BriefPanel`, `ResourceAllocationPanel`, `KanbanBoard` + `KanbanCard`, `GanttChart` (task bars, date drag, *and* dependency-line drag — fully live), `ProjectProposalCard`, `PlantProgressPanel`, `BudgetTracker` (fully wired, not a placeholder), `ShoppingListPanel` (fully wired, not a placeholder)

**Pages:** `ProjectsPage`, `ProjectDetailPage`, `ProjectCreatePage` (wizard), `ProposalDetailPage`

**Smoke test:** Projects list groups by status with correct counts; planning mode can edit a brief and review/accept a proposal; execution mode shows Gantt and Kanban with real tasks and draggable dependencies; resource allocation shows available beds/containers; budget tracker reflects real expenses; shopping list purchase action creates a linked expense.

---

## Phase 7a — Garden hub & objects

**Deliverable:** Garden hub page plus full bed and container management — list, detail, create, edit, care recording, lifecycle timeline, activity history.

**No blockers.**

**Shared components (build first — also reused by 7b):** `ObjectDetailHeader`, `CareStateStrip` (log button fully live — #128 closed), `ObjectLifecycleTimeline`, `LinkedProjectChips`, `LinkedTasksList`, `ObjectActivityFeed` (same component from Phase 5's Activity page), `LedgerTable`, `FilterRail`, `TabNav`

**Pages:** `GardenPage` (map placeholder + `ProfilePanel` + `ConstraintsEditor` + tab previews — map itself stays a placeholder, blocked on #118), `BedListPage`/`BedDetailPage`/`BedCreatePage`, `ContainerListPage`/`ContainerDetailPage`/`ContainerCreatePage`

Full page-level spec: [pages/02-garden.md](../pages/02-garden.md), [pages/03-garden-objects.md](../pages/03-garden-objects.md).

**Smoke test:** Garden hub shows real profile + constraints; "Log watering" on a bed updates its care state strip immediately; create a new container → appears in list and hub preview tab; filter beds by location → filters correctly.

---

## Phase 7b — Plants

**Deliverable:** Full plant management — list (card grid + ledger), detail with propagation/lifecycle/batch info, and the 4-step creation wizard.

**No blockers.** Split out from 7a deliberately: plants carry more complexity already (lifecycle stages, batches, propagation) and will carry significantly more once visual/image understanding lands on the rhizome side (see Future roadmap below) — worth a focused pass rather than bundling with the simpler bed/container CRUD.

**Reuses 7a's shared components** (`ObjectDetailHeader`, `CareStateStrip`, `ObjectLifecycleTimeline`, `LinkedProjectChips`, `LinkedTasksList`, `ObjectActivityFeed`) plus plant-specific additions: propagation details, batch provenance, care schedule card.

**Pages:** `PlantsPage` (`FilterRail` + card grid/ledger toggle), `PlantDetailPage`, `PlantCreatePage` (`WizardShell` 4-step wizard: identity → location → timing → care/batch)

**Smoke test:** List all plants → real data, sortable columns; click a plant → detail page with care state, lifecycle dates; create a plant via the wizard, including a batch → batch and individual plant records both appear correctly.

---

## Phase 8 — App polish

**Deliverable:** Account/Settings page live, notification drawer and toasts wired to real data, and the production-readiness tail (code splitting, accessibility, deploy).

**No real blockers.** #130 (notification SSE) is closed — `NotificationDrawer`/`Toast` have been empty shells since Phase 3 purely because nothing existed to wire them to; that's no longer true. Settings has only one blocker: password change (cambium#20). Everything else on that page (provider/model selection, API key management, theme) is already buildable.

### Settings

Single scrollable page per [pages/08-account.md](../pages/08-account.md): profile (email read-only, password change disabled pending cambium#20), AI provider + model picker, API key management (configured/not-set status, set/update/remove), theme toggle. **Page:** `SettingsPage`

### Notifications

Wire the existing `NotificationDrawer`/`Toast` shells to `consumeNotificationStream()` (already built in Phase 4) for real job-progress and alert content: `JobProgressTree` for in-flight jobs (triage, weather refresh, series materialization, treatment plan drafting, proposal generation), alert cards for monitor alerts and new pending interactions.

**Smoke test:** Trigger a backend job (e.g. run triage from the topbar) → drawer shows live step-by-step progress; a new monitor alert → toast appears; opening Settings shows real provider/key status; changing the AI provider persists and reflects on next chat turn.

### Deploy + polish tail

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

## Future roadmap (not phase-assigned)

Items with a real backend blocker still open, or deliberately out of scope for Phases 5–8. Pick these up as their blocker closes — none of them gate any phase above.

| Item | Depends on | Notes |
|---|---|---|
| Media galleries | rhizome#117 | `MediaGallery` upload + lightbox on plants/beds/containers/incidents. Not started server-side at all. |
| Garden spatial map | rhizome#118 | `GardenMap` minimap + `ExpandedMapOverlay` on the Garden hub. Not started server-side at all. |
| Visual garden understanding | rhizome roadmap initiative | Image-based plant/disease/pest identification. The reason Plants got split into its own phase (7b) — this will extend that page significantly once it lands. |

---

## Build order summary

```
Phase 1   Scaffold + Vite config
Phase 2   Tokens + theme + fonts
Phase 3   Primitives + app shell (can use before auth)
Phase 4   Auth + API client foundation              ✓ complete
          ↓
Phase 5   Chat and context                          ← no real blockers
            Agent chat · Today · Incidents · Activity
          ↓
Phase 6   Tasks and projects                         ← no real blockers
            Tasks · Calendar · Projects
          ↓
Phase 7a  Garden hub & objects ← no blockers   } sequential — 7b reuses 7a's shared components
Phase 7b  Plants               ← no blockers   }
          ↓
Phase 8   App polish
            Settings · Notifications · deploy + polish tail
          ↓
          Future roadmap (media, garden map, visual understanding — pick up as blockers close)
```

**Estimated phase sizes:**

| Phase | Size |
|---|---|
| 5 | 4–5 days (largest single phase — agent chat is the most complex page in the app) |
| 6 | 4–5 days |
| 7a | 2–3 days |
| 7b | 2 days |
| 8 | 2–3 days |
