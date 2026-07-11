# Testing Guide

**Last verified:** 2026-07-10

## Test Layers

| Layer | Tools/location | Proves |
|---|---|---|
| Unit | Vitest, `src/**/*.test.ts` | Pure utilities, stores, parsing, state transitions |
| Component | Testing Library, colocated `.test.tsx` | Accessible rendering and interaction contracts |
| API client contract | `src/lib/api/*.test.ts` | Cambium URL, method, query, body, response/error handling |
| Page behavior | `src/pages/*.test.tsx` | Loading, empty, error, race, mutation, and composition behavior |
| Mocked browser | Playwright with route fixtures | Deterministic end-user workflows and responsive behavior |
| Live integration | Opt-in Playwright/full-stack checks | Actual Verdant -> Cambium -> Rhizome compatibility |

No single layer replaces another. Mocked browser tests make rare states deterministic; live tests detect cross-repo contract and environment failures.

## Commands

```bash
npm run test        # Vitest watch mode
npm run test:run    # Vitest single run
npm run test:e2e    # Playwright
npm run lint
npm run build
```

The live quality-gate result belongs in [current status](../status/current.md), not in this guide.

## Test Design Rules

- Test visible behavior and public module contracts, not implementation details.
- Query elements by role/name, then label, then visible text. Use test IDs only when semantics cannot identify the target.
- Use `userEvent` for user interaction.
- Disable TanStack Query retries in focused tests unless retry behavior is the subject.
- Mock at the domain API module boundary for page/component tests.
- Test `apiFetch` itself separately; do not repeatedly re-test its internals through every page.
- Use deterministic clocks for date-sensitive behavior. Never hard-code a calendar date that silently expires.
- Abort or settle streams/timers in teardown so tests do not leak work.

## Required Page States

For a real page, cover the states that apply:

- initial loading;
- empty result;
- populated result;
- recoverable HTTP error;
- network/offline error;
- invalid local input;
- mutation pending/success/failure;
- stale response or route/filter race;
- keyboard and focus behavior;
- narrow-width overflow/truncation.

Placeholder routes do not need tests that only assert placeholder text. Add behavior tests when implementation begins.

## API Client Tests

Each domain operation should verify:

- exact path and HTTP method;
- query omission/default behavior;
- serialized request body;
- structured return type behavior;
- unusual status handling when the operation adds special semantics.

Backend schema correctness is also verified live when a contract changes. A mocked request test cannot prove that Cambium exposes the route.

## Streaming And Rhizome

Chat coverage should include:

- first-message thread creation and navigation;
- one optimistic user message and duplicate suppression;
- token ordering and one final assistant message;
- thinking state only while pending;
- abort on thread switch/unmount;
- malformed/error event handling;
- retry after a failed connection;
- session context saved before or with the first turn;
- interaction event, resolution, and resumed stream;
- reload/history without empty or duplicated bubbles;
- Markdown and structured object-reference rendering.

At least one seeded live path should prove create -> context -> stream -> review/resume -> switch/reload before Phase 5 closes.

## Playwright Modes

The default config runs Desktop Chromium and starts or reuses Vite.

Use route fixtures for deterministic UI behavior. Current Activity and Rhizome specs demonstrate this approach. Use unique accounts when a test intentionally talks to a real Cambium instance.

Live modes must be explicit through a documented environment flag or separate job. They require the [full stack](../getting-started/full-stack.md) and user-scoped data.

Do not make Playwright responsible for arbitrarily stopping developers' local services. Service lifecycle testing belongs in a controlled integration environment.

## Accessibility And Visual Checks

Automated interaction tests should catch semantic regressions. Before phase closeout, also verify:

- keyboard-only operation;
- visible focus;
- dialog/panel focus return;
- light/dark contrast;
- reduced motion;
- desktop, tablet, and phone layouts;
- long labels and empty/error content.

Screenshot baselines should be introduced as a deliberate shared policy, not ad hoc snapshots that no one knows how to update.

## Regression Rule

Every fixed user-visible bug should receive the lowest-level reliable regression test plus a browser test when the failure crossed page state, routing, streaming, responsive layout, or multiple services.
