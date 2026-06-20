# Phase 3: Primitives + App Shell

**Branch:** `cedar`  
**Status:** Complete  
**Last updated:** 2026-06-20

---

## Summary

Phase 3 builds the full app shell: 10 generic primitives, the navigation sidebar with collapse behavior, the router with all routes stubbed, and the two sidebar widget cards (Quick Actions, Garden Profile). The shell went through several rounds of visual refinement against the actual mockups (`docs/design/mockups/web-mac/`) before landing on its current form, plus a component-naming audit that renamed `VPNav` → `AppNav` and dropped a stray `vp_` localStorage prefix.

---

## What was built

### Primitives (`src/components/primitives/`)

| Component | Notes |
|---|---|
| `Button` | `primary`/`ghost`/`danger` variants, `sm`/`md` sizes |
| `Input`, `Select`, `Textarea` | Token-styled form controls, chartreuse focus ring |
| `Chip` | Pill tag, optional `×` remove |
| `FieldLabel` | Uppercase Montserrat label |
| `Modal` | Portal-rendered, focus-trapped, closes on Escape or backdrop click |
| `InlinePopover` | Click-outside + Escape to close |
| `StatusBadge` | 6 color variants (neutral/green/amber/red/blue/purple) |
| `ProgressBar` | Horizontal fill bar |

### Router (`src/routes/`, `src/pages/`)

`router.tsx` — `createBrowserRouter` with every route from [routes.md](../architecture/routes.md). 27 page stubs (`<div className="pi">PageName</div>`). `ProtectedRoute` is a passthrough until Phase 4 wires real auth.

### App shell (`src/components/shell/`)

- **`AppShell`** — composes `AppNav` + content wrapper + `NotificationDrawer` portal.
- **`AppNav`** (renamed from `VPNav`, see Decisions) — fixed sidebar, 210px expanded / 52px collapsed, collapse state persisted to `localStorage('nav_collapsed')`.
  - 7 nav items across 3 sections (Orientation: Rhizome/Today; Work: Tasks/Calendar/Projects; Operational: Incidents/Activity), with hardcoded badge counts (Rhizome=2, Tasks=12, Projects=5, Incidents=2).
  - Active item: `box-shadow: inset` accent border + `--nav-accent` text (switched from `border-left` after it was found to throw off icon centering in collapsed mode — `box-shadow` doesn't consume layout width).
  - Pending-badge "lit icon" state: when collapsed, items with a pending badge stay at `--text-primary` brightness instead of dimming to `--text-secondary`, since the badge number itself is hidden — satisfies the Phase 3 spec's "pending-state color dim" smoke-test line.
  - Brand row: collapsed shows a bold chartreuse "V" letter (Shantell Sans) as the expand toggle; expanded shows the "Verdant Pages" wordmark + a chevron collapse button.
  - **`QuickActionsPanel`** — card-styled (matches `docs/design/mockups/web-mac/tasks-overview.html`'s `.sidebar-actions`), 3 buttons colored to match the mockup exactly: Ask Rhizome (tertiary/clay-tinted), New Task (secondary/solid clay), Run Triage (primary/solid chartreuse). Collapsed mode uses a dedicated `QuickActionItem` that never shows active-route highlighting (these are action triggers, not location indicators).
  - **`GardenProfileCard`** — card-styled (matches the mockup's `.garden-card`), flex-wrap "puzzle piece" layout: each button sizes to its own label (so text never clips), with blank decorative filler tiles filling the gaps — `[Overview][filler]` / `[Plants][Beds]` / `[filler][Containers]`. Overview/Containers use a chartreuse treatment, Plants/Beds use a pine treatment with `color-mix(in srgb, var(--pine) 45%, var(--pale-herb) 55%)` for readable mid-tone contrast. Collapsed mode shows all 4 destinations as icon-only rows (not just one).
  - **`NavFooter`** — Settings link, a real sliding sun/moon `role="switch"` theme toggle (vertical orientation when collapsed), and a standalone notification bell button.
  - Collapsed-mode dividers between Orientation/Work and Work/Operational sections (matching the existing dividers before Quick Actions and Garden Profile).
- **`NotificationDrawer`** — portal-rendered, Escape + backdrop-click close. Renders empty; wired in Phase 7.
- **`Toast`** — portal container, accepts a `toasts` array + `onDismiss`. Renders nothing by default; wired in Phase 7.
- **`Breadcrumb`** — `.bc`-style location bar, clickable vs. plain-text crumbs.

---

## Tests written

**Unit (30 total across 4 files):**
- `App.test.tsx` — main nav renders, all 7 nav items present, dark theme default, collapse/expand toggle, pending-badge `data-has-badge` marking
- `ThemeProvider.test.tsx` — 5 tests (carried from Phase 2)
- `Toast.test.tsx` — empty state, single/multiple toasts, dismiss on click, `onClick` handler fires alongside dismiss
- `Breadcrumb.test.tsx` — single crumb (no separator), multiple crumbs with `/` separator, clickable vs. plain-text last crumb

**E2E (10 total, `e2e/nav.spec.ts` + `e2e/smoke.spec.ts` + `e2e/theme.spec.ts`):** default route redirect, all 7 nav items visible, click navigates + marks active, collapse toggles width, collapse state persists on reload, notification drawer open/close, theme toggle + persistence.

---

## Decisions made

**`VPNav` renamed to `AppNav`.** A component-naming audit (user request: avoid `VP*`-style abbreviations or explicit "Verdant"/"Rhizome" branding on generic infrastructure components, while keeping genuine domain names like `GardenProfileCard` and `RhizomePage`) found `VPNav` was the only offender. Renamed across the component file, function name, all imports, and the architecture docs (`components.md`, `build-phases.md`, `notifications.md`, `roadmap/overview.md`).

**`vp_theme` / `vp_nav_collapsed` localStorage keys renamed to `theme` / `nav_collapsed`.** Same audit, adjacent finding — these carried the same abbreviated prefix. Updated in `ThemeProvider.tsx`, `NavContext.tsx`, their tests, and 4 doc references.

**Active-state indicator uses `box-shadow: inset`, not `border-left`.** A real border consumes layout width asymmetrically, which was throwing off icon centering in collapsed mode (the active "Today" item visibly sat off-center). `box-shadow: inset 2px 0 0 0 var(--nav-accent)` gives the same visual accent without affecting box width.

**Badge spans need explicit `overflow: hidden; min-width: 0` to actually collapse to zero width.** Flex items default to `min-width: auto`, which floors at their content's minimum size — a badge span containing text (e.g. `"5"`) won't shrink to `width: 0` just because the CSS says so, unless `overflow` is also set to something other than `visible`. Same root cause nearly broke the Garden Profile Card icons later (see next point).

**Icons need a dedicated `flex-shrink: 0` wrapper.** `cardGridBtn`'s icons briefly disappeared for the two-column "span" buttons (Overview, Containers) while working fine for the single-column ones (Plants, Beds) — confirmed not an import/icon bug since the same icon components rendered fine elsewhere in the same file. Root cause: bare `<Icon />` elements with no shrink protection get squeezed to nothing when a `white-space: nowrap` text sibling can't shrink and the flex container is tight. Fixed by wrapping every icon in a `.cardIcon` span with `flex-shrink: 0`, matching the pattern `NavItem`'s `.itemIcon` already used successfully.

**Garden Profile Card moved from CSS Grid to flex-wrap.** The original design used a 3-column grid with explicit `grid-column: span 2` for the wider buttons — this caused real text clipping (`CONTAIN...`, `B...`) because grid items stretch to fill their track width regardless of content, and the proportional column math didn't leave enough room for the longer labels. Flex-wrap lets each button size to its own content (no clipping possible), with blank filler tiles absorbing the leftover space for the "puzzle piece" look instead.

**Quick Actions buttons never show active-route highlighting.** Originally `QuickActionsPanel`'s collapsed mode reused `NavItem`, which applies active styling based on the current route — so "Ask Rhizome" lit up identically to the real Rhizome nav item whenever the user was on `/app/rhizome`. These are action shortcuts, not location indicators, so a separate `QuickActionItem` component was introduced that never reflects `isActive`.

---

## Smoke test results (against the Phase 3 spec)

- ✅ All 7 nav items render with correct icons and labels
- ✅ Clicking each nav item changes the active state and renders the stub
- ✅ Collapse to 52px shows only icons; pending-state color dim works
- ✅ Nav badge slots render with hardcoded numbers
- ✅ `GardenProfileCard` and `QuickActionsPanel` visible and correctly positioned

```
npm run test:run   → 20 passed
npm run test:e2e   → 10 passed
npx tsc -b         → 0 errors
```

---

## What Phase 4 needs from this

Phase 4 (auth + API client) wires real auth into `ProtectedRoute` and replaces the hardcoded nav badge counts with live data once API modules exist. The shell itself — layout, collapse behavior, routing — needs no changes; Phase 4 only swaps stubbed data sources for real ones.
