# Component Architecture

**Last verified:** 2026-07-10

This document describes components that exist in the repository. The accepted organization for complex workflows lives in [frontend structure](frontend-structure.md), proposed shared UI patterns live in [design patterns](../design/patterns.md), and page-specific composition belongs in the [page specs](../pages/).

## Conventions

- Component-specific styles use CSS modules.
- Shared colors, typography, surfaces, and state colors come from `src/styles/tokens.css`.
- Components do not fetch data directly. Pages and hooks call typed functions from `src/lib/api/` through TanStack Query.
- Prefer a colocated test for reusable interaction behavior.
- Promote page-local UI into a shared component only after its contract is clear or a second use proves the abstraction.

Typical folder:

```text
ComponentName/
  ComponentName.tsx
  ComponentName.module.css
  ComponentName.test.tsx
```

## Current Inventory

### Primitives

`src/components/primitives/` contains domain-neutral controls:

| Component | Purpose |
|---|---|
| `Button` | Shared command button variants and sizes |
| `Chip` | Compact labels and removable selections |
| `FieldLabel` | Uppercase metadata and field labels |
| `InlinePopover` | Anchored transient content |
| `Input` | Styled text and native input behavior |
| `MarkdownMessage` | Safe Markdown rendering for chat content |
| `Modal` | Focus-managed modal content |
| `ProgressBar` | Compact completion display |
| `Select` | Themed select control |
| `StatusBadge` | Status and severity labels |
| `Textarea` | Styled multiline input |
| `ThemeToggle` | Light/dark theme control |

These primitives are the default building blocks. Check their props and existing tests before introducing a parallel control.

### Shell

`src/components/shell/` contains application-wide layout and feedback:

| Component | Responsibility |
|---|---|
| `AppShell` | Authenticated route frame and page outlet |
| `AppNav` | Expanded/collapsed navigation and quick access |
| `Breadcrumb` | Route context where a page needs it |
| `NotificationDrawer` | Global notification and progress surface |
| `OfflineBanner` | Connectivity status |
| `Toast` | Ephemeral global feedback |

The global notification drawer is not the same as a feature workspace panel. A page such as Rhizome may use temporary thread or review panels when they preserve the central workflow and collapse cleanly at narrower widths.

### Activity

`src/components/activity/` contains the implemented activity-history controls and feed presentation. These components support filtering, validation, empty/error states, and incremental loading for `/app/activity`.

### Rhizome

`src/components/rhizome/ContextAutocomplete/` is the shared context-result surface used by thread focus, message context, pinned context, and composer token completion. It owns shared result rows, type colors, loading/empty/error states, dismissal, and single- versus multi-select behavior.

`src/features/rhizome/` now owns the workbench header, thread navigator, new-thread dashboard, session strip, conversation timeline, composer, context controls, review panel, pure helpers, and chat-turn lifecycle. `src/pages/RhizomePage.tsx` remains the route composition and query-coordination root.

The remaining stabilization work is narrower: move session-context and context-search query coordination into focused hooks, then divide the shared feature stylesheet along the established component ownership boundaries. Do not replace the prior page concentration with a single all-purpose hook or generic workbench component.

See [current status](../status/current.md) for the active stabilization priority.

## Component Boundaries

Use these tests when deciding where code belongs:

| Question | Location |
|---|---|
| Is it domain-neutral and reusable? | `components/primitives/` |
| Is it global navigation, status, or application framing? | `components/shell/` |
| Does it encode one domain workflow and have multiple consumers? | `components/<domain>/` |
| Does it combine domain components, hooks, workflow state, and helpers? | `features/<domain>/` |
| Does it coordinate route data and the whole screen? | `pages/` |
| Is it only a visual composition proposed for a future page? | Document it in `docs/design/patterns.md` first |

## State Ownership

- **Server state:** TanStack Query.
- **Route identity and filters:** URL params/search params when the state should be linkable.
- **Authentication:** `src/lib/auth/context.tsx`.
- **Ephemeral UI state:** local component state.
- **Theme:** theme provider plus local storage.

Do not add a global state library unless a demonstrated cross-route state problem cannot be represented by these owners.

## Accessibility Baseline

Reusable controls must support:

- keyboard operation and visible focus;
- semantic labels or accessible names for icon-only buttons;
- Escape and outside-click dismissal where appropriate;
- focus management for modals and temporary panels;
- status feedback that does not rely on color alone;
- reduced-motion behavior for nonessential animation.

## Related References

- [Design tokens](design-tokens.md)
- [Visual identity](../design/visual-identity.md)
- [Design patterns](../design/patterns.md)
- [Frontend structure](frontend-structure.md)
- [Codebase tour](codebase-tour.md)
- [Testing](../development/testing.md)
