# Verdant Pages - Coding Agent Guide

**Last verified:** 2026-07-10

This file contains stable repository guidance for coding agents. It intentionally
does not track active tasks, branches, test counts, or recently completed work.
Read [docs/status/current.md](docs/status/current.md) for the live checkpoint and
[docs/roadmap/overview.md](docs/roadmap/overview.md) for the delivery plan.

## Product and system boundary

Verdant Pages is the React frontend for the Gardening Agent system and the
primary surface a gardener uses day to day.

```text
Browser -> Verdant Pages -> Cambium (:8080) -> Rhizome (:8001) -> Fairlead
```

Verdant calls Cambium only. It never calls Rhizome, Fairlead, Postgres, or
LangGraph directly.

Sibling repositories:

| Repository | Responsibility |
|---|---|
| `../cambium` | Authentication, provider keys, public/versioned API, Rhizome proxy, static SPA serving |
| `../rhizome` | Agent graph, garden domain behavior, persistence, monitoring, structured internal API |
| `../fairlead` | Inference routing and local/cloud model fallback |

## Required reading

Use the shortest path that fits the task:

1. [Current status](docs/status/current.md) - active phase, priorities, blockers, quality gates.
2. [Roadmap](docs/roadmap/overview.md) - intended delivery order and acceptance criteria.
3. [Codebase tour](docs/architecture/codebase-tour.md) - where current code lives.
4. [Frontend structure](docs/architecture/frontend-structure.md) - how complex route features are organized.
5. Relevant [page specification](docs/pages/) - intended user experience.
6. [Visual identity](docs/design/visual-identity.md) - design principles and visual language.

## Commands

Requires Node 24 (`.nvmrc`).

```bash
nvm use
npm ci
npm run dev
npm run build
npm run lint
npm run test:run
npm run test:e2e
```

Pure UI and mocked tests do not require the backend. Live API and agent flows
require Cambium, Rhizome, Postgres, and at least one configured provider key.
See [docs/getting-started/full-stack.md](docs/getting-started/full-stack.md).

## Current source layout

```text
src/
|-- components/
|   |-- activity/       Activity feed and filters
|   |-- primitives/     Domain-neutral UI controls
|   |-- rhizome/        Shared Rhizome/context controls
|   `-- shell/          Navigation, app shell, notifications, connectivity, toasts
|-- features/           Target home for complex domain workflows; introduced incrementally
|-- lib/
|   |-- api/            Typed Cambium client modules and request-shape tests
|   |-- auth/           Session context and useAuth
|   |-- connectivity/   Network-state tracking
|   |-- query/          TanStack Query configuration
|   |-- sse/            Fetch/ReadableStream SSE consumers
|   |-- theme/          Theme state
|   |-- toast/          Global toast store
|   `-- types/          Cambium and Rhizome DTO types
|-- pages/              Route components; many future routes remain placeholders
|-- routes/             Router and auth guards
|-- styles/             Tokens, global styles, utilities
`-- test/               Vitest setup

e2e/                    Playwright browser tests
docs/                   Product, architecture, design, development, and roadmap docs
```

## Architectural invariants

- **Cambium is the only frontend backend.** Public requests use `/auth` or
  `/api/v1` and go through the typed client layer.
- **Keep ordinary requests behind `apiFetch`.** Streaming helpers may use
  `fetch` through the SSE layer because they need incremental reads.
- **Never use `EventSource`.** Chat uses POST bodies and authenticated headers;
  use `fetch` plus `ReadableStream`.
- **Keep access tokens in memory.** Never place JWTs in localStorage,
  sessionStorage, query parameters, or JavaScript-readable cookies.
- **Use TanStack Query for server state.** Page-local UI state is appropriate
  for transient presentation, not cached backend records.
- **Use design tokens.** Add reusable values to `tokens.css`; do not scatter
  literal colors across component CSS.
- **Keep complex route pages thin.** Route pages own identity and composition;
  feature modules own cohesive domain components, hooks, workflow state, and
  helpers. Do not replace a god page with a god hook.
- **Routes own durable workflows.** Full creation and complex editing use
  dedicated URLs. Temporary navigation, review, and context inspection may use
  workspace drawers when the page specification calls for them.
- **Backend behavior stays in Rhizome.** Verdant renders structured state and
  submits user decisions; it does not reproduce triage, planning, or lifecycle
  logic.
- **Update documentation with behavior.** A change is incomplete when its page
  specification, current status, capability matrix, or API reference is left
  factually wrong.

## Implementation guidance

### Add or change an API call

1. Verify the current Cambium Swagger/Rhizome contract.
2. Update types in `src/lib/types/`.
3. Add or change the domain wrapper in `src/lib/api/`.
4. Cover URL, method, query, and body shape in a colocated test.
5. Use the wrapper through TanStack Query in the page/component.
6. Update the capability matrix and relevant page documentation.

### Add or change a page

1. Read the page specification and visual principles.
2. Use the [page template](docs/pages/_template.md) when defining a new or materially redesigned workflow.
3. Keep route identity/composition in the page and cohesive workflow state in dedicated feature hooks/controllers.
4. Extract components around domain responsibilities, not visual rectangles.
5. Cover loading, error, empty, populated, and mutation states as applicable.
6. Add browser coverage for the phase's user-visible acceptance path.

### Work with Rhizome chat

- Treat stream cancellation, completion, partial responses, retry, optimistic
  messages, and thread switching as one stateful workflow.
- Use the dedicated thread session-context endpoint for `time_text`,
  `energy_text`, `focus_text`, and `focus_context`.
- Preserve stable object references (`subject_type`, `subject_id`) instead of
  asking Rhizome to rediscover objects from prose.
- Keep pinned-thread context distinct from message-only context.

## Definition of done

Before a slice is ready for review:

- The requested behavior works in light and dark themes at supported widths.
- Relevant unit/component and Playwright coverage exists.
- `npm run build`, `npm run lint`, and affected tests pass.
- Live backend behavior is smoke-tested when the change crosses the Cambium or
  Rhizome contract.
- Documentation and the live status checkpoint are accurate.
- Unfinished work has an explicit owner, reason, and re-enable condition.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution workflow.
