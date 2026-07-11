# Delivery History

**Last updated:** 2026-07-10

This is the concise record of completed Verdant Pages phases. It preserves
useful delivery context without making the forward
[roadmap](overview.md) carry detailed historical status.

## Phase 0 - Pre-build setup

- Established the sibling-repository system boundary.
- Verified Cambium and Rhizome local service paths.
- Established the local test-user workflow.

## Phase 1 - Scaffold and build tooling (`willow`)

- Vite, React, strict TypeScript, linting, Vitest, Playwright, and aliases.
- Initial route and application structure.

## Phase 2 - Design tokens, theme, and fonts (`aspen`)

- Dark/light semantic token system.
- Theme persistence.
- Verdant typography and foundational global styles.

## Phase 3 - Primitives and application shell (`cedar`)

- Core primitives, navigation, authenticated shell, theme controls,
  notification shell, and route placeholders.
- Responsive navigation behavior and basic browser smoke coverage.

## Phase 4 - Authentication and API foundation (`birch`)

- Login, registration, logout, refresh restoration, protected/public routes,
  and auth tests against Cambium.
- Typed `apiFetch`, consistent `ApiError`, connectivity tracking, query retry,
  offline banner, and generic toast infrastructure.
- Domain API modules for garden, plants, tasks, calendar, shopping, search,
  alerts, notifications, interactions, chat, triage, weather, incidents,
  projects, and activity.
- Fetch/ReadableStream SSE parsing for chat and notifications.
- Structured blocked-task and plant batch-removal contracts.
- Media intentionally excluded because the backend media routes remain stubs.

## Phase 5a - Activity foundation (`sugar-maple`)

- Replaced the Activity placeholder with the real global journal feed.
- Added themed category/event/subject/date controls and validation.
- Chose cursor-based infinite scrolling over numbered pagination.
- Added loading, error, empty, retry, stale-response, pagination, and mobile
  overflow coverage.
- Added mocked browser coverage and an opt-in live Activity smoke path.

## Phase 5b - Rhizome foundation (`red-maple`, in progress)

Delivered so far:

- Thread home, recent-thread shortcuts, thread drawer, selected-thread routes,
  and no silent creation.
- History rendering, Markdown, first-message creation/navigation, streaming,
  optimistic bubbles, retry, and clean reload behavior.
- Structured session context and deterministic focus references.
- Start-thread weather, time/energy/focus, daily shortlist, and recent threads.
- Pinned context, autocomplete, composer object tokens, and context chips.
- First-pass interaction drawer and resume streaming.
- Embedded workspace layout with anchored composer and responsive panel widths.

The remaining stabilization and contract-alignment work is tracked in
[status/current.md](../status/current.md), not duplicated here.
