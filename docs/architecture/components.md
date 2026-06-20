# Component Library

**Last updated:** 2026-06-20

## Styling approach

- **CSS modules** for component-specific styles — each component has a `.module.css`, locally scoped
- **`tokens.css`** — single source of truth for all design tokens (see [design-tokens.md](design-tokens.md))
- **`utilities.css`** — shared classes from the prototype: `.dg` (dot grid), `.gg` (line grid), `.chip`, `.hr`, `.cd`, `.nb`
- No CSS-in-JS, no Tailwind — always `var(--token-name)`, never hardcoded colours
- **No drawers** anywhere except the notification drawer (the single exception — see §2)

## Key libraries

| Library | Used for |
|---|---|
| **TanStack Table v8** | All ledger tables (tasks, beds, containers, plants, expenses, shopping list) |
| **Pragmatic Drag and Drop** | Calendar rescheduling, Gantt bars and dependencies |
| **TanStack Query v5** | All server state — no component fetches directly |

## Component tiers

| Tier | Domain knowledge | Examples |
|---|---|---|
| **Primitives** | None | Button, Input, Chip |
| **Composed** | Domain types | TaskRow, CareStateStrip |
| **Pages** | Full page + data fetching | TodayPage, TasksPage |
| **Layout** | Routing, not domain data | AppNav, AppShell |

---

## 1. Primitives

No domain knowledge. Could be dropped into any app.

| Component | Description |
|---|---|
| `Button` | `variant`: `primary`, `ghost`, `ghost-clay`, `danger` — see table below. Size: `sm` / `md`. |
| `Input` | Styled `<input>` with chartreuse focus ring. |
| `Select` | Styled `<select>`. |
| `Textarea` | Auto-resize with chartreuse caret. |
| `Chip` | Pill tag. `color` maps to tokens. `removable` shows `×`. |
| `FieldLabel` | Uppercase Montserrat, 9–10px, letter-spaced. Equivalent to `LBL`/`SMLL` in prototype. |
| `Modal` | Focus-trapped overlay. Closes on Escape + backdrop click. |
| `InlinePopover` | Small contextual popup anchored to a trigger element. Used for: care log (datetime + note), task defer (date picker), task skip (reason input). |
| `StatusBadge` | Small coloured pill for status/urgency/severity values. |
| `ProgressBar` | Horizontal fill bar for task completion %, budget burn. |

### Button variants — quick reference

| Variant | Look | Use for |
|---|---|---|
| `primary` | Solid chartreuse fill, dark text | The one primary action on a page/card — submit, confirm, "Sign Up". Use at most once per visual group. |
| `ghost` | Transparent, neutral border/text | Secondary actions that don't need color emphasis — "Cancel", nav-adjacent links. |
| `ghost-clay` | Transparent, clay border/text | A secondary action that should read as *less committal than primary but still warm* — e.g. "Login" next to a "Sign Up" primary button, where both are valid paths but one is the expected one. |
| `danger` | Solid clay fill, white text | Destructive actions — delete, remove, revoke. |

---

## 2. App Shell & Navigation

### `AppShell`

Root layout. Composes `AppNav` + content wrapper + `NotificationDrawer` portal.

```
AppShell
  ├── AppNav (left, fixed)
  ├── .cw content wrapper (flex column, fills remaining width)
  └── NotificationDrawer portal (right edge, conditionally open)
```

---

### `AppNav`

Fixed left sidebar. 210px expanded, 52px collapsed.

```
AppNav
  ├── Brand row (logo + collapse toggle)
  ├── NavSection × 3
  │     └── NavItem × N (icon + label + badge count)
  ├── QuickActionsPanel (sidebar widget)
  ├── GardenProfileCard (sidebar widget)
  └── NavFooter
        ├── UserAvatar + email → /app/settings
        ├── ThemeToggle (persists to localStorage)
        └── NotificationBell → opens NotificationDrawer
```

**NavItem states:**

| State | Visual |
|---|---|
| Default | Icon + label at `--text-s` (70% opacity) |
| Has pending items, collapsed | Icon at `--text-p` (94% — lit, no badge) |
| Has pending items, expanded | Chartreuse badge count pill beside label |
| Active | Chartreuse left border + `--nav-accent` text + `--nav-active-bg` tint |

**NavSection groups:**

| Group | Items | Badge source |
|---|---|---|
| Orientation | Rhizome, Today | Rhizome: pending interaction count |
| Work | Tasks, Calendar, Projects | Tasks: open count; Projects: active count |
| Operational | Incidents, Activity | Incidents: open count |

---

### `QuickActionsPanel` (sidebar widget)

Three action buttons inside a card widget. Sits below the nav items.

| Button | Collapsed icon | Action |
|---|---|---|
| Ask Rhizome | Speech bubble | Navigate to `/app/rhizome` |
| + New Task | Plus | Navigate to `/app/tasks/new` |
| ▶ Run Triage | Play triangle | `POST /api/v1/triage/run` |

Collapsed: three stacked icon buttons (labels hidden).

---

### `GardenProfileCard` (sidebar widget)

Always-visible portal to all garden objects. Sits below QuickActionsPanel.

**Expanded:** zone badge, object count, mini plot grid, chip links → Garden, Plants, Beds, Containers.

**Collapsed:** single garden icon button → `/app/garden`.

---

### `NotificationDrawer`

The **one and only drawer** in the app. Slides in from the right when the NotificationBell is clicked.

```
NotificationDrawer
  └── NotificationPanel
        ├── In Progress section
        │     └── JobProgressTree × N
        ├── Pending Approval section
        │     └── InteractionCard × N (compact)
        └── Alerts section
              └── AlertRow × N
```

---

### `JobProgressTree`

Renders one background job's subtask tree. Steps arrive via SSE `job_step` events and update live.

```
JobProgressTree
  ├── Job title + status indicator
  └── StepRow × N  (step label + ✅/🔄 icon)
```

---

### `Toast`

Ephemeral bottom-right notification. Auto-dismisses after 4s. Triggered by `job_complete` and high-severity `alert` SSE events. Clicking navigates to the relevant page.

---

### `Breadcrumb`

`.bc` bar — `--font-label`, 9px, uppercase, letter-spaced. Shows current location path.

---

## 3. Shared data display

### `LedgerTable`

Wrapper around TanStack Table v8. Used for: task ledger, beds list, containers list, plants ledger view, expenses, shopping list.

```typescript
interface LedgerTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  enableSorting?: boolean;
  enableFiltering?: boolean;
}
```

Applies token styling: chartreuse-tinted sticky header, `--line-on-paper` row borders, `.hr` hover state.

---

### `FilterRail`

Left filter panel pattern. Used on: Tasks (all views), Plants, Beds, Containers, Incidents, Activity. ~200px wide, takes a `filters` config array and calls `onChange` on each update.

```typescript
interface FilterRailProps {
  filters: FilterConfig[];   // { label, type: "select"|"chips"|"daterange"|"toggle", options?, value, onChange }
  onReset: () => void;
}
```

---

### `TabNav`

Within-page tab navigation. Used on: Garden hub (Overview/Beds/Containers/Plants/Activity), Project detail (Gantt/Kanban/List/Resources). Renders tab buttons with active underline in `--nav-accent`.

---

### `ObjectActivityFeed`

Cursor-paginated activity feed. Used on the `/app/activity` full page AND embedded on every object detail page.

```typescript
interface ObjectActivityFeedProps {
  endpoint: string;          // '/api/v1/activity' or '/api/v1/garden/plants/:id/activity'
  showFilters?: boolean;     // true on full page, false on detail sections
  limit?: number;
}
```

---

## 4. Garden map

### `GardenMap`

Renders the spatial garden plan from `GET /api/v1/garden/layout`. Two modes:

**Minimap** (default in garden hub hero): compact, fixed height, clickable to expand.

**ExpandedMapOverlay** (full screen): pan/zoom via pointer events, clickable object labels navigate to the relevant detail page, hovering an object shows name + status + image thumbnails. Close button returns to hub.

**Empty state** (no layout yet): placeholder with prompt — "Send Rhizome a sketch or photos to generate your garden plan."

Bed/area fills are colour-coded by status: active (pine tint), empty (neutral), weather-flagged (cornflower tint), selected (chartreuse outline).

---

## 5. Shared garden object components

Used across plant/bed/container detail pages.

### `ObjectDetailHeader`

Shared header for Plant, Bed, and Container detail pages.

```typescript
interface ObjectDetailHeaderProps {
  name: string;
  typeBadge: "Plant" | "Bed" | "Container";
  locationBreadcrumb?: string;
  statusBadge?: string;
  onEdit: () => void;
  onDelete: () => void;
  deleteLabel?: string;           // "Remove" for plants (soft delete), "Delete" for beds/containers
}
```

---

### `CareStateStrip`

Six care tiles: watered, fertilized, amended, inspected, treated, pruned. Colour-coded by recency (green/amber/red). Each tile has a "Log" button opening an `InlinePopover` — datetime picker + optional note — that fires `POST /api/v1/garden/{type}/{id}/care`.

---

### `ObjectLifecycleTimeline`

Horizontal milestone timeline. Shared across plant detail (explicit date fields) and bed/container detail (activity-derived milestones from care events).

```typescript
interface Milestone { label: string; date: Date | null; completed: boolean; }
interface ObjectLifecycleTimelineProps { milestones: Milestone[]; }
```

---

### `LinkedProjectChips`

Chips for associated projects. Clicking navigates to `/app/projects/:id`.

---

### `LinkedTasksList`

Compact list of open tasks where this object is a `linked_subject`. Quick-complete checkbox calls `POST /api/v1/tasks/{id}/complete` with optimistic update.

---

### `MediaGallery`

Image grid with thumbnails + lightbox. `+` button opens file picker for upload.

```
MediaGallery
  ├── MediaThumbnail × N
  └── LightboxOverlay (full-size + caption, prev/next navigation)
```

---

### `CurrentPlantsList`

For bed and container detail pages: compact list of plants currently growing there. Each row: plant name, status badge, sow date. Links to `/app/plants/:id`.

---

### `ConstraintsEditor`

Garden hub constraints section. Renders hard constraints and soft preferences as editable chips. Inline text editing on click; `+` adds a new entry. Saves via `PATCH /api/v1/garden/profile`.

---

## 6. Calendar components

### `CalendarGrid`

Core calendar renderer. Grid structure only — **no DnD dependency itself**. Uses a render prop so DnD can be layered on by the caller.

```typescript
interface CalendarGridProps {
  year: number;
  month: number;
  view: "month" | "week";
  renderDay: (date: Date, events: CalendarEvent[]) => ReactNode;
}
```

The full Calendar page wraps task chips in Pragmatic DnD `Draggable` and day cells in `Droppable`. MiniCalendar passes a simple renderer that shows event dots only.

---

### `MiniCalendar`

Wraps `CalendarGrid` with compact sizing. Used in: Today page right column, Calendar margin panel.

---

### `DayDetailPanel`

Slides in alongside the calendar when a day cell is clicked (not a navigation). Shows: full task list for the day (with complete checkboxes), annotation with inline edit, weather detail, "List view →" link to Tasks page.

---

### `CalendarMarginPanel`

Right sidebar on the full Calendar page. Paper-planner aesthetic.

```
CalendarMarginPanel
  ├── Month number (Shantell Sans, large)
  ├── Month name (Caveat)
  ├── AnnotationEditor (selected day note, inline edit)
  ├── MonthChecklist (persistent cross-month notes)
  └── MiniCalendar × 2 (previous and next months)
```

---

### `WeatherIcon`

Small SVG weather icon from meteocons. Displayed in calendar day cell top-right. Takes `weatherCode` from the forecast.

---

## 7. Task components

### `TaskRow`

The core task ledger row. Used in: Tasks page (all views), Today page (top 5 strip), DayDetailPanel.

- **Type marker:** circle (maintenance), diamond (opportunistic), square (milestone/emergency)
- **Source colour:** green left border (Rhizome), clay (user), cornflower (weather)
- **Hover reveals:** defer (`InlinePopover` date picker), skip (`InlinePopover` reason input), edit button
- **Clicking the row body:** opens `DetailPanel` with full task detail

---

### `TaskGroup`

Section header + grouped `TaskRow` list. Header: section name, urgency colour dot, open task count.

---

### `DetailPanel`

Dark-background right slide-in. Used for task detail in Tasks page and day detail in Calendar. **Width:** 270–340px.

```
DetailPanel
  ├── Title + kicker label (chartreuse top border accent)
  ├── Content slot (varies by caller)
  └── "Open full page →" link
```

---

### `VelocityStrip`

Four summary cards at the top of the Tasks ledger (Today view only). Populated from `GET /api/v1/activity/stats`.

| Card | Data |
|---|---|
| Completed this week | `totals.task_completed` from stats |
| Current streak | Consecutive days with ≥1 completion |
| Deferred rate | Deferrals vs. completions ratio |
| Triage alignment | % of today's completed tasks Rhizome recommended |

---

## 8. Garden hub page components

### `GardenHeroSection`

Top of the Garden hub. Left: `GardenMap` (minimap). Right: `ProfilePanel`.

---

### `ProfilePanel`

Compact data grid: zone, soil, indoor trays, last frost, first frost, mapped objects. "Edit profile →" opens profile edit form.

---

### `TabPreviewSection`

Generic preview container used for each hub tab (Beds, Containers, Plants, Activity). Shows up to 8 rows/cards with a "See all →" link to the full list page. No filters — preview only.

---

## 9. Today page components

These sections are unique to the Today page.

### `TodayConditionsPanel`

Left column: weather data from `GET /api/v1/weather/latest`. Displays as `label / value` rows: Temp, Wind, Humidity, Rain tonight, UV Index, Frost risk.

### `RhizomeBriefingPanel`

Centre column: one-paragraph briefing from `GET /api/v1/triage/latest`, followed by inline `InteractionCard` components for any pending approvals from `GET /api/v1/interactions/pending`. "Open today's journal →" link to `/app/rhizome`.

### `TodayOverviewPanel`

Right column: active projects list (status dot, name, task count, navigate on click), `MiniCalendar` showing current month.

### `TodayTasksStrip`

Below the fold: top 5 tasks from `GET /api/v1/tasks/daily?limit=5`. Each has a quick-complete checkbox. "All tasks →" navigates to `/app/tasks`.

### `ThisWeekStrip`

7-day row (current week). Each day shows its date number and event dots. Clicking a day navigates to the Calendar page.

---

## 10. Projects

### `ProjectCard`

Used in the Projects list grouped by status. Shows: name, status badge, goal text (truncated), `ProgressBar`, timeline health indicator (on track/at risk/overdue), budget burn gauge, target date.

---

### `PhaseIndicatorStrip`

Horizontal lifecycle indicator at the top of Project detail.

```
[Brief] → [Proposal] → [Revision] → [Execution] → [Complete]
```

Active phase highlighted in chartreuse. Completed phases filled.

---

### `BriefPanel`

Editable form on the project detail planning mode. Fields: goal, desired outcome, budget cap, target start, target completion, effort preference, propagation preference. Saves via `PATCH /api/v1/projects/{id}/brief`.

---

### `ResourceAllocationPanel`

Bed and container picker for project planning. Queries `GET /api/v1/garden/beds?available=true` and `GET /api/v1/garden/containers?available=true`. Shows: available (can allocate), already in this project (can deallocate), in another active project (unavailable/greyed).

---

### `GanttChart`

Horizontal task timeline. Uses **Pragmatic Drag and Drop**.

```
GanttChart
  ├── GanttTimelineHeader (date columns)
  ├── GanttRow × N
  │     ├── GanttTaskBar (draggable, resize right edge for window)
  │     └── GanttDependencyLine (arrow from blocking → blocked task)
  └── GanttMilestoneDiamond (tasks with type=milestone)
```

**Drag interactions:**
- Drag bar → move `scheduled_date` (fires bulk update on drop)
- Drag right edge → extend/shorten window
- Drag from bar right edge to another bar left edge → create dependency
- Click dependency arrow + Delete → remove dependency

Weather-impacted days tinted cornflower.

---

### `KanbanBoard`

Three-column (Pending / In Progress / Done) task layout. Cards drag between columns calling task lifecycle actions.

```
KanbanBoard
  ├── KanbanColumn × 3
  │     └── KanbanCard × N
  └── (Pragmatic DnD for between-column drag)
```

---

### `ProjectProposalCard`

Full proposal review card on the Project detail and `/app/projects/:id/proposals/:proposalId` page. **Distinct from `InteractionCard`** (which is for chat interactions).

Shows: summary, cost estimate (line items + total), timeline estimate (milestones), effort estimate (hours/week breakdown), feasibility (violations + warnings), assumptions, tradeoffs, risks. Actions: Accept / Request revision / Reject.

---

### `BudgetTracker`

Project Resources tab — budget section. Composes:
- `BudgetGauge` — visual gauge: proposal estimate vs. total estimated vs. total actual spend
- `LedgerTable` — list of `ProjectExpense` records, inline status update

---

### `ShoppingListPanel`

Project Resources tab — shopping section. `LedgerTable` of `ShoppingItem` records. "Mark purchased" calls `POST /api/v1/shopping/{id}/purchase`.

---

### `PlantProgressPanel`

Collapsible panel on Project detail (execution mode). One row per plant in the project showing a compact propagation timeline:

```
Cherry Tomatoes  Sow ●────── Red Cup ●────── Transplant ●────── Harvest ○
```

Populated from `GET /api/v1/garden/plants?project_id=X`.

---

## 11. Agent / Chat

### `SessionStrip`

Narrow strip below topbar on the Rhizome page. Two panels side by side:
- **Startup intake** — Rhizome's session-start questions (time available, energy, focus). Shown once answered.
- **System status** — weather snapshot timestamp, pending review count.

---

### `ContextStrip`

Visible when ≥1 object is pinned. Row of entity chips between session strip and chat thread. Each chip: type icon, entity name, `×` remove. `+ Add context` opens `ContextSearchModal`.

---

### `ContextSearchModal`

Full-screen search overlay. Unified search across all entity types. Typed prefix syntax: `plant:tomatoes` → searches plants only, `task:water` → searches tasks only. Autosuggest fires on each keystroke via `GET /api/v1/search`.

---

### `ChatThread`

Scrollable message area with dot-grid background. Contains day-separator labels and message components.

```
ChatThread
  ├── DayLabel (date separator)
  ├── MessageBubble | StreamingMessage (alternating)
  └── InlineInteractionSummary (compact card inside a Rhizome bubble)
```

---

### `StreamingMessage`

In-progress AI message. Holds `streamingText` in local state, appends `token` SSE events, shows blinking cursor. Replaced by `MessageBubble` on `done`.

---

### `MessageBubble`

Completed message. User: right-aligned, clay accent. Rhizome: left-aligned, pine accent.

---

### `Composer`

Textarea + Send button at the bottom of the Rhizome page. Status line: zone + model indicator. Enter sends (Shift+Enter newline).

---

### `InteractionPanel`

Right side of Rhizome page. Slides open when stream delivers an `interaction` event. The panel contains:

```
InteractionPanel
  ├── PendingInteractionList (collapsible — all pending interactions queued)
  │     └── PendingInteractionRow × N (title, type, "Now" badge on active)
  └── InteractionCard (full — the active review card)
```

---

### `InteractionCard`

Chat interaction approval card. Different from `ProjectProposalCard` (which is for project planning proposals). Used for: weather change reviews, treatment plan drafts requiring approval, proposal summaries in chat.

```
InteractionCard
  ├── Type label + title
  ├── Summary text
  ├── Metrics grid (type-specific: rain %, window, affected count)
  ├── Proposed changes list
  ├── Affected subjects chips
  ├── Decision notes input (optional note to Rhizome)
  └── Actions: Request Revision | Reject | Approve (primary)
```

Compact variant used on the Today page for pending approvals in `RhizomeBriefingPanel`.

---

## 12. Incidents

### `IncidentRow`

Ledger row in incidents list: type badge, summary, severity indicator, affected subject chips, status badge, date, treatment plan status.

---

### `IncidentDetailHeader`

Type badge (Pest/Disease/Weed), severity (clay/buttercup/pine/muted), summary, status, date. Inline editing for summary/severity/notes. Resolve and Delete actions.

---

### `AffectedSubjectsPicker`

Multi-select for plants, beds, containers affected by an incident. Uses `GET /api/v1/search` for subject lookup. Renders as chips with remove button.

---

### `TreatmentPlanSection`

The dual-path section on incident detail.

```
TreatmentPlanSection
  ├── [no plan] → two buttons: "Draft with Rhizome" | "Write my own"
  └── [plan exists] →
        └── TreatmentPlanCard (view/edit/approve)
              ├── Source badge (Rhizome draft | User plan)
              ├── Approach summary
              ├── TreatmentStepsList (step rows: title, task type, minutes, days from approval)
              ├── Follow-up strategy
              └── Actions: Edit | Approve | Delete draft
```

---

### `TreatmentStepsEditor`

Add/edit/remove step interface for manual treatment plan creation. Each step: title, task type selector, estimated minutes, days from approval.

---

## 13. Account settings sections

These compose the single `SettingsPage`.

| Section | Component | Fields |
|---|---|---|
| Profile | `ProfileSection` | Email (read-only), change password form |
| AI Provider | `AIProviderSection` | Provider segmented control (Gemini/OpenAI/Anthropic), model name input |
| API Keys | `APIKeysSection` | Per-provider row: configured badge, set/update/remove button |
| Appearance | `AppearanceSection` | Light/Dark toggle |

---

## 14. Creation forms

### `WizardShell`

Multi-step wizard wrapper. Used for plant, project, and full-mode task creation.

```typescript
interface WizardShellProps {
  steps: { label: string; component: ReactNode; required?: boolean }[];
  onComplete: () => void;
  onCancel: () => void;
}
```

Step indicator (filled/hollow dots), Back/Next buttons, skip mechanism for optional steps.

---

### `StaticForm`

Single-page form wrapper. Used for bed (`/app/beds/new`) and container (`/app/containers/new`) creation.

Provides: consistent header with title, cancel/submit buttons, validation state display.

---

## 15. Directory layout

```
src/
├── styles/
│   ├── tokens.css              # Design tokens — source of truth
│   ├── global.css              # Reset, body, scrollbar, keyframes
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
│   │   ├── Modal/
│   │   ├── InlinePopover/
│   │   ├── StatusBadge/
│   │   └── ProgressBar/
│   │
│   ├── shell/                  # App structure
│   │   ├── AppShell/
│   │   ├── AppNav/
│   │   │   ├── NavItem/
│   │   │   ├── QuickActionsPanel/
│   │   │   ├── GardenProfileCard/
│   │   │   └── NavFooter/
│   │   ├── NotificationDrawer/ # The only drawer
│   │   │   ├── NotificationPanel/
│   │   │   └── JobProgressTree/
│   │   ├── Toast/
│   │   └── Breadcrumb/
│   │
│   ├── data/                   # Shared data display
│   │   ├── LedgerTable/
│   │   ├── FilterRail/
│   │   ├── TabNav/
│   │   └── ObjectActivityFeed/
│   │
│   ├── map/
│   │   └── GardenMap/          # Minimap + ExpandedMapOverlay
│   │
│   ├── garden-objects/         # Shared across plant/bed/container detail
│   │   ├── ObjectDetailHeader/
│   │   ├── CareStateStrip/
│   │   ├── ObjectLifecycleTimeline/
│   │   ├── LinkedProjectChips/
│   │   ├── LinkedTasksList/
│   │   ├── MediaGallery/
│   │   ├── CurrentPlantsList/
│   │   └── ConstraintsEditor/
│   │
│   ├── calendar/
│   │   ├── CalendarGrid/       # Render-prop, no DnD dependency
│   │   ├── MiniCalendar/
│   │   ├── DayDetailPanel/
│   │   ├── CalendarMarginPanel/
│   │   └── WeatherIcon/
│   │
│   ├── tasks/
│   │   ├── TaskRow/
│   │   ├── TaskGroup/
│   │   ├── DetailPanel/
│   │   └── VelocityStrip/
│   │
│   ├── projects/
│   │   ├── ProjectCard/
│   │   ├── PhaseIndicatorStrip/
│   │   ├── BriefPanel/
│   │   ├── ResourceAllocationPanel/
│   │   ├── GanttChart/
│   │   │   ├── GanttTaskBar/
│   │   │   └── GanttDependencyLine/
│   │   ├── KanbanBoard/
│   │   │   └── KanbanCard/
│   │   ├── ProjectProposalCard/
│   │   ├── BudgetTracker/
│   │   ├── ShoppingListPanel/
│   │   └── PlantProgressPanel/
│   │
│   ├── today/
│   │   ├── TodayConditionsPanel/
│   │   ├── RhizomeBriefingPanel/
│   │   ├── TodayOverviewPanel/
│   │   ├── TodayTasksStrip/
│   │   └── ThisWeekStrip/
│   │
│   ├── chat/
│   │   ├── SessionStrip/
│   │   ├── ContextStrip/
│   │   ├── ContextSearchModal/
│   │   ├── ChatThread/
│   │   ├── StreamingMessage/
│   │   ├── MessageBubble/
│   │   ├── Composer/
│   │   ├── InteractionPanel/
│   │   │   └── PendingInteractionList/
│   │   └── InteractionCard/    # Chat approval cards (≠ ProjectProposalCard)
│   │
│   ├── incidents/
│   │   ├── IncidentRow/
│   │   ├── IncidentDetailHeader/
│   │   ├── AffectedSubjectsPicker/
│   │   ├── TreatmentPlanSection/
│   │   │   └── TreatmentPlanCard/
│   │   └── TreatmentStepsEditor/
│   │
│   ├── settings/
│   │   ├── ProfileSection/
│   │   ├── AIProviderSection/
│   │   ├── APIKeysSection/
│   │   └── AppearanceSection/
│   │
│   └── forms/
│       ├── WizardShell/
│       └── StaticForm/
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage/
│   │   └── RegisterPage/
│   ├── TodayPage/
│   ├── TasksPage/              # Shared across all /app/tasks/* views
│   ├── TaskDetailPage/         # /app/tasks/:id
│   ├── TaskCreatePage/         # /app/tasks/new
│   ├── TaskSeriesPage/         # /app/tasks/series/:id
│   ├── CalendarPage/
│   ├── RhizomePage/
│   ├── GardenPage/             # Hub — tab previews with "See all →" links
│   ├── BedListPage/            # /app/beds
│   ├── BedDetailPage/          # /app/beds/:id
│   ├── BedCreatePage/          # /app/beds/new
│   ├── ContainerListPage/      # /app/containers
│   ├── ContainerDetailPage/    # /app/containers/:id
│   ├── ContainerCreatePage/    # /app/containers/new
│   ├── PlantsPage/             # /app/plants
│   ├── PlantDetailPage/        # /app/plants/:id
│   ├── PlantCreatePage/        # /app/plants/new — 4-step wizard
│   ├── ProjectsPage/
│   ├── ProjectDetailPage/
│   ├── ProjectCreatePage/      # /app/projects/new — wizard
│   ├── ProposalDetailPage/     # /app/projects/:id/proposals/:proposalId
│   ├── IncidentsPage/
│   ├── IncidentDetailPage/
│   ├── ActivityPage/
│   └── SettingsPage/
│
├── routes/
│   ├── router.tsx
│   └── ProtectedRoute.tsx
│
├── App.tsx
└── main.tsx
```
