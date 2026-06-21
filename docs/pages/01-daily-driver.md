# Daily Driver — Today, Tasks, Calendar

**Last updated:** 2026-06-21

## Overview

Three pages serving three distinct cognitive modes. They are deliberately separate — collapsing them produces a page that does two things awkwardly.

| Page | Mode | Purpose |
|---|---|---|
| **Today** | Orientation | Morning briefing. Read-first. What's happening, what did Rhizome flag. |
| **Tasks** | Operation | Work ledger. Complete, defer, edit, reprioritize, create, track progress. |
| **Calendar** | Temporal | Time-based view across all entity types. Scheduling and annotation surface. |

---

## Today (`/app/today`)

### Purpose

Morning orientation. Not a task management surface — a briefing. The user should be able to understand their day in under 30 seconds without needing to navigate anywhere.

### Layout

Three-column newspaper layout (matching the v2 prototype aesthetic):

**Left column — Conditions**
- Weather summary from `GET /api/v1/weather/latest`: temperature, wind, humidity, rain chance, UV, frost risk
- Compact data list, label/value pairs

**Centre column — Rhizome briefing**
- One-paragraph natural language summary from `GET /api/v1/triage/latest`
- Explains *why* these tasks, *why* today — the reasoning that disappears in the ledger view
- Pending interactions from `GET /api/v1/interactions/pending` — surface any approval cards inline here (not buried in the chat)
- "Open today's journal entry →" link to RhizomePage

**Right column — Overview**
- Active projects from `GET /api/v1/projects?status=active`: name, status indicator (●/◎/○), task count
- Mini calendar: current month, event dots, today highlighted in chartreuse
- "All projects →" link

**Below the fold — Today's tasks**
Top 5 tasks from `GET /api/v1/tasks/daily?limit=5`. Quick-complete checkbox on each row. Task type marker and source color visible. "All tasks →" navigates to `/app/tasks`.

**Below the fold — This week**
7-day strip (current week) with event dots per day, like the v2 prototype's "This Week" row.

### Interactions

- Click a task row → navigate to `/app/tasks` with that task highlighted (not complete from here — too passive a context)
- Click a task checkbox → complete the task with optimistic update (for users who want to act immediately)
- Click a project → navigate to `/app/projects/:id`
- Click the mini-calendar → navigate to `/app/calendar`
- Click a pending interaction card → approve/defer inline (same ProposalCard component used in RhizomePage)
- "Open today's journal entry →" → `/app/rhizome`

### API endpoints

| Endpoint | Used for |
|---|---|
| `GET /api/v1/triage/latest` | Rhizome briefing paragraph |
| `GET /api/v1/weather/latest` | Conditions column |
| `GET /api/v1/tasks/daily?limit=5` | Today's tasks strip |
| `GET /api/v1/projects?status=active` | Active projects list |
| `GET /api/v1/interactions/pending` | Pending approval cards |

---

## Tasks (`/app/tasks`)

### Purpose

The operational ledger. Where work actually happens. Designed for speed — completing, deferring, editing, and reprioritizing tasks with minimum friction. Think project management tool, not to-do list.

### Views (URL-driven)

All views share the same page component (`TasksPage`). The active view is determined by the URL. A **filter rail** on the left of the content area lists all views; the active view is highlighted.

| URL | View | API |
|---|---|---|
| `/app/tasks` | Today (default) | `GET /api/v1/tasks/daily` |
| `/app/tasks/week` | This Week | `GET /api/v1/tasks/due?days_ahead=7` |
| `/app/tasks/project/:id` | By Project | `GET /api/v1/tasks?project_id=X` |
| `/app/tasks/kind/:type` | By Kind | `GET /api/v1/tasks?type=X` |
| `/app/tasks/area` | By Area | `GET /api/v1/tasks?subject_type=X&subject_id=Y` *(requires [rhizome#112](https://github.com/ybordag/rhizome/issues/112))* |
| `/app/tasks/progress` | Progress | `GET /api/v1/activity/stats` *(requires [rhizome#115](https://github.com/ybordag/rhizome/issues/115))* |

### Layout

```
┌─ filter rail (~200px) ─┬─────────── ledger ────────────┬─ detail panel ─┐
│                        │  [velocity strip]              │ (slides in on  │
│  ● Today          7    │  ┌──────────────────────────┐ │  row click,     │
│  ○ This Week      12   │  │ Before work       3 open │ │  dark bg)       │
│  ○ By Project          │  │ ──────────────────────── │ │                 │
│    Summer Beds         │  │ ☐  Inspect tomatoes  10m │ │                 │
│    Rose Pruning        │  │ ☐  Check tray 3      12m │ │                 │
│  ○ By Kind             │  │ ☐  Photograph kale    8m │ │                 │
│  ○ By Area             │  ├──────────────────────────┤ │                 │
│  ─────────────         │  │ Weather adjusted  4 moved│ │                 │
│  ○ Progress            │  │ ☐  Skip container water  │ │                 │
└────────────────────────┴──────────────────────────────┴─────────────────┘
```

### Velocity strip (top of ledger)

Four summary cards shown across the top of the ledger area on the Today view:

| Card | Data source |
|---|---|
| Completed this week | `activity/stats?event_types=task_completed&since=7dAgo` |
| Current streak | Consecutive days with ≥1 completion (computed from stats) |
| Deferred rate | Deferrals vs completions ratio this week |
| Triage alignment | % of today's completed tasks that Rhizome recommended |

Requires [rhizome#115](https://github.com/ybordag/rhizome/issues/115).

### Ledger rows

**Columns:** checkbox · entry (title + meta) · context/subject · source · deadline/time

**Row sections** — contextual groupings (not just urgency tiers):
- "Before work", "This afternoon", "This week", "Weather adjusted", "Done today" — based on timing + source
- Section header shows count of open tasks in that group

**Source color coding (left border + row tint):**
- **Green** — Rhizome-generated task
- **Clay/terracotta** — user-created task
- **Cornflower blue** — weather-adjusted task

**Task type markers (checkbox shape):**
- **Square** — milestone or emergency
- **Circle** — maintenance (recurring care)
- **Diamond** — opportunistic (do when convenient)

### Task interactions

**Complete** — click the checkbox → optimistic strike-through, row moves to Done section at the bottom. Calls `POST /api/v1/tasks/:id/complete`. Reverts with error state if server rejects.

**Defer** — hover or long-press row → reveal quick actions. Defer opens a small inline date picker (no modal, no navigation). Calls `POST /api/v1/tasks/:id/defer`.

**Skip** — same hover/long-press menu. Requires a short reason text that appears inline. Calls `POST /api/v1/tasks/:id/skip`.

**Edit title inline** — click the task title text → makes it editable in place. Blur or Enter saves. Tab moves to the next editable field. Calls `PUT /api/v1/tasks/:id`.

**Reprioritize** — a small coloured priority badge (critical/high/normal/low) is visible on each row. Clicking it opens a dropdown to change it. This is a user-settable field.

**Priority vs. Urgency distinction:**
- **Priority** (`critical/high/normal/low`) — user-settable, shown as a badge on each row
- **Urgency** (`blocker/time_sensitive/scheduled/backlog`) — computed by Rhizome's daily scoring, shown as the section group. A tooltip on the section header explains why tasks are in that tier ("deadline in 2 days", "triage-recommended").

**View detail** — clicking anywhere on a row (not the checkbox, title, or badges) slides in the **detail panel** from the right. Dark background. Shows: full title, type/status/priority, all timing fields (scheduled date, window, deadline, deferred_until, event anchor), linked subjects as clickable chips, blocker chain, notes, and full action set. "Open full page →" navigates to `/app/tasks/:id`.

**Full task page (`/app/tasks/:id`)** — the complete editable view. All fields, inline editing, blocker visualization, linked subject links, full activity history. Used for complex edits that don't fit the panel.

### Task creation

**Trigger:** `+` button in the ledger header, or "New Task" in the sidebar quick actions.

**Interface:** dedicated route at `/app/tasks/new`. Context-aware pre-fill:
- In By Project view → `project_id` pre-filled
- In By Kind view → `type` pre-filled
- In By Area view → `linked_subjects` pre-filled with the selected subject

**Basic fields:** title (required), type (required), priority, scheduled date, deadline, estimated minutes, notes, linked subjects (plant/bed/container picker), reversible toggle.

**"Make recurring" toggle** — expands additional series fields: cadence (daily / weekly / every N days / custom), start date, end date, window days (how long the materialized instance stays open). On save, creates a `TaskSeries` via `POST /api/v1/tasks/series`.

**Series editing** — editing an existing series rule lives at `/app/tasks/series/:id`, not in the creation drawer. This is a separate page because changing a rule has forward-only implications (it doesn't retroactively change existing instances).

### Progress view (`/app/tasks/progress`)

Cross-project velocity view. Accessed from the filter rail.

- **14-day completion bar chart** — completions per day from `activity/stats?group_by=day&since=14dAgo`
- **Type distribution** — what % milestone vs maintenance vs emergency vs opportunistic
- **Deferred task list** — tasks deferred 3+ times, with "Ask Rhizome about this →" link to start a chat thread about the specific task
- This view connects the task ledger back to Rhizome — persistent deferrals are a signal worth discussing with the agent

Uses `GET /api/v1/activity/stats`.

### API endpoints

| Endpoint | View / Action |
|---|---|
| `GET /api/v1/tasks/daily` | Today view |
| `GET /api/v1/tasks/due?days_ahead=7` | This Week view |
| `GET /api/v1/tasks?project_id=X` | By Project view |
| `GET /api/v1/tasks?type=X` | By Kind view |
| `GET /api/v1/tasks?subject_type=X&subject_id=Y` | By Area view *(rhizome#112)* |
| `GET /api/v1/tasks/:id` | Task detail panel + full page |
| `POST /api/v1/tasks/:id/complete` | Complete action |
| `POST /api/v1/tasks/:id/defer` | Defer action |
| `POST /api/v1/tasks/:id/skip` | Skip action |
| `POST /api/v1/tasks/:id/start` | Start action |
| `PUT /api/v1/tasks/:id` | Inline edit / reprioritize |
| `DELETE /api/v1/tasks/:id` | Delete *(rhizome#112)* |
| `POST /api/v1/tasks` | Create task *(rhizome#112)* |
| `POST /api/v1/tasks/series` | Create series *(rhizome#113)* |
| `PATCH /api/v1/tasks/series/:id` | Edit series |
| `DELETE /api/v1/tasks/series/:id` | Delete series *(rhizome#113)* |
| `GET /api/v1/activity/stats` | Velocity strip + Progress view *(rhizome#115)* |

---

## Calendar (`/app/calendar`)

### Purpose

The temporal view across all entity types. Not a task list in calendar form — it shows tasks, incidents, weather events, and annotations together. Used for understanding the rhythm of the garden over time and for scheduling decisions (drag tasks between days).

### What it shows

| Entity | Source | Visual |
|---|---|---|
| Rhizome tasks | `tasks/due?days_ahead=30` | Green left-bordered chip |
| User tasks | Same endpoint | Clay/terracotta chip |
| Weather tasks | Same endpoint | Cornflower blue chip |
| Incidents | `GET /api/v1/incidents` | Distinct incident chip |
| Weather events | `GET /api/v1/weather/latest` | Day cell weather icon |
| Annotations | `GET /api/v1/calendar/annotations` | Text preview below chips *(rhizome#114)* |

### Layout

```
┌──────────────────────────────────────┬──────────────────┐
│  [filter strip: All/Tasks/Incidents] │  right margin    │
├──────────────────────────────────────│  ── planner ──   │
│  Su  Mo  Tu  We  Th  Fr  Sa         │  04              │
│ ┌──┬──┬──┬──┬──┬──┬──┐              │  April 2026      │
│ │29│30│31│ 1│ 2│ 3│ 4│              │                  │
│ │  │  │  │🌤│🌤│☁️│🌤│              │  [today's note]  │
│ ├──┼──┼──┼──┼──┼──┼──┤              │                  │
│ │  │  │  │  │  │  │  │              │  ☑ Set rhythm    │
│ │  │  │  │  │  │  │  │              │  ☐ Harden crops  │
│ │  │TODAY│  │  │  │  │              │  ☐ Photo damage  │
│ └──┴──┴──┴──┴──┴──┴──┘              │                  │
│                                      │  [March] [May]   │
└──────────────────────────────────────┴──────────────────┘
```

**Right margin panel (planner aesthetic):**
- Current month number in large botanical display font (Shantell Sans)
- Month name in Caveat
- Selected day's annotation — editable inline
- Month-level checklist (persistent notes for this month, not day-specific)
- Mini-calendars for previous and next months with weather colour hints

### Day cells

Each cell contains:
- Date number (top left)
- Weather icon from forecast (top right) — from meteocons SVG set
- Task/incident chips (source-coded, truncated at 3–4 with "+N more")
- Annotation preview (first line of text if any)

**Today** highlighted with cornflower blue top border and tinted background (matching the mockup's `.calendar-day.today`).

**Outside-month days** shown at reduced opacity.

### Interactions

**Drag a task chip** — Pragmatic DnD. Drag from one day cell, drop on another. Calls `PUT /api/v1/tasks/:id` with new `scheduled_date`. Optimistic — task moves immediately, reverts on error.

**Click a day cell** — opens a **day detail panel** alongside the calendar (no navigation). Shows: full task list for that day (with complete checkboxes), the annotation with an inline edit field, weather detail, and a "List view →" link to Tasks page filtered to that date.

**Click a task chip** — opens the same task detail panel as the Tasks page (same `DetailPanel` component), also shows "View in list →".

**Click an incident chip** — navigates to `/app/incidents/:id`.

**Annotate a day** — click an empty area inside a day cell (or the annotation preview). An inline text input appears. Supports content + optional category (note/observation/plan/reminder). Saves on blur. Requires [rhizome#114](https://github.com/ybordag/rhizome/issues/114).

### Filters

A filter strip across the top of the calendar:

`All` | `Tasks` | `Incidents` | `Weather` | `Annotations`

Plus a project dropdown to filter tasks to a single project. "Tasks" filter is what "navigate to calendar from Tasks page" applies.

### Views

Month (default) / Week toggle (segmented control in the topbar). Week view shows more task detail per cell — full task title, time estimate, action buttons visible without expanding.

### API endpoints

| Endpoint | Used for |
|---|---|
| `GET /api/v1/tasks/due?days_ahead=30` | Task chips across month |
| `GET /api/v1/incidents` | Incident chips |
| `GET /api/v1/weather/latest` | Day cell weather icons |
| `GET /api/v1/calendar/annotations?since=X&before=Y` | Annotation text *(rhizome#114)* |
| `POST /api/v1/calendar/annotations` | Create annotation *(rhizome#114)* |
| `PATCH /api/v1/calendar/annotations/:id` | Edit annotation *(rhizome#114)* |
| `DELETE /api/v1/calendar/annotations/:id` | Delete annotation *(rhizome#114)* |
| `PUT /api/v1/tasks/:id` | Drag-to-reschedule |

---

## Navigation between pages

```
Today
  → Tasks page         click a task row, or "All tasks →"
  → Calendar           click the mini-calendar
  → Rhizome chat       "Open today's journal entry →"
  → Project detail     click a project in the overview

Tasks
  → Task detail panel  click a row (not checkbox or title)
  → Task full page     "Open full page →" in detail panel
  → Calendar           click task's scheduled date in panel, or direct nav
  → Plant/Bed/Container detail  click a linked subject chip in panel
  → Rhizome chat       "Ask Rhizome →" from the Progress view deferred list

Calendar
  → Task detail panel  click a task chip
  → Tasks (list view)  "List view →" in the day detail panel
  → Incident detail    click an incident chip
```

---

## Shared components used across these pages

**`DetailPanel`** — dark background right panel, used for task detail in Tasks and day detail in Calendar. Same component, different content.

**`TaskRow`** — the ledger row. Used in Tasks (in the ledger), in Today (top 5 strip), and in the day detail panel in Calendar.

**`ProposalCard`** — the interaction approval card. Used in Today (pending approvals) and in RhizomePage (proposals panel).

**`MiniCalendar`** — the compact month grid with event dots. Used in Today (right column) and in Calendar (adjacent months in the margin panel).

**`VelocityStrip`** — the four summary cards. Used only at the top of the Tasks ledger.
