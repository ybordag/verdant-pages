# Page Or Feature Name

> Copy this file when defining a new route group or materially redesigning an existing one. Delete guidance that does not apply; do not retain placeholder claims.

| Status | Planned / Partial / Implemented |
|---|---|
| Frontend | Current route/UI readiness |
| Cambium | Current gateway/client readiness |
| Rhizome | Current domain capability readiness |
| Blockers | Active dependency or `None` |
| Last verified | YYYY-MM-DD |

## Purpose

Describe the user's goal and why this page exists. Identify the dominant workflow in one sentence.

## Routes

| Page/state | Route |
|---|---|
| Primary page | `/app/example` |
| Durable detail | `/app/example/:id` |

State that must be bookmarkable belongs in route or search parameters. Temporary panel/popover state usually does not.

## Product Boundaries

State what this page owns and what belongs to another page or backend service. Identify supporting panels or entry points without duplicating their full specifications.

## Primary Workflow

Describe the normal path from entry to successful outcome:

1. User enters the page.
2. User understands the current state.
3. User takes the primary action.
4. The UI confirms/reconciles the result.
5. User can continue or navigate to the resulting object.

## Information Architecture

Identify regions by product responsibility, not visual position alone.

| Role | Region | Responsibility |
|---|---|---|
| Primary | Main workspace | Dominant user task |
| Supporting | Filter/context/review region | Helps the primary workflow |
| Transient | Popover/autocomplete/modal | Short-lived focused interaction |

Include a compact text diagram only when it clarifies relationships.

## Data And API Requirements

| Operation | Client function / endpoint | Status |
|---|---|---|
| Initial read | `listExamples()` | Ready / pending |
| Mutation | `updateExample()` | Ready / pending |

Document structured behavior and user impact. Do not copy entire backend DTOs or Swagger into the page spec.

## State Model

Identify ownership:

- server records and request status;
- route/search state;
- form drafts;
- optimistic or streamed state;
- temporary panel/popover state.

For multi-step async workflows, document meaningful states and cancellation/retry behavior.

## Interaction Details

Describe controls, selection, keyboard behavior, confirmation, destructive actions, and navigation. Use existing primitives and patterns where possible.

## Responsive Behavior

| Width | Composition |
|---|---|
| Wide | Primary workflow plus useful supporting regions |
| Tablet | Reduced supporting context; one panel at a time where necessary |
| Phone | One primary surface; secondary context becomes focused overlay/route/expansion |

Specify truncation, wrapping, fixed dimensions, and panel behavior where long content could cause overlap.

## Accessibility

Cover applicable requirements:

- landmark and heading structure;
- control labels and keyboard operation;
- focus entry/return for panels or dialogs;
- async status announcements;
- non-color status indicators;
- reduced motion;
- error association with fields.

## Page States

Define visible behavior for:

| State | Expected presentation/action |
|---|---|
| Loading | Stable layout or useful loading state |
| Empty | Explain absence and offer the next valid action |
| Filtered empty | Explain filters and expose reset |
| Error | Actionable copy and safe retry |
| Offline | Preserve drafts and explain save limitations |
| Mutation pending | Prevent duplicate action and show progress |
| Conflict/stale | Refresh/reconcile without silently discarding input |
| Populated | Normal workflow |

## Testing Strategy

- Pure helper/reducer tests:
- Feature component tests:
- Hook/controller tests:
- Route integration tests:
- Mocked Playwright path:
- Seeded live-stack path, when applicable:

## Acceptance Path

Write one end-to-end scenario that proves the page is useful. It should include the primary action, resulting state, navigation/reload where relevant, and at least one recovery path.

## Deferred Capabilities

List only intentional deferrals with a reason and re-enable condition. Active bugs and current implementation tasks belong in `docs/status/current.md`.
