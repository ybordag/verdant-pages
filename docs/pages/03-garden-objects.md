# Garden Objects — Plants, Beds, Containers

**Last updated:** 2026-06-21

## Overview

Plants, beds, and containers share a common detail page pattern. They are all physical garden entities with care histories, lifecycles, linked tasks, linked projects, and media attachments. One shared layout component handles all three; each type adds its own specific fields on top.

---

## Pages in this group

| Page | Route | Nav access |
|---|---|---|
| Plants list | `/app/plants` | Top-level nav item (frequent access) |
| Plant detail | `/app/plants/:id` | From plants list, garden hub Plants tab, task linked subject |
| Bed detail | `/app/beds/:id` | From bed list, garden hub Areas/Beds tab preview, map |
| Container detail | `/app/containers/:id` | From container list, garden hub Containers tab preview, map |

Plants gets its own nav item because it is the most frequently visited object type. Beds and containers are accessed through the garden hub.

---

## Creation patterns

| Object | Route | Pattern |
|---|---|---|
| Bed | `/app/beds/new` | Static form — all fields on one page, no wizard |
| Container | `/app/containers/new` | Static form — all fields on one page, no wizard |
| Plant | `/app/plants/new` | Progressive wizard — 4 steps (see below) |
| Task series (care) | `/app/tasks/series/new` | Dedicated form page |

**Why static forms for beds/containers:** they have few enough fields (5–6) that a multi-step wizard adds friction without clarity. Drawers are not used elsewhere in the app, so a dedicated page keeps the pattern consistent.

**Why a wizard for plants:** plants have ~15 fields with logical dependencies between them. The wizard surfaces only what's relevant at each stage.

### Plant creation wizard (`/app/plants/new`)

**Step 1 — Identity:** Common name (required), species, variety, source (`seed / cutting / transplant / existing`)

**Step 2 — Location:** Assign to a bed or container (picker from available locations). Optional at creation — can be assigned later.

**Step 3 — Timing:** Date fields appropriate to source:
- Seed: sow date, red cup date (optional), transplant date (optional), harvest expected (optional)
- Cutting / Transplant / Existing: transplant/introduction date only

**Step 4 — Care + Batch:** Fertilizing schedule, special instructions. Toggle: "Part of a batch?" → if yes: quantity, seed lot reference, grow light assignment, tray assignment. Batch creation calls `POST /api/v1/garden/plants/batch`.

Each step shows a progress indicator. "Back" and "Next/Finish" buttons. Any step can be skipped (fields are optional beyond step 1).

### Bed creation (`/app/beds/new`)

Static form at `/app/beds/new`: name (required), location/area, size, sunlight, soil type, notes. Calls `POST /api/v1/garden/beds` *(rhizome#116)*.

### Container creation (`/app/containers/new`)

Single static form: name (required), type (growbag / ceramic pot / trough / raised / other), size in gallons, location, mobile toggle, notes. Calls `POST /api/v1/garden/containers`.

---

## Editing pattern — inline field editing

All detail pages use **inline field editing**. Clicking any editable field makes it editable in place — text fields become `<input>` or `<textarea>`, enums become `<select>`, dates open a date picker. Blur or Enter saves. Escape cancels. Changes call `PATCH` on the respective endpoint.

Fields that are system-generated (IDs, created_at, care timestamps) are read-only. Care timestamps are updated via the care recording action, not direct field editing.

**Special purpose-built components** exist for interactions that are too complex for inline editing:
- Plant lifecycle transitions (sow → red cup → transplant → harvest/remove) — dedicated action buttons with timestamp pickers
- Project Gantt drag, proposal review cards, budget tracker (see [04-projects.md](04-projects.md))

---

## Plants list page (`/app/plants`)

A dedicated page for plant management across the whole garden — more featured than the Plants tab in the garden hub.

**Layout:** filter rail (left) + card grid or ledger (main, toggleable).

**Filter rail:** Status (All / Seedling / Growing / Fruiting / Established / Removed), Location, Project, Batch.

**Card view:** botanical card per plant — common name large, species in Caveat italic below, status badge, location, last care indicator (days since last watered/fertilized).

**Ledger view:** TanStack Table — name, species/variety, status, location, source, sow date, last care. Sortable by any column.

**`+ Add plant` button** navigates to `/app/plants/new`.

**API:**
- `GET /api/v1/garden/plants?status=X&location=Y&project_id=Z`

---

## Shared Garden Object detail pattern

All three detail pages share this layout:

```
┌───────────────────────────────────────────────────────────┐
│  HEADER                                                   │
│  [Type badge]  Object Name        [Edit]  [Delete/Remove] │
│  Location breadcrumb · Status badge                       │
├───────────────────────────────────────────────────────────┤
│  CARE STATE STRIP                                         │
│  💧 Watered  3d ago   🌱 Fertilized  12d ago              │
│  🪨 Amended  —        🔍 Inspected   5d ago               │
├───────────────────────────────────────────────────────────┤
│  LIFECYCLE TIMELINE                                       │
│  ────●─────────●──────────────●────────────────●─────►   │
│  [Milestone]  [Milestone]    [Milestone]      [Next]      │
├───────────────────────────────────────────────────────────┤
│  [Linked projects]    [Current plants]   [Media gallery]  │
├───────────────────────────────────────────────────────────┤
│  LINKED TASKS                    ACTIVITY HISTORY         │
│  Open tasks for this object │   Full event feed           │
└───────────────────────────────────────────────────────────┘
```

### 1. Header

Name, type badge (Bed / Container / Plant), location breadcrumb (links back to the parent area/location), status badge.

Actions: Edit (opens inline edit form or drawer), Delete/Remove (plants have soft `remove` and hard `delete` options; beds/containers have hard delete). Destructive actions prompt confirmation.

### 2. Care state strip

Six care dimensions displayed as labelled tiles, colour-coded by recency:
- 🟢 Green — last action within normal care window
- 🟡 Amber — approaching due
- 🔴 Red — overdue

**Quick care recording:** each tile has a small "Log" button (clock icon). Tapping it opens a minimal inline popover — datetime picker (defaults to now) and optional notes field. Submitting calls `POST /api/v1/garden/{type}/{id}/care` with `{ care_type, notes, recorded_at }`.

The endpoint finds any existing pending care task of the matching type linked to this object (from a task series first, then standalone) and completes it — or creates a one-off care task and immediately completes it if none exists. Task completion triggers Rhizome's `infer_care_action`, updating the care timestamp and recording an `ActivityEvent`. The tile flashes green and the timestamp refreshes.

This means **care is always tracked as tasks** — the quick button is just a fast path that collapses create + complete into a single tap. For planned recurring care, the task series provides the task; for ad-hoc care, a one-off task is created transparently.

Source: `POST /api/v1/garden/{type}/{id}/care`

| Care field | Applies to |
|---|---|
| `last_watered_at` | Plant, Container, Bed |
| `last_fertilized_at` | Plant, Container, Bed |
| `last_amended_at` | Bed, Container |
| `last_inspected_at` | Plant, Container, Bed |
| `last_treated_at` | Plant |
| `last_pruned_at` | Plant |

Source: `GET /api/v1/garden/{type}/{id}/care/state`

### 3. Lifecycle timeline

A horizontal timeline showing milestones for this object.

**Plants — explicit date fields:**

```
Sow ──● ── Red Cup ──● ── Transplant ──● ── Harvest/Established ──●
```

Fields: `sow_date`, `red_cup_date`, `transplant_date`, `harvest_expected`. Each milestone shows date and elapsed time. Future milestones shown as hollow dots.

**Beds and Containers — activity-derived:**

Built from `GET /api/v1/garden/{type}/{id}/activity?event_type=X` filtered to lifecycle events: soil prep, amendment, mulching, repotting, seasonal preparation. Each event appears as a labelled milestone on the timeline.

The `ObjectLifecycleTimeline` component is shared across all three types — it accepts a `milestones: Milestone[]` prop regardless of how the data was derived.

Source:
- Plants: lifecycle fields from `GET /api/v1/garden/plants/{id}` *(rhizome#116)*
- Beds/Containers: `GET /api/v1/garden/{type}/{id}/activity?event_type=bed_amended&event_type=...`

### 4. Linked projects

Chips showing which projects this object is part of. Clicking a chip navigates to `/app/projects/:id`.

Source: embedded `projects` array in the detail endpoint response *(rhizome#116 addendum)*

### 5. Current plants *(beds and containers only)*

A compact plant list showing what is currently growing in this bed or container. Each entry: plant name, status badge, sow date. Clicking navigates to `/app/plants/:id`.

Source: embedded `current_plants` array in bed/container detail response *(rhizome#116)*

### 6. Media gallery

Image grid with thumbnail previews. Clicking an image opens a full-size lightbox with caption. An `+` button opens a file picker to upload a new image.

Requires [rhizome#117](https://github.com/ybordag/rhizome/issues/117).

### 7. Linked tasks

Open tasks where this object appears in `linked_subjects`. Displayed as a compact task list — checkbox, title, urgency, deadline. Completing a task from here calls `POST /api/v1/tasks/{id}/complete` with optimistic update.

Source: `GET /api/v1/tasks?subject_type=X&subject_id=Y`

### 8. Activity history

Full scrollable event feed, newest first. Each row: date, event type label, summary text, actor (Rhizome/User). Cursor-paginated via `before_timestamp`.

Source: `GET /api/v1/garden/{type}/{id}/activity?before_timestamp=X&limit=20` *(structured JSON and pagination params require [rhizome#120](https://github.com/ybordag/rhizome/issues/120))*

---

## Object-specific additions

### Plant detail (`/app/plants/:id`)

**Additional sections beyond the shared pattern:**

**Propagation details** — source (seed/cutting/transplant/existing), batch provenance (links to the `PlantBatch` record if seeded in a batch), grow light assignment.

**Care schedule** — `fertilizing_schedule` and `special_instructions` displayed as a formatted card. Editable inline.

**Variety info** — species (in Caveat italic), variety name, family. Read-only from the plant record.

### Bed detail (`/app/beds/:id`)

**Additional:** soil type, size, sunlight level shown prominently in the header area (below the breadcrumb).

### Container detail (`/app/containers/:id`)

**Additional:** container type, volume (size_gallons), mobile indicator. If `is_mobile`, a small "mobile" badge appears in the header.

---

## API endpoints per object type

### Plant

| Endpoint | Used for | Status |
|---|---|---|
| `GET /api/v1/garden/plants/{id}` | Header, lifecycle fields, linked projects, current batch | ✅ |
| `PATCH /api/v1/garden/plants/{id}` | Edit | ✅ |
| `PATCH /api/v1/garden/plants/{id}/remove` | Soft delete | ✅ |
| `DELETE /api/v1/garden/plants/{id}` | Hard delete | ✅ |
| `GET /api/v1/garden/plants/{id}/care/state` | Care state strip | ✅ |
| `GET /api/v1/garden/plants/{id}/care/history` | *(future: care history panel)* | ✅ exists |
| `GET /api/v1/garden/plants/{id}/activity` | Activity history + lifecycle timeline | ✅ |
| `GET /api/v1/tasks?subject_type=plant&subject_id=X` | Linked tasks | ✅ |
| `GET /api/v1/garden/plants/{id}/media` | Media gallery | Blocked on [#117](https://github.com/ybordag/rhizome/issues/117) |
| `POST /api/v1/garden/plants/{id}/media` | Upload image | Blocked on [#117](https://github.com/ybordag/rhizome/issues/117) |

### Bed

| Endpoint | Used for | Status |
|---|---|---|
| `GET /api/v1/garden/beds/{id}` | Header, current plants, linked projects | ✅ |
| `PATCH /api/v1/garden/beds/{id}` | Edit | ✅ |
| `DELETE /api/v1/garden/beds/{id}` | Delete | ✅ |
| `GET /api/v1/garden/beds/{id}/care/state` | Care state strip | ✅ |
| `GET /api/v1/garden/beds/{id}/activity` | Activity history + lifecycle timeline | ✅ |
| `GET /api/v1/tasks?subject_type=bed&subject_id=X` | Linked tasks | ✅ |
| `GET /api/v1/garden/beds/{id}/media` | Media gallery | Blocked on [#117](https://github.com/ybordag/rhizome/issues/117) |

### Container

| Endpoint | Used for | Status |
|---|---|---|
| `GET /api/v1/garden/containers/{id}` | Header, current plant, linked projects | ✅ |
| `PATCH /api/v1/garden/containers/{id}` | Edit | ✅ |
| `DELETE /api/v1/garden/containers/{id}` | Delete | ✅ |
| `GET /api/v1/garden/containers/{id}/care/state` | Care state strip | ✅ |
| `GET /api/v1/garden/containers/{id}/activity` | Activity history + lifecycle timeline | ✅ |
| `GET /api/v1/tasks?subject_type=container&subject_id=X` | Linked tasks | ✅ |
| `GET /api/v1/garden/containers/{id}/media` | Media gallery | Blocked on [#117](https://github.com/ybordag/rhizome/issues/117) |

---

## Shared components

**`ObjectDetailHeader`** — name, type badge, location breadcrumb, status badge, edit/delete actions. Parameterised by object type.

**`CareStateStrip`** — six care tiles with recency colouring. Takes a `CareStateView` object.

**`ObjectLifecycleTimeline`** — horizontal milestone timeline. Takes `milestones: { label, date, completed }[]` — agnostic to data source.

**`LinkedProjectChips`** — chip list of associated projects with navigation links.

**`MediaGallery`** — image grid with lightbox and upload. Takes `mediaItems[]` and an `onUpload` callback.

**`LinkedTasksList`** — compact task list with quick-complete. Same `TaskRow` component used in the Tasks page.

**`ObjectActivityFeed`** — cursor-paginated event feed. Shared with the Activity group.

---

## Open design questions

Carried over from earlier design exploration, not yet resolved by the spec above:

- Should the Plants page default to showing all plants, only active plants, or only plants with current work?
- Do plants belong in one flat inventory, grouped by area, or grouped by lifecycle stage?
- How should plant varieties/cultivars be represented in the card/ledger views?
