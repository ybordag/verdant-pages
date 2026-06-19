# Garden Objects — Plants, Beds, Containers

## Overview

Plants, beds, and containers share a common detail page pattern. They are all physical garden entities with care histories, lifecycles, linked tasks, linked projects, and media attachments. One shared layout component handles all three; each type adds its own specific fields on top.

---

## Pages in this group

| Page | Route | Nav access |
|---|---|---|
| Plants list | `/app/plants` | Top-level nav item (frequent access) |
| Plant detail | `/app/plants/:id` | From plants list, garden hub Plants tab, task linked subject |
| Bed detail | `/app/garden/beds/:id` | From garden hub Areas/Beds tab, map |
| Container detail | `/app/garden/containers/:id` | From garden hub Containers tab, map |

Plants gets its own nav item because it is the most frequently visited object type. Beds and containers are accessed through the garden hub.

---

## Plants list page (`/app/plants`)

A dedicated page for plant management across the whole garden — more featured than the Plants tab in the garden hub.

**Layout:** filter rail (left) + card grid or ledger (main, toggleable).

**Filter rail:** Status (All / Seedling / Growing / Fruiting / Established / Removed), Location, Project, Batch.

**Card view:** botanical card per plant — common name large, species in Caveat italic below, status badge, location, last care indicator (days since last watered/fertilized).

**Ledger view:** TanStack Table — name, species/variety, status, location, source, sow date, last care. Sortable by any column.

**`+ Add plant` button** opens the creation drawer. Same form as the garden hub Plants tab.

**API:**
- `GET /api/v1/garden/plants?status=X&location=Y&project_id=Z` *(location filter requires [rhizome#116](https://github.com/ybordag/rhizome/issues/116))*

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

| Care field | Applies to |
|---|---|
| `last_watered_at` | Plant, Container, Bed |
| `last_fertilized_at` | Plant, Container, Bed |
| `last_amended_at` | Bed, Container |
| `last_inspected_at` | Plant, Container, Bed |
| `last_treated_at` | Plant |
| `last_pruned_at` | Plant |

Source: `GET /api/v1/garden/{type}/{id}/care/state` *(structured JSON requires [rhizome#120](https://github.com/ybordag/rhizome/issues/120))*

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
- Beds/Containers: `GET /api/v1/garden/{type}/{id}/activity?event_type=bed_amended&event_type=...` *(requires event_type filter: rhizome#120 addendum)*

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

Source: `GET /api/v1/tasks?subject_type=X&subject_id=Y` *(requires [rhizome#112](https://github.com/ybordag/rhizome/issues/112))*

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

### Bed detail (`/app/garden/beds/:id`)

**Additional:** soil type, size, sunlight level shown prominently in the header area (below the breadcrumb).

### Container detail (`/app/garden/containers/:id`)

**Additional:** container type, volume (size_gallons), mobile indicator. If `is_mobile`, a small "mobile" badge appears in the header.

---

## API endpoints per object type

### Plant

| Endpoint | Used for | Status |
|---|---|---|
| `GET /api/v1/garden/plants/{id}` | Header, lifecycle fields, linked projects, current batch | Blocked on [#116](https://github.com/ybordag/rhizome/issues/116) + [#120](https://github.com/ybordag/rhizome/issues/120) |
| `PATCH /api/v1/garden/plants/{id}` | Edit | ✅ |
| `PATCH /api/v1/garden/plants/{id}/remove` | Soft delete | ✅ |
| `DELETE /api/v1/garden/plants/{id}` | Hard delete | ✅ |
| `GET /api/v1/garden/plants/{id}/care/state` | Care state strip | ✅ exists (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `GET /api/v1/garden/plants/{id}/care/history` | *(future: care history panel)* | ✅ exists |
| `GET /api/v1/garden/plants/{id}/activity` | Activity history + lifecycle timeline | ✅ exists (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `GET /api/v1/tasks?subject_type=plant&subject_id=X` | Linked tasks | Blocked on [#112](https://github.com/ybordag/rhizome/issues/112) |
| `GET /api/v1/garden/plants/{id}/media` | Media gallery | Blocked on [#117](https://github.com/ybordag/rhizome/issues/117) |
| `POST /api/v1/garden/plants/{id}/media` | Upload image | Blocked on [#117](https://github.com/ybordag/rhizome/issues/117) |

### Bed

| Endpoint | Used for | Status |
|---|---|---|
| `GET /api/v1/garden/beds/{id}` | Header, current plants, linked projects | Blocked on [#116](https://github.com/ybordag/rhizome/issues/116) + [#120](https://github.com/ybordag/rhizome/issues/120) |
| `PATCH /api/v1/garden/beds/{id}` | Edit | ✅ |
| `DELETE /api/v1/garden/beds/{id}` | Delete | ✅ |
| `GET /api/v1/garden/beds/{id}/care/state` | Care state strip | ✅ exists (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `GET /api/v1/garden/beds/{id}/activity` | Activity history + lifecycle timeline | ✅ exists (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `GET /api/v1/tasks?subject_type=bed&subject_id=X` | Linked tasks | Blocked on [#112](https://github.com/ybordag/rhizome/issues/112) |
| `GET /api/v1/garden/beds/{id}/media` | Media gallery | Blocked on [#117](https://github.com/ybordag/rhizome/issues/117) |

### Container

| Endpoint | Used for | Status |
|---|---|---|
| `GET /api/v1/garden/containers/{id}` | Header, current plant, linked projects | Blocked on [#116](https://github.com/ybordag/rhizome/issues/116) + [#120](https://github.com/ybordag/rhizome/issues/120) |
| `PATCH /api/v1/garden/containers/{id}` | Edit | ✅ |
| `DELETE /api/v1/garden/containers/{id}` | Delete | ✅ |
| `GET /api/v1/garden/containers/{id}/care/state` | Care state strip | ✅ exists (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `GET /api/v1/garden/containers/{id}/activity` | Activity history + lifecycle timeline | ✅ exists (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `GET /api/v1/tasks?subject_type=container&subject_id=X` | Linked tasks | Blocked on [#112](https://github.com/ybordag/rhizome/issues/112) |
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
