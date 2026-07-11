# Verdant Pages Roadmap

**Last verified:** 2026-07-10

This document is the forward delivery plan. The live branch, immediate
priorities, blockers, and quality gates live in
[status/current.md](../status/current.md). Completed implementation history
lives in [history.md](history.md).

## Product target

Verdant Pages is the complete user-facing workspace for Rhizome. The V1 loop is:

```text
Create account and garden profile
  -> open Today and understand conditions
  -> review priorities, alerts, and decisions
  -> ask Rhizome with structured garden context
  -> complete work or approve changes
  -> inspect updated garden state and activity history
```

V1 includes account/onboarding, Today, Rhizome chat and reviews, operational
tasks/calendar, incidents, garden records, projects, settings, notifications,
responsive behavior, accessibility, and production deployment.

Media galleries, visual understanding, advanced spatial maps, RAG, external
search grounding, and iNaturalist are post-V1 capabilities and do not block the
core application.

## Phase status

| Phase | Deliverable | Status |
|---|---|---|
| 0-4 | Scaffold, design system, shell, authentication, typed API foundation | Complete |
| 5a | Activity foundation | Complete |
| 5b | Rhizome foundation stabilization and closeout | In progress on `red-maple` |
| 5c | Garden-profile onboarding and Today foundation | Planned |
| 5d | Rich Rhizome context, reviews, alerts, and inspection | Planned |
| 5e | Incidents and treatment plans | Planned |
| 5f | Daily-loop integration and Phase 5 hardening | Planned |
| 6 | Tasks and Calendar | Planned |
| 7a | Garden profile, beds, and containers | Planned |
| 7b | Plants and batches | Planned |
| 8 | Projects, proposals, resources, budget, and shopping | Planned |
| 9 | Settings, notifications, accessibility, and production | Planned |

## How phases are delivered

- Each implementation subphase uses a focused branch and reviewable PR.
- Break work into separately committed slices with a tangible UI or contract
  result.
- Verify backend contracts before writing wrappers or page behavior.
- Pause for visual/user smoke checks after meaningful UI slices.
- A phase is complete only when its acceptance path passes appropriate unit,
  mocked browser, and live integration checks.
- Update the current-status checkpoint in the same change that alters phase
  state or priorities.

## Phase 5a - Activity foundation

**Status:** Complete on `sugar-maple`.

Delivered the global Activity page, themed filter/date controls, validation,
loading/error/empty states, and cursor-based infinite scrolling. Activity uses
infinite history rather than numbered pages because it is a chronological
journal/audit surface.

Remaining maintenance belongs to 5f: visual baselines, broader browser coverage,
and a required seeded live integration environment.

## Phase 5b - Rhizome foundation closeout

**Status:** In progress on `red-maple`.

### Delivered foundation

- Thread home, recent threads, navigator drawer, and selected-thread routes.
- First-message thread creation without silent creation on page load.
- Anchored composer, optimistic user messages, streaming Rhizome responses,
  cancellation, partial-response handling, and retry.
- Markdown rendering for user and Rhizome messages.
- Dedicated session-context display and update flow.
- Start-thread time, energy, focus, weather, task shortlist, and recent-thread
  entry points.
- Unified context search, typed composer autocomplete, and pinned context.
- First-pass pending interaction review and resume streaming.
- Embedded conversation workspace with light thread/review drawers.

### Closeout work

1. Keep lint, unit, build, and Playwright gates green through closeout.
2. **Complete:** extract bounded components/hooks from the Rhizome page and
   split feature CSS by component/surface ownership.
3. Support natural-language focus with zero-to-many anchored objects throughout
   initial and active-thread editing.
4. Reconcile model selection with Cambium's now-available profile endpoint.
5. Complete live-stack create/context/stream/review/reload smoke coverage.
6. Complete responsive/accessibility review for the current workbench.

### Acceptance path

From `/app/rhizome`, create a thread by sending the first message with session
context; observe one optimistic message and one streamed response; pin and
remove context; receive and resolve an interaction; switch away and back; reload
clean history without duplicated/empty messages.

## Phase 5c - Onboarding and Today foundation

### Garden-profile onboarding

- Extend registration into account creation plus initial garden setup.
- Collect garden name, human-readable location, and soil information.
- Ask the backend to derive coordinates, timezone, climate zone, and frost dates.
- Show derivation progress, recoverable failures, manual retry, and an honest
  limited/skip state when enrichment is unavailable.
- Route completed accounts into a useful Today page.

### Thin real Today page

- Latest weather and relevant warnings.
- Latest triage summary and urgent/routine/project groups.
- Top daily tasks.
- Pending review/alert indicator.
- Active-project summary where available.
- Direct entry into Rhizome, Tasks, Calendar, and review workflows.

Do not wait for every later widget. Today must become a useful post-login
landing page before the deeper operational pages are complete.

### Acceptance path

Register a new account, create/enrich a garden profile, land on Today, understand
the day's conditions and priorities, and open a contextual Rhizome conversation.

## Phase 5d - Rich Rhizome context and reviews

- True backend-supported message-only context.
- Natural-language focus with multiple anchored tasks/projects/plants/batches.
- Agent-authored object references that open a context inspector.
- Add inspected objects to the current message or pin them to the thread.
- Typed review variants for confirmation, proposal, treatment, weather, and
  triage interactions.
- Alerts mode in the right drawer.
- Pending-interaction queue affordances if the API exposes multiple records.
- Context-aware entry from task, plant, project, incident, and Today surfaces.
- Editable provider/model selection through Cambium profile preferences.

### Acceptance path

Open Rhizome from a garden object, preserve its stable reference, discuss it,
inspect another object from Rhizome's reply, review a structured proposed
change, and resume the conversation after the decision.

## Phase 5e - Incidents and treatment plans

- Incident list, filtering, creation, detail, update, deletion, and resolution.
- Affected-subject selection through unified search.
- Manual treatment-plan authoring and editing.
- Rhizome treatment-plan drafting.
- Structured review/approval and generated treatment tasks.
- Incident-scoped activity history.

### Acceptance path

Create an incident, attach affected subjects, draft or manually write a plan,
approve it, verify generated tasks, and resolve the incident with history.

## Phase 5f - Daily-loop integration and hardening

Verify the complete early product loop:

```text
Register -> onboard garden -> Today -> Rhizome -> review decision
  -> perform/inspect work -> Activity
```

Deliver:

- Cross-page loading, error, empty, retry, and stale-state behavior.
- Seeded full-stack E2E for core Phase 5 workflows.
- Desktop, tablet, and phone smoke coverage.
- Light/dark visual baselines.
- Keyboard/focus/accessibility audit.
- Report-only test coverage and CI quality gates.
- Final Phase 5 documentation and capability audit.

## Phase 6 - Tasks and Calendar

### 6a Tasks

- Daily, weekly, project, kind, area, blocked, and progress views.
- Reusable ledger rows and task groups.
- Start, complete, skip, defer, edit, create, delete, and dependency workflows.
- Recurring task-series creation and editing.
- Detail page, blocker explanation, linked subjects, and activity.
- Progress/velocity summaries.

### 6b Calendar

- Month and week views.
- Task scheduling and drag-to-reschedule.
- Calendar annotations.
- Weather and incident marks.
- Day detail and task quick actions.

### Acceptance path

Create a recurring task, act on today's work, reschedule an instance through the
calendar, and verify the task and activity state remain consistent.

## Phase 7a - Garden profile, beds, and containers

- Garden hub without requiring the deferred spatial map.
- Garden profile, constraints, and enrichment status.
- Bed/container lists, filters, details, creation, editing, and deletion.
- Care-state display and care logging.
- Linked projects/tasks and activity history.

### Acceptance path

Edit the garden profile, create a container, record care, and see the updated
state and history from both the object and garden hub.

## Phase 7b - Plants and batches

- Plant card and ledger inventory.
- Plant and batch creation/editing/removal.
- Lifecycle, provenance, propagation, location, and care state.
- Linked projects, tasks, incidents, and activity.

### Acceptance path

Create a batch and its plants, assign locations, record care, and inspect the
resulting lifecycle and linked work.

## Phase 8 - Projects

Deliver in layers:

1. Project list, detail, creation, and brief.
2. Proposal drafting, comparison, revision, and acceptance.
3. Generated task graph and schedule preview.
4. Resource allocation across beds, containers, and plants.
5. Gantt, Kanban, and list execution views.
6. Budget, expenses, shopping, and project activity.

### Acceptance path

Create a project brief, review and accept a proposal, generate work, allocate
garden resources, track execution, and reconcile purchases against budget.

## Phase 9 - Settings, notifications, and production

- Email display, password change, provider/model preferences, API-key
  management, and theme controls.
- Notification snapshot plus reconnecting SSE stream.
- Job progress, monitor alerts, and pending-review notifications.
- Route error boundaries and page-level code splitting.
- Accessibility completion and performance baseline.
- Cambium-served production build, deployment, and operational documentation.

Cambium already implements profile/password updates and static SPA serving;
these are frontend/integration tasks, not backend blockers.

## Post-V1 capabilities

| Capability | Dependency | V1 behavior |
|---|---|---|
| Media upload and galleries | Rhizome/Cambium media contract | Honest unavailable/placeholder state |
| Visual garden understanding | Media plus vision pipeline | No image identification in V1 |
| Advanced spatial garden map | Rhizome layout model/routes | Garden hub remains list/profile-first |
| RAG knowledge base | Rhizome intelligence initiative | Existing agent knowledge and domain state |
| Live web grounding | Rhizome intelligence initiative | No frontend-specific blocker |
| iNaturalist observations | Rhizome sensing initiative | Alerts use existing monitor data only |
