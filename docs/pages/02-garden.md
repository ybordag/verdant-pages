# Garden Hub — `/app/garden`

**Last updated:** 2026-06-21

## Purpose

The garden hub is a portfolio-style overview page for the entire garden. It is the cover page — you come here to understand the whole picture, navigate into specific objects, and manage the garden's profile and constraints. It is not a detail surface; depth lives on the individual object pages.

---

## Layout

```
┌─────────────────────────────────────────────────┐
│  HERO: Garden plan/map view          [Expand ↗] │
│  Zone 9b · 18 objects · Bay Area                │
├────────────────────────┬────────────────────────┤
│  Profile stats         │  Constraints            │
│  Zone · Soil · Water   │  Hard: organic only,    │
│  Trays · Frost dates   │  no toxic plants        │
│  Lat/Lng               │  Soft: cottage, seeds   │
├────────────────────────┴────────────────────────┤
│  [Areas/Beds] [Containers] [Plants] [Activity]  │
├─────────────────────────────────────────────────┤
│  Tab content (scrollable)                       │
└─────────────────────────────────────────────────┘
```

---

## Hero section

### Map / plan view

A spatial plan of the garden rendered from `GET /api/v1/garden/layout`.

**Default state (minimap):** A compact plan view showing bed shapes, container positions, and area labels. Sized to fit within the hero without scrolling.

**Expanded state:** Full-screen overlay with pan and zoom. Clickable objects navigate to their detail page. Hovering an object shows its name, current status, and any attached image thumbnails. The overlay has a close button to return to the hub.

**Empty state (no layout):** A placeholder with the garden name, zone badge, and a prompt to start the layout — "Send Rhizome a sketch or photos to generate your garden plan."

The map renders bed/area fill colors based on status:
- Active/planted: pine green tint
- Empty/fallow: neutral
- Weather-flagged: cornflower blue tint
- Selected: chartreuse outline

### Profile panel (right of map)

Compact data grid from `GET /api/v1/garden/profile`:

| Field | Value |
|---|---|
| Zone | 9b |
| Soil | Hard clay |
| Indoor trays | 8 slots |
| Last frost | Mar 10 |
| First frost | Dec 1 |
| Mapped objects | 18 |

"Edit profile →" scrolls focus to the editable profile and constraints section.

### Constraints section (below hero, full width)

Two columns: Hard constraints and Soft preferences — from `GardenProfile.hard_constraints` and `soft_preferences` (JSON fields).

Rendered as a bulleted list with a dash marker styled in clay (hard) or pine (soft). Each constraint is an editable chip — clicking one opens inline text editing. An `+` button adds a new constraint. Changes call `PATCH /api/v1/garden/profile`.

---

## Tabs

The tabs are **previews only** — each shows a compact summary (up to 8 rows/cards) with a "See all →" link to the full dedicated list page. No filtering or sorting in the hub tabs themselves.

### Areas / Beds tab (preview)

Beds grouped by location string. Shows up to 8 — name, location, care state dot. "See all beds →" navigates to `/app/beds` (full `BedListPage`).

`+ Add bed` navigates to `/app/beds/new`.

**API:** `GET /api/v1/garden/beds` (first 8), `GET /api/v1/garden/locations/{location}` for area groupings.

---

### Containers tab (preview)

Shows up to 8 containers — name, type, current plant, care state dot. "See all containers →" navigates to `/app/containers` (full `ContainerListPage`).

`+ Add container` navigates to `/app/containers/new`.

**API:** `GET /api/v1/garden/containers` (first 8).

---

### Plants tab (preview)

Shows up to 8 plant cards — name, status badge, location, last care indicator. "See all plants →" navigates to `/app/plants` (full `PlantsPage`).

`+ Add plant` navigates to `/app/plants/new`.

**API:** `GET /api/v1/garden/plants?limit=8`

---

### BedListPage (`/app/beds`)

Full list page — filter rail + TanStack Table ledger. Filters: location/area, sunlight, care state. Sortable columns: name, location, last watered. Clicking a row → `/app/beds/:id`.

### ContainerListPage (`/app/containers`)

Full list page — filter rail + TanStack Table ledger. Filters: type, location, mobile, care state. Clicking a row → `/app/containers/:id`.

---

### Activity

Garden-wide activity feed scoped to care and garden events. Uses the global activity endpoint filtered to care category.

Cursor-paginated, newest first. Each row: date, event type, affected object (clickable link), summary text.

`GET /api/v1/activity?category=care`

---

## Navigation

```
Garden hub
  → BedListPage (/app/beds)               "See all beds →" in Areas/Beds tab
  → Bed detail (/app/beds/:id)            click a bed row in Areas/Beds tab preview
  → ContainerListPage (/app/containers)   "See all containers →" in Containers tab
  → Container detail (/app/containers/:id) click a container row in Containers tab preview
  → PlantsPage          "See all plants →" in Plants tab
  → Plant detail        click a plant card in Plants tab preview (→ /app/plants/:id)
  → Full map view       click "Expand ↗" on the map hero
  → Object linked to    clicking a bed/container on the expanded map
```

---

## API endpoints

| Endpoint | Used for |
|---|---|
| `GET /api/v1/garden/profile` | Profile panel + constraints |
| `PATCH /api/v1/garden/profile` | Constraint editing |
| `GET /api/v1/garden/layout` | Map hero |
| `GET /api/v1/garden/beds` | Areas/Beds tab |
| `POST /api/v1/garden/beds` | Add bed |
| `GET /api/v1/garden/locations/{location}` | Area grouping |
| `GET /api/v1/garden/containers` | Containers tab |
| `POST /api/v1/garden/containers` | Add container |
| `GET /api/v1/garden/plants` | Plants tab |
| `POST /api/v1/garden/plants` | Add plant |
| `GET /api/v1/activity?category=care` | Activity tab |

**Blocked capability:** advanced spatial layout/map rendering depends on rhizome#118.

---

## Open design questions

Carried over from earlier design exploration, not yet resolved by the spec above:

- Should Garden `Projects` be its own tab inside Garden, or should Garden only show garden-scoped project links while the full project page lives under `Projects`?
- Should the focused/expanded map state allow layer toggles (sunlight, water, containers, plants, projects, incidents) in the first real build, or stay visual-only until the layout itself is validated?
- How much of the `GardenProfile` edit surface belongs on the hub Overview versus a separate dedicated edit flow?
- Should areas/locations include beds as children, or should beds stay first-class objects alongside areas?
- Should garden areas be spatial map-first or ledger/list-first when there's no generated layout yet?
