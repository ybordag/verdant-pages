# Tech Stack

**Last verified:** 2026-07-10

| Layer | Current choice | Purpose |
|---|---|---|
| Runtime/tooling | Node 24 via `.nvmrc`, Vite 8 | Development server and production SPA build |
| UI | React 19 | Component rendering and local interaction state |
| Language | TypeScript 6, strict | End-to-end frontend type checking |
| Routing | React Router 6 | Nested protected routes and linkable workflows |
| Server state | TanStack Query 5 | Fetching, cache, mutations, and invalidation |
| Tables | TanStack Table 8 | Headless tables where ledger comparison warrants it |
| Icons | Lucide React | Consistent interface icons |
| Styling | CSS custom properties and CSS modules | Token-driven themes without runtime CSS-in-JS |
| Unit/component tests | Vitest, Testing Library, jsdom | Fast behavior and regression tests |
| Browser tests | Playwright | User workflows and live-stack integration |
| Quality | ESLint 10, Prettier 3 | Static checks and formatting |

## Architectural Choices

- This is a fully authenticated SPA; server-side rendering adds little value and substantial auth/hydration complexity.
- Remote state belongs in TanStack Query. Auth context handles the one global session concern; no general state store is currently needed.
- CSS modules keep page/component styles scoped, while semantic tokens keep themes consistent.
- `fetch` plus `ReadableStream` is required for authenticated POST-based SSE. `EventSource` is not suitable.

## Not Yet Chosen

Drag-and-drop is not currently installed. Calendar rescheduling and future planning views should evaluate a maintained library when those workflows are implemented rather than documenting a dependency in advance.

Dependency versions in `package.json` are authoritative. Update this file when a stack-level choice changes, not for routine patch upgrades.
