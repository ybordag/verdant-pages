# Garden Hub — `/app/garden`

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

A spatial plan of the garden rendered from `GET /api/v1/garden/layout` *(requires [rhizome#118](https://github.com/ybordag/rhizome/issues/118))*.

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

"Edit profile →" link opens the profile edit drawer.

### Constraints section (below hero, full width)

Two columns: Hard constraints and Soft preferences — from `GardenProfile.hard_constraints` and `soft_preferences` (JSON fields).

Rendered as a bulleted list with a dash marker styled in clay (hard) or pine (soft). Each constraint is an editable chip — clicking one opens inline text editing. An `+` button adds a new constraint. Changes call `PATCH /api/v1/garden/profile`.

---

## Tabs

### Areas / Beds

Beds grouped by their location string (e.g. Front Yard, Courtyard, Back Slope). Uses `GET /api/v1/garden/locations/{location}` to resolve groupings, then `GET /api/v1/garden/beds` for full detail.

Each row is a TanStack Table ledger row showing: name, size, sunlight, soil, plant count, care state indicator (colour dot: green/amber/red based on recency of last care event).

Clicking a row navigates to `/app/garden/beds/:id`.

An `+ Add bed` button opens a creation drawer. Form fields: name (required), location, size, sunlight, soil type, notes. Calls `POST /api/v1/garden/beds` *(requires [rhizome#116](https://github.com/ybordag/rhizome/issues/116))*.

**API:**
- `GET /api/v1/garden/beds` — list
- `GET /api/v1/garden/locations/{location}` — area groupings
- `POST /api/v1/garden/beds` *(rhizome#116)*

---

### Containers

All containers in a TanStack Table ledger. Columns: name, type, size, location, current plant (or "—"), mobile indicator, care state dot.

Clicking navigates to `/app/garden/containers/:id`.

`+ Add container` opens creation drawer: name, type (growbag/pot/raised/trough), size_gallons, location, is_mobile toggle. Calls `POST /api/v1/garden/containers`.

**API:**
- `GET /api/v1/garden/containers`
- `POST /api/v1/garden/containers`

---

### Plants

A card grid of all active plants (excludes `removed` status by default). Each card shows: common name, species in Caveat italic, status badge, location, and a colour-coded care state indicator.

Filter strip across the top: **All** | Seedling | Growing | Fruiting | Established | Removed.

Clicking a card navigates to `/app/plants/:id` (Plants has its own nav item and detail page — this tab is a portal into it, not a separate surface).

`+ Add plant` opens a creation drawer. Key fields: name, species, variety, source (seed/cutting/transplant/existing), bed or container assignment, sow date. Calls `POST /api/v1/garden/plants`.

**API:**
- `GET /api/v1/garden/plants?status=X` *(add location filter: rhizome#116)*

---

### Activity

Garden-wide activity feed scoped to care and garden events. Uses the global activity endpoint filtered to care category.

Cursor-paginated, newest first. Each row: date, event type, affected object (clickable link), summary text.

`GET /api/v1/activity?category=care` *(requires [rhizome#120](https://github.com/ybordag/rhizome/issues/120) for structured JSON and [rhizome#115](https://github.com/ybordag/rhizome/issues/115) for subject_type filter)*

---

## Navigation

```
Garden hub
  → Bed detail          click a bed row in Areas/Beds tab
  → Container detail    click a container row in Containers tab
  → Plant detail        click a plant card in Plants tab (→ /app/plants/:id)
  → Full map view       click "Expand ↗" on the map hero
  → Object linked to    clicking a bed/container on the expanded map
```

---

## API endpoints

| Endpoint | Used for | Status |
|---|---|---|
| `GET /api/v1/garden/profile` | Profile panel + constraints | ✅ exists (string response — blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `PATCH /api/v1/garden/profile` | Constraint editing | ✅ exists |
| `GET /api/v1/garden/layout` | Map hero | Blocked on [#118](https://github.com/ybordag/rhizome/issues/118) |
| `GET /api/v1/garden/beds` | Areas/Beds tab | ✅ exists (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `POST /api/v1/garden/beds` | Add bed | Blocked on [#116](https://github.com/ybordag/rhizome/issues/116) |
| `GET /api/v1/garden/locations/{location}` | Area grouping | ✅ exists (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `GET /api/v1/garden/containers` | Containers tab | ✅ exists (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `POST /api/v1/garden/containers` | Add container | ✅ exists |
| `GET /api/v1/garden/plants` | Plants tab | ✅ exists (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `POST /api/v1/garden/plants` | Add plant | ✅ exists |
| `GET /api/v1/activity?category=care` | Activity tab | Blocked on [#120](https://github.com/ybordag/rhizome/issues/120), [#115](https://github.com/ybordag/rhizome/issues/115) |
