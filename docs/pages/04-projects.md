# Projects — `/app/projects`

**Last updated:** 2026-06-21

## Purpose

The projects surface is a full project management tool scoped to gardening work. It covers the full lifecycle from brief and planning through active execution to completion, with Gantt, Kanban, and list views, resource tracking, budget management, and a shopping list.

---

## Pages in this group

| Page | Route |
|---|---|
| Projects list | `/app/projects` |
| Project detail | `/app/projects/:id` |
| Proposal detail | `/app/projects/:id/proposals/:proposalId` |

---

## Projects list (`/app/projects`)

A dashboard of all projects grouped by status.

**Status groups:** Planning · Active · Maintaining · Paused · Complete (archived at bottom, collapsed by default)

Each project card shows: name, status badge, goal summary (truncated), progress bar (task completion %), timeline health indicator (on track / at risk / overdue), budget burn gauge, target date.

`+ New Project` navigates to `/app/projects/new`: name (required), goal (required), budget ceiling, target completion date, tray slot allocation, notes. Creates via `POST /api/v1/projects`.

---

## Project detail (`/app/projects/:id`)

The main project workspace. Layout adapts based on project status: **planning mode** vs **execution mode**.

### Header (always visible)

Project name, status badge (clickable to change status), goal text, dates (start → target), edit action.

A **phase indicator strip** shows the current position in the project lifecycle:

```
[Brief] → [Proposal] → [Revision] → [Execution] → [Complete]
```

Active phase is highlighted in chartreuse.

---

### Planning mode (status: planning)

When a project is in planning, the brief and proposal flow takes centre stage.

**Brief panel** — editable form: goal, desired outcome, budget cap, target start, target completion, effort preference (minimal / moderate / intensive), propagation preference. Sourced from `GET /api/v1/projects/{id}/brief`, saved via `PATCH /api/v1/projects/{id}/brief`.

**Resource allocation panel** — during planning the user picks which physical spaces are committed to this project:
- Beds available: `GET /api/v1/garden/beds?available=true`
- Containers available: `GET /api/v1/garden/containers?available=true`
- Assign via `POST /api/v1/projects/{id}/beds/{bedId}`, deallocate via `DELETE`
- Currently assigned objects shown with an active indicator; objects in another active project shown as unavailable

**Generate proposal button** — opens a Rhizome chat thread pre-seeded with the brief. Rhizome responds with a structured proposal. The proposal appears for review in the Proposals panel.

**Proposals panel** — once a proposal exists:
- Version history (v1, v2...) shown as tabs
- Current proposal: cost estimate breakdown, timeline estimate, effort estimate, feasibility check results, assumptions, tradeoffs, risks
- Accept / Request revision / Reject actions
- Accepting calls `POST /api/v1/projects/{id}/proposals/{proposalId}/accept`

Once a proposal is accepted, the project transitions to active and the Gantt/task views unlock.

---

### Execution mode (status: active / maintaining)

Four tabs: **Gantt** · **Kanban** · **List** · **Resources**

#### Gantt tab

A horizontal timeline with tasks as bars and dependency edges as arrows. This is the primary execution view.

**Each task bar shows:**
- Title (truncated)
- Duration (from `window_start` → `window_end` or `scheduled_date` ± estimated_minutes)
- Type marker colour (milestone / maintenance / emergency / opportunistic)
- Urgency indicator (blocker = clay, time_sensitive = buttercup)

**Dependency lines:** directed arrows from blocking task to blocked task. Rendered as curves between the end of the blocking bar and the start of the blocked bar.

**Drag interactions (Pragmatic Drag and Drop):**
- Drag a task bar left/right to change `scheduled_date` — calls bulk update on drop for any cascade changes
- Drag the right edge of a bar to extend/shorten the window
- Drag from the right edge of one task to the left edge of another to create a dependency — calls `POST /api/v1/tasks/{id}/dependencies`
- Click a dependency arrow to select it; Delete key removes it — calls `DELETE /api/v1/tasks/{id}/dependencies/{blocking_task_id}`

**Milestone markers:** tasks with `type=milestone` rendered as diamond markers rather than bars.

**Weather overlays:** days within a `WeatherSnapshot` impact window shown with a subtle cornflower tint.

**Data:** `GET /api/v1/projects/{id}/tasks?include_dependencies=true` + bulk date update `PATCH /api/v1/projects/{id}/tasks/bulk`

#### Kanban tab

Three columns: **Pending** · **In Progress** · **Done**

Each card: task title, type marker, urgency badge, estimated minutes, deadline. Drag between columns calls the appropriate lifecycle action (`start_task`, `complete_task`). Task cards link to the task detail panel (same `DetailPanel` component as Tasks page).

#### List tab

The project-scoped task ledger — same component as the Tasks page By Project view. Groups by urgency tier. All inline task interactions (complete, defer, skip, inline edit).

#### Resources tab

Three sections:

**Budget tracker**
Visual gauge: proposal estimate vs. total estimated expenses vs. total actual spend. Below: a `LedgerTable` of all `ProjectExpense` records with columns: item, category, estimated, actual, status, supplier. Inline status update (needed → ordered → purchased). Add expense via `+` button.

Source: `GET /api/v1/projects/{id}/expenses`, `GET /api/v1/projects/{id}/expenses/summary`

**Shopping list**
Items needed for this project. Columns: item, category, quantity, estimated cost, supplier, priority, status. Mark as purchased calls `POST /api/v1/shopping/{id}/purchase` which creates a linked expense record. Add item via `+` button.

Source: `GET /api/v1/projects/{id}/shopping`

**Allocated resources**
Read-only panel showing beds and containers committed to this project, each with a quick-link to their detail page and a current plant summary. Deallocate button removes the assignment.

Source: `GET /api/v1/projects/{id}/beds`, `GET /api/v1/projects/{id}/containers`

---

### Plant progress panel (always visible in execution mode)

A collapsible side section (or bottom strip) showing the propagation timeline for all plants in this project.

Each plant row:
```
Cherry Tomatoes  Sow ●────── Red Cup ●────── Transplant ●────── Harvest ○
                 Apr 3       May 1            May 22              Jun 28
```

Filled dots = completed stages, hollow dot = upcoming. Clicking a plant navigates to `/app/plants/:id`.

Source: `GET /api/v1/garden/plants?project_id=X`

---

### Activity tab (always available)

Full cross-object project timeline — tasks, plants, incidents, interactions, weather events, all scoped to this project.

Source: `GET /api/v1/projects/{id}/activity`

---

## Proposal detail (`/app/projects/:id/proposals/:proposalId`)

Full-page view of a single proposal — for reviewing a specific version in detail.

Sections:
- **Summary** — goal, approach, selected plants and locations
- **Cost estimate** — line items: plant material, amendments, containers, contingency, total
- **Timeline estimate** — planning start, first action, establishment, completion, maintenance mode
- **Effort estimate** — total hours, avg/peak per week, work buckets (setup / propagation / care)
- **Feasibility** — hard violations (blockers), soft warnings
- **Assumptions, tradeoffs, risks**

Accept / Request revision / Reject actions (same as the inline proposal panel).

Source: `GET /api/v1/projects/{id}/proposals/{proposalId}`

---

## Future: Project mood board

*(Planned — not in initial build)*

A visual inspiration board attached to a project — images, colour palettes, plant references, aesthetic direction. Stored as `Media` records with `category: "mood_board"`. Rendered as a masonry grid on the project detail page. Intended to give Rhizome aesthetic context when generating proposals ("I want a cottage garden feel").

This board depends on the same media attachment support tracked in the blocked capability note below.

---

## API endpoints

| Endpoint | Used for |
|---|---|
| `GET /api/v1/projects` | Projects list |
| `POST /api/v1/projects` | Create project |
| `GET /api/v1/projects/{id}` | Project detail header |
| `PATCH /api/v1/projects/{id}` | Edit project |
| `DELETE /api/v1/projects/{id}` | Delete project |
| `GET /api/v1/projects/{id}/brief` | Brief panel |
| `PATCH /api/v1/projects/{id}/brief` | Edit brief |
| `GET /api/v1/projects/{id}/proposals` | Proposals panel |
| `GET /api/v1/projects/{id}/proposals/{id}` | Proposal detail page |
| `POST /api/v1/projects/{id}/proposals/{id}/accept` | Accept proposal |
| `POST /api/v1/projects/{id}/tasks/generate` | AI task generation |

**Blocked capability:** project mood boards depend on media attachment endpoints from rhizome#117.
| `GET /api/v1/projects/{id}/tasks?include_dependencies=true` | Gantt data |
| `POST /api/v1/tasks/{id}/dependencies` | Create dependency (Gantt drag) |
| `DELETE /api/v1/tasks/{id}/dependencies/{id}` | Remove dependency |
| `PATCH /api/v1/projects/{id}/tasks/bulk` | Gantt drag-reschedule |
| `GET /api/v1/garden/beds?available=true` | Planning allocation |
| `GET /api/v1/garden/containers?available=true` | Planning allocation |
| `GET/POST/PATCH/DELETE /api/v1/projects/{id}/expenses` | Resources tracker |
| `GET /api/v1/projects/{id}/expenses/summary` | Budget gauge |
| `GET/POST/PATCH/DELETE /api/v1/shopping` | Shopping list |
| `POST /api/v1/shopping/{id}/purchase` | Mark purchased |
| `GET /api/v1/projects/{id}/beds` | Allocated beds panel |
| `GET /api/v1/projects/{id}/containers` | Allocated containers panel |
| `GET /api/v1/projects/{id}/activity` | Activity tab |
| `GET /api/v1/projects/{id}/progress` | Progress ring |
| `GET /api/v1/garden/plants?project_id=X` | Plant progress panel |
