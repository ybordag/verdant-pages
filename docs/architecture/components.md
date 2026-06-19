# Component Library

## Styling approach

- **CSS modules** for component-specific styles — each component gets a `.module.css` file, locally scoped
- **Global `tokens.css`** — the single source of truth for all design tokens (see [design-tokens.md](design-tokens.md))
- **Global `utilities.css`** — a small set of shared utility classes ported from the prototype:
  - `.dg` — dot-grid background (used in chat, calendar cells)
  - `.gg` — line-grid background (used in the map placeholder)
  - `.chip` — pill-shaped tag
  - `.hr` — hover row (subtle background on hover)
  - `.cd` — clickable div (pointer cursor + hover)
  - `.nb` — nav button (font-label, uppercase, no border)
- **No CSS-in-JS**, no Tailwind — CSS custom properties referenced via `var(--token-name)` everywhere
- **Never hardcode colour values** in component files — always reference tokens

---

## Key libraries

| Library | Used for |
|---|---|
| **TanStack Table v8** | All ledger-style data tables (tasks, beds, containers, plants, expenses, shopping list). Headless — we apply token-based styling. |
| **Pragmatic Drag and Drop** | Calendar task rescheduling, Gantt task/dependency dragging. Chosen over @dnd-kit for native browser event performance. |
| **TanStack Query v5** | All server state — fetch, cache, optimistic mutations. No component fetches directly. |

---

## Component tiers

Three tiers. The rule: **can you write a meaningful test or Storybook story for it in isolation?**

| Tier | Domain knowledge | Examples |
|---|---|---|
| **Primitives** | None | Button, Input, Chip, Modal |
| **Composed** | Domain types | TaskRow, ProposalCard, CareStateStrip |
| **Pages** | Full page + data fetching | TodayPage, TasksPage |
| **Layout** | Routing, not domain data | VPNav, AppShell |

---

## Primitives

No domain knowledge. Props are generic. Could be dropped into any app.

| Component | Description |
|---|---|
| `Button` | `variant`: `primary` (chartreuse fill), `ghost` (transparent + line border), `danger`. Size: `sm` / `md` (default). |
| `Input` | Styled `<input>` with chartreuse focus ring. Matches `input` in global CSS. |
| `Select` | Styled `<select>`. `options` prop or `children`. |
| `Textarea` | Auto-resize `<textarea>` with chartreuse caret. |
| `Chip` | Pill tag. `color` prop maps to brand tokens. `removable` shows `×` button. |
| `FieldLabel` | Uppercase Montserrat label — `--font-label`, 9–10px, letter-spaced. Equivalent to prototype's `LBL` / `SMLL` style objects. |
| `Modal` | Overlay + centered card. Closes on Escape + backdrop click. Focus-trapped. Equivalent to prototype's `EditModal`. |

**No drawers** — the app does not use the drawer pattern. Bed and container creation use dedicated `/new` pages. Wizards use dedicated `/new` routes. This was an explicit design decision for consistency.

---

## Layout

| Component | Description |
|---|---|
| `VPNav` | Fixed left sidebar. 210px expanded, 52px collapsed. Three nav sections, two widgets, one footer. See full spec below. |
| `AppShell` | Root layout: `VPNav` + `.cw` content wrapper (flex column, takes remaining width). Optional right panel slot (used by RhizomePage and the notification drawer). |
| `Breadcrumb` | `.bc` breadcrumb bar — `--font-label`, 9px, uppercase, letter-spaced, `--text-m`. Shows current location. |

### VPNav — full specification

**Nav sections (three groups, separated by dividers):**

| Group | Items | Badge |
|---|---|---|
| Orientation | Rhizome, Today | Rhizome: pending interaction count |
| Work | Tasks, Calendar, Projects | Tasks: open task count; Projects: active project count |
| Operational | Incidents, Activity | Incidents: open incident count |

Garden and Plants are **not** top-level nav items — they are accessed through the garden profile card widget (see below).

**Active state:** chartreuse left border + chartreuse text (`--nav-accent`) + `--nav-active-bg` tint.

**Badge counts (expanded mode only):** chartreuse pill showing the count. Disappears in collapsed mode.

**Pending state in collapsed mode:** when an item has pending items but the nav is collapsed, the icon renders at `--text-p` (fully lit, 94% opacity) instead of the default `--text-s` (70%). No badge, no dot — just the icon appears "on." Active item remains chartreuse.

**Icons:** SVG icons for each nav item (all already in the prototype). In collapsed mode the label and badge hide; only the icon and pending-state colour remain.

**Widgets (below nav sections):**

**Quick actions panel** — three action buttons:
- "Ask Rhizome" → `/app/rhizome`
- "+ New Task" → `/app/tasks/new`
- "▶ Run Triage" → `POST /api/v1/triage/run`

In **collapsed mode**: the panel collapses to three stacked icon buttons (speech bubble / plus / play triangle). Labels hidden.

**Garden profile card** — the portal to all garden objects. Shows: zone badge, object count, mini plot grid, and chip links to Garden, Plants, Beds, Containers. In **collapsed mode**: collapses to a single garden icon button that navigates to `/app/garden`. Mini map, chips, and labels hidden.

**Footer (bottom of sidebar):**

```
[avatar]  you@email.com         ← truncated if long
                   [☀️/🌙]  [🔔]
```

- Avatar + email: clicking opens `/app/settings`
- Theme toggle: switches between dark/light, persists to `localStorage('vp_theme')`
- Notifications button (🔔): opens the **notification drawer** from the right edge of the screen — the only drawer in the app

In **collapsed mode**: avatar icon only (no email), theme + notification icon buttons remain.

**Notification drawer** — slides in from the right when 🔔 is clicked. Contains the notification panel (In Progress jobs, Pending Approvals, Alerts). This is the one and only drawer in the application. All other creation/editing flows use dedicated pages or inline interactions.

---

## Shared composed components

These are reused across multiple pages. Each knows about domain types.

### `LedgerTable`

Wrapper around **TanStack Table v8**. Used for all tabular data (beds, containers, plants, tasks in ledger view, expenses, shopping list).

```typescript
interface LedgerTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  enableSorting?: boolean;
  enableFiltering?: boolean;
}
```

Applies token-based styling: chartreuse-tinted header row, `--line-on-paper` row borders, hover state via `.hr` utility. Column header has sort indicator when `enableSorting` is true.

### `DetailPanel`

Dark-background right panel that slides in when a row is clicked. Used in:
- **Tasks page** — task detail
- **Calendar page** — day detail

```typescript
interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}
```

Dark background (`--bg-nav`), chartreuse top border accent, `border-left: 1px solid var(--line)`. Width: 270–340px. Closes on Escape or clicking outside.

### `ObjectDetailHeader`

Shared header for Plant, Bed, and Container detail pages.

```typescript
interface ObjectDetailHeaderProps {
  name: string;
  typeBadge: string;                    // "Plant" | "Bed" | "Container"
  locationBreadcrumb?: string;          // links back to garden hub
  statusBadge?: string;
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel?: string;                 // "Delete" | "Remove" (plants use "Remove")
}
```

### `CareStateStrip`

Six care tiles for plant/bed/container detail pages. Colour-coded by recency: green (recent), amber (due), red (overdue). Each tile has a "Log" button that opens an inline popover — datetime picker + optional note — and fires `POST /api/v1/garden/{type}/{id}/care`.

```typescript
interface CareStateStripProps {
  careState: CareStateView;
  subjectType: "plant" | "bed" | "container";
  subjectId: string;
  onCareRecorded: () => void;           // refetch after logging
}
```

### `ObjectLifecycleTimeline`

Horizontal milestone timeline. Shared across plant detail (explicit date fields) and bed/container detail (activity-derived milestones).

```typescript
interface Milestone {
  label: string;
  date: Date | null;
  completed: boolean;
}

interface ObjectLifecycleTimelineProps {
  milestones: Milestone[];
}
```

Filled dots = completed. Hollow dots = upcoming. Dates shown below each dot. Plant detail populates from `sow_date`, `red_cup_date`, `transplant_date`, `harvest_expected`. Bed/container detail populates from activity events filtered to lifecycle event types.

### `ObjectActivityFeed`

Cursor-paginated activity feed. Used on the `/app/activity` full page AND embedded in every object detail page (plant, bed, container, task, incident, project).

```typescript
interface ObjectActivityFeedProps {
  endpoint: string;         // e.g. '/api/v1/activity' or '/api/v1/garden/plants/:id/activity'
  showFilters?: boolean;    // true on full-page, false on detail page sections
  limit?: number;           // default 20
}
```

### `LinkedProjectChips`

Chips showing which projects an object is associated with. Clicking navigates to `/app/projects/:id`.

```typescript
interface LinkedProjectChipsProps {
  projects: { id: string; name: string; status: string }[];
}
```

### `MediaGallery`

Image grid with thumbnail previews. Clicking opens a lightbox. `+` button opens a file picker. Requires [rhizome#117](https://github.com/ybordag/rhizome/issues/117).

```typescript
interface MediaGalleryProps {
  mediaItems: MediaItem[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (mediaId: string) => void;
}
```

### `MiniCalendar`

Compact 7-column month grid with event dots. Used in Today page (right column) and Calendar page (adjacent months in margin panel). Wraps `CalendarGrid` with compact sizing props.

### `VelocityStrip`

Four summary cards at the top of the Tasks ledger — completed this week, streak, deferred rate, triage alignment. Populated from `GET /api/v1/activity/stats`. Requires [rhizome#115](https://github.com/ybordag/rhizome/issues/115) (done ✅).

### `ProposalCard`

The approval card for structured Rhizome interactions. Used in:
- **RhizomePage** interaction panel (full card)
- **Today page** pending approvals (compact card)

```typescript
interface ProposalCardProps {
  interaction: InteractionEnvelopeView;
  onAccept: () => void;       // fires POST /api/v1/chat/resume/stream
  onDefer: () => void;
  onRequestRevision?: () => void;
  compact?: boolean;          // Today page uses compact=true
}
```

Accept triggers the chartreuse flash animation (`.af` from prototype) then calls resume stream.

### `LinkedTasksList`

Compact task list showing tasks where this object is a `linked_subject`. Quick-complete checkbox calls `POST /api/v1/tasks/{id}/complete` with optimistic update. Same `TaskRow` component used in the Tasks page. Requires [rhizome#112](https://github.com/ybordag/rhizome/issues/112) (done ✅).

---

## Calendar components

### `CalendarGrid`

The core calendar renderer. Handles grid structure and day cells. **Critically: uses a render prop** so the same component works for both read-only (MiniCalendar, Today page) and drag-and-drop (full Calendar page).

```typescript
interface CalendarGridProps {
  year: number;
  month: number;
  renderDay: (date: Date, events: CalendarEvent[]) => ReactNode;
  view?: "month" | "week";
}
```

The **full Calendar page** passes a `renderDay` that wraps task chips in Pragmatic DnD `Draggable` components and wraps day cells in `Droppable` drop targets. `CalendarGrid` itself never imports Pragmatic DnD.

The **MiniCalendar** passes a simple `renderDay` that renders event dots only.

This separation means `CalendarGrid` has no DnD dependency and can be tested in isolation.

---

## Chat components

### `StreamingMessage`

Renders an in-progress AI message. Holds `streamingText` in local state, appends each SSE `token` event, shows a blinking cursor. Unmounted when `done` event arrives — replaced by `MessageBubble`.

### `MessageBubble`

Static component rendering a completed message string. User messages: right-aligned, clay accent. Rhizome messages: left-aligned, pine accent.

### `NotificationBell`

Nav item with badge count. Clicking opens `NotificationPanel`.

### `NotificationPanel`

Slide-in panel with three sections: In Progress (job subtask trees), Pending Approval (interaction cards), Alerts (MonitorAlerts). Populated via the SSE notification stream. See [notifications.md](notifications.md) for the full architecture.

### `JobProgressTree`

Renders a background job's step tree. Receives `job_step` stream events and updates live — steps show running/done state with check marks.

### `Toast`

Ephemeral bottom-right notification. Auto-dismisses after 4 seconds. Triggered by `job_complete` and high-severity `alert` events from the notification stream.

### `ContextSearchModal`

Full-screen search modal for pinning context objects in the Rhizome chat. Supports unified search (`GET /api/v1/search?q=X`) and typed prefix search (`plant:tomatoes` → `?q=tomatoes&types=plant`). Autosuggest fires on each keystroke. Selecting a result pins it as a context chip on the thread.

---

## Task components

### `TaskRow`

The ledger row. Used in Tasks page, Today page (top 5 strip), and the day detail panel in Calendar. Shows: type marker (circle/diamond/square), source colour (green/clay/cornflower left border), title, project tag, estimated time, deadline.

Hover reveals quick-action icons: defer (date picker inline), skip (reason input inline). Clicking the row body (not checkbox or title) opens the `DetailPanel`.

### `TaskGroup`

Container for a group of `TaskRow` components under a section header (e.g. "Before work", "Weather adjusted"). Header shows section name, urgency colour dot, open task count.

---

## Garden object creation — form components

### `WizardShell`

Shared wrapper for all multi-step creation wizards (plant, project, task full-mode). Provides: step indicator (filled/hollow dots), Back/Next buttons, skip mechanism, progress persistence.

```typescript
interface WizardShellProps {
  steps: { label: string; component: ReactNode; required?: boolean }[];
  onComplete: () => void;
  onCancel: () => void;
}
```

### `StaticForm`

Shared wrapper for single-page creation forms (beds, containers). Provides: consistent header, cancel/submit buttons, validation state. Used at `/app/beds/new` and `/app/containers/new`.

---

## Directory layout

```
src/
├── styles/
│   ├── tokens.css              # All CSS custom properties — source of truth
│   ├── global.css              # Reset, body, scrollbar, shared keyframes
│   └── utilities.css           # .dg .gg .chip .hr .cd .nb
│
├── components/
│   ├── primitives/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Textarea/
│   │   ├── Chip/
│   │   ├── FieldLabel/
│   │   └── Modal/
│   │
│   ├── layout/
│   │   ├── VPNav/              # sidebar nav + garden card + quick actions
│   │   ├── AppShell/           # VPNav + content wrapper + right panel slot
│   │   └── Breadcrumb/
│   │
│   ├── shared/                 # Composed components used across multiple pages
│   │   ├── LedgerTable/
│   │   ├── DetailPanel/
│   │   ├── ObjectDetailHeader/
│   │   ├── CareStateStrip/
│   │   ├── ObjectLifecycleTimeline/
│   │   ├── ObjectActivityFeed/
│   │   ├── LinkedProjectChips/
│   │   ├── LinkedTasksList/
│   │   ├── MediaGallery/
│   │   ├── MiniCalendar/
│   │   ├── VelocityStrip/
│   │   └── ProposalCard/
│   │
│   ├── calendar/
│   │   └── CalendarGrid/       # render-prop calendar grid, no DnD dependency
│   │
│   ├── chat/
│   │   ├── StreamingMessage/
│   │   ├── MessageBubble/
│   │   ├── NotificationBell/
│   │   ├── NotificationPanel/
│   │   ├── JobProgressTree/
│   │   ├── Toast/
│   │   └── ContextSearchModal/
│   │
│   ├── tasks/
│   │   ├── TaskRow/
│   │   └── TaskGroup/
│   │
│   └── forms/
│       ├── WizardShell/        # multi-step wizard wrapper
│       └── StaticForm/         # single-page form wrapper
│
├── pages/                      # Route components — own data fetching
│   ├── auth/
│   │   ├── LoginPage/
│   │   └── RegisterPage/
│   ├── TodayPage/
│   ├── TasksPage/
│   ├── TaskDetailPage/
│   ├── TaskCreatePage/         # /app/tasks/new — wizard
│   ├── TaskSeriesPage/         # /app/tasks/series/:id
│   ├── CalendarPage/
│   ├── GardenPage/             # hub — tab previews with "See all →" links
│   ├── BedListPage/            # /app/beds — full list
│   ├── BedDetailPage/          # /app/beds/:id
│   ├── BedCreatePage/          # /app/beds/new — static form
│   ├── ContainerListPage/      # /app/containers — full list
│   ├── ContainerDetailPage/    # /app/containers/:id
│   ├── ContainerCreatePage/    # /app/containers/new — static form
│   ├── PlantsPage/
│   ├── PlantDetailPage/
│   ├── PlantCreatePage/        # /app/plants/new — 4-step wizard
│   ├── ProjectsPage/
│   ├── ProjectDetailPage/
│   ├── ProjectCreatePage/      # /app/projects/new — wizard
│   ├── ProposalDetailPage/
│   ├── RhizomePage/
│   ├── IncidentsPage/
│   ├── IncidentDetailPage/
│   ├── ActivityPage/
│   └── SettingsPage/
│
├── routes/
│   ├── router.tsx              # createBrowserRouter definitions
│   └── ProtectedRoute.tsx      # auth guard
│
├── App.tsx                     # Providers: Theme, Auth, QueryClient, Router
└── main.tsx
```
