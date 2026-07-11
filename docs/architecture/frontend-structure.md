# Frontend Structure For Complex Features

**Status:** Accepted target architecture; existing complex pages migrate incrementally.

**Last reviewed:** 2026-07-10

This document defines how Verdant Pages should organize complex route-level workflows. It supplements the current [component inventory](components.md): that document says what exists today, while this one defines the structure new features and deliberate refactors should follow.

Rhizome is the first implementation of this structure. Its workbench regions,
context controls, pure helpers, and chat-turn lifecycle now live in
`src/features/rhizome/`; `RhizomePage.tsx` remains the route composition and
query-coordination root. The remaining incremental work is to extract focused
session/context query hooks and divide the shared feature stylesheet by owner.
This implementation should make the architecture concrete for Today, Tasks,
Calendar, Garden, Incidents, and Projects.

## Structural Model

```text
route page
  -> feature hooks/controllers
  -> feature components
  -> shared primitives
  -> typed API modules
```

Recommended source layout:

```text
src/
  pages/
    RhizomePage.tsx

  features/
    rhizome/
      components/
      hooks/
      lib/
      types.ts

  components/
    primitives/
    shell/

  lib/
    api/
    auth/
    query/
    sse/
    types/
```

`src/features/` is for cohesive product workflows containing components plus non-component behavior. `src/components/` remains for domain-neutral primitives and global shell concerns. A small page does not need a feature directory merely to satisfy a template.

## Layer Responsibilities

### Route page

A route page owns:

- route parameters, search parameters, and navigation;
- page-wide error or not-found boundaries;
- composition of major feature regions;
- coordination between workflows that genuinely span those regions.

A route page should not own every field, parser, query, mutation, and row renderer. It should be possible to understand the page's primary workflow and major regions without reading unrelated implementation details.

### Feature hooks or controllers

A feature hook owns a coherent server or workflow concern, such as:

- a chat turn and its stream lifecycle;
- editable session context;
- context search and selection;
- a task-ledger query and mutations;
- an incident treatment review.

Hooks may coordinate TanStack Query and local workflow state. Avoid one replacement “god hook” that simply moves the entire page into another file.

### Feature components

Feature components express domain concepts and receive explicit data and callbacks:

- `ThreadNavigator` rather than `LeftBox`;
- `ConversationTimeline` rather than `MiddleSection`;
- `SessionContextEditor` rather than `TopCards`;
- `ReviewPanel` rather than `RightDrawer`.

They may own temporary visual state that does not affect other regions. Server requests and cross-region workflow transitions normally remain in feature hooks or the route coordinator.

### Shared primitives and shell

Primitives are domain-neutral controls with consistent accessibility and styling. Shell components frame the entire authenticated application. A feature should use these before creating a parallel button, field, modal, select, panel close control, or status treatment.

### API modules and DTOs

`src/lib/api/` remains React-independent and calls Cambium. DTOs remain in `src/lib/types/`. Feature hooks consume API functions through TanStack Query; components do not call `fetch` directly.

## Primary Workflow First

Every complex page has one dominant workflow. Supporting regions must help rather than compete with it.

For Rhizome:

| Role | Surface |
|---|---|
| Primary workflow | Conversation timeline and composer |
| Durable context | Thread identity and session context |
| Supporting navigation | Thread navigator |
| Supporting decision | Interaction/review panel |
| Transient utility | Context search and autocomplete |

This classification determines visual priority, state ownership, responsive order, and what may collapse.

## State Ownership

Give each state one clear owner.

| State kind | Owner |
|---|---|
| Backend records and request status | TanStack Query in a page/feature hook |
| Route identity and linkable filters | Router params/search params |
| Multi-step async workflow | Dedicated feature hook or reducer |
| Input draft | Owning form or composer |
| Temporary panel/popover visibility | Owning shell or feature component |
| Global auth/theme/connectivity/toasts | Existing providers/stores |

Do not copy server state into local state merely for convenience. Local drafts are appropriate for editing, optimistic UI, and incomplete streamed output, provided reconciliation and rollback are explicit.

## Async Workflows

Model meaningful states and transitions rather than accumulating loosely related booleans.

For a Rhizome turn, the conceptual lifecycle is:

```text
idle
  -> creating thread
  -> saving initial context
  -> streaming
  -> awaiting interaction
  -> resuming
  -> complete

Any active step -> failed or cancelled
```

An implementation may use a reducer, discriminated union, or a focused hook. It should make invalid combinations difficult and answer:

- which thread owns the operation;
- whether the operation may be retried safely;
- what partial state is visible;
- how cancellation differs from failure;
- how server state reconciles with optimistic state.

## Component Extraction Criteria

Extract when a boundary improves ownership or testing, not to meet an arbitrary line count.

Strong extraction signals:

- a region has its own interaction contract or lifecycle;
- several state values change together;
- a region can be described with a domain name;
- presentation can be tested through explicit props/callbacks;
- styles form a coherent responsive block;
- logic is repeated or useful to another feature.

Weak extraction signals:

- the JSX is merely visually long;
- a wrapper would accept dozens of unrelated props;
- the proposed component has no behavior or domain meaning;
- extraction would create generic abstractions before a second use exists.

Prefer domain-specific components first. Generalize only after repeated semantics are demonstrated.

## CSS Ownership

- Colocate a feature component's styles with that component.
- Keep tokens and true global foundations in `src/styles/`.
- Keep large-region page composition with the route/workbench shell.
- Avoid parent selectors that reach deeply into a child component.
- Do not duplicate literal colors or parallel token definitions.
- Treat light/dark, long text, and narrow widths as part of the initial component contract.

When extracting from a large stylesheet, move only selectors owned by the component. Do not rewrite accepted visuals during a structural slice unless a defect requires it.

## Responsive Composition

Responsive design changes composition rather than simply shrinking desktop:

- **Wide:** primary workflow plus useful supporting panels.
- **Tablet:** primary workflow plus at most one prominent supporting region.
- **Phone:** one primary surface; supporting content becomes a focused overlay, inline expansion, or route.

The route/workbench shell owns relationships between major regions. Each feature component owns its internal wrapping, truncation, and touch-target behavior.

Panels must define:

- how they open and close;
- whether they push, overlay, or replace content at each width;
- initial and returned focus;
- Escape/outside-click behavior where applicable;
- whether their state belongs in the URL.

## Accessibility

Accessibility is part of architecture because it affects component contracts.

- Prefer semantic landmarks and controls.
- Give icon-only actions accessible names and tooltips when unfamiliar.
- Preserve visible keyboard focus.
- Manage focus for modals and temporary panels.
- Announce meaningful async status without repeatedly announcing streamed tokens.
- Honor reduced-motion preferences for decorative animation.
- Do not encode status only by color.

## Testing Boundaries

| Concern | Test |
|---|---|
| Parsing, formatting, grouping, state reducer | Unit test |
| Feature component interaction and accessibility | Colocated component test |
| Query/mutation/stream controller behavior | Hook/controller test |
| Major regions working together | Focused route-page test |
| User acceptance path and responsive integration | Playwright |
| Cross-repository contract | Seeded live-stack smoke |

As a page is split, move detailed assertions into the owning unit/component/hook suites. Retain a smaller route integration suite and the existing browser acceptance coverage.

## Implementation Sequence

For a large existing page:

1. Record the current quality baseline and acceptance paths.
2. Extract pure helpers and add direct unit tests.
3. Extract read-only/presentational regions with explicit props.
4. Extract coherent async hooks or reducers one workflow at a time.
5. Move CSS with each extracted component.
6. Keep the route page as the visible composition root.
7. Run focused tests after every slice and all gates before review.

Do not combine structural extraction with broad visual redesign or backend contract changes. Separate commits make regressions diagnosable.

## Rhizome Target Shape

The exact names may evolve during extraction, but the intended boundaries are:

```text
features/rhizome/
  components/
    WorkbenchHeader.tsx
    ThreadNavigator.tsx
    NewThreadDashboard.tsx
    SessionContextStrip.tsx
    ConversationTimeline.tsx
    RhizomeComposer.tsx
    ReviewPanel.tsx
    ContextChip.tsx
    ContextInlineInput.tsx
  hooks/
    useChatTurn.ts
    useSessionContext.ts
    useContextSearch.ts
  lib/
    messages.ts
    context.ts
    composerTokens.ts
    weather.ts
  types.ts
  RhizomeLayout.module.css
  WorkbenchHeader.module.css
  WorkbenchRails.module.css
  StartSession.module.css
  ConversationTimeline.module.css
  RhizomeComposer.module.css
  ContextControls.module.css
```

`RhizomePage.tsx` reads as route identity, top-level resource loading, and composition. The feature module owns Rhizome-specific workflow behavior and component styling.

## Definition Of Done For A Complex Page

- The dominant workflow is obvious and remains usable without supporting panels.
- State ownership and async transitions are explicit.
- Loading, empty, error, retry, pending, and stale states are designed.
- Desktop, tablet, and phone composition is intentional.
- Keyboard, focus, and reduced-motion behavior is covered.
- CSS is owned by the components it styles.
- Unit, component, page, and browser coverage align with the boundaries.
- The page spec, capability matrix, and current status remain accurate.
