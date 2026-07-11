# Codebase Tour

**Last verified:** 2026-07-10

This is the shortest path from a running development server to the right place to make a change.

## Runtime

`src/main.tsx` loads the global style layers and mounts `src/App.tsx`. Providers wrap the router in this order:

```text
ThemeProvider
  QueryClientProvider
    AuthProvider
      RouterProvider
```

Global styles:

- `src/styles/tokens.css`: palette and semantic theme variables;
- `src/styles/global.css`: reset, elements, and global keyframes;
- `src/styles/utilities.css`: small shared utility classes.

## Routes And Shell

`src/routes/router.tsx` is the route source of truth. Public routes are `/`, `/login`, and `/register`. Authenticated routes are guarded by `ProtectedRoute` and rendered inside `AppShell`.

`src/components/shell/` owns navigation, offline state, notifications, and toasts. The notification drawer is global. Feature pages may own temporary workflow panels, such as Rhizome's thread and review workspaces.

When adding a route, update:

1. `src/routes/router.tsx`;
2. navigation if the route needs a persistent entry point;
3. [route documentation](routes.md);
4. the relevant [page spec](../pages/).

## Pages

Page components live in `src/pages/`; auth pages live in `src/pages/auth/`.

Current implementation is uneven by design stage:

- Activity and Rhizome contain substantial workflows.
- Login, registration, landing, and shell are implemented.
- many later domain pages are route-complete placeholders awaiting their roadmap phase.

Use [current status](../status/current.md) for readiness, page specs for intended UX, and source for exact present behavior. If a change makes them disagree, update the docs in the same commit.

## Components

| Folder | Role |
|---|---|
| `src/components/primitives/` | Domain-neutral controls |
| `src/components/shell/` | Global application frame and feedback |
| `src/components/activity/` | Activity history workflow |
| `src/components/rhizome/` | Shared Rhizome controls such as context autocomplete |

Complex product workflows will migrate into `src/features/<domain>/`, beginning with Rhizome. This target may contain domain components, hooks/controllers, pure helpers, and feature-local types while the route page remains the composition root.

See [component architecture](components.md) for the current inventory and [frontend structure](frontend-structure.md) for the accepted target. Do not treat proposed entries in [design patterns](../design/patterns.md) as existing components.

## API And Types

All Cambium calls live in `src/lib/api/`. Ordinary requests use `apiFetch`; authenticated incremental streams use `src/lib/sse/stream.ts`.

| Path | Role |
|---|---|
| `src/lib/api/client.ts` | Base request, token, refresh, errors, query strings |
| `src/lib/api/<domain>.ts` | Typed domain operations without React dependencies |
| `src/lib/api/<domain>.test.ts` | Method, URL, query, and body contract tests |
| `src/lib/types/cambium.ts` | Gateway/auth/stream DTOs |
| `src/lib/types/rhizome.ts` | Gardening-domain views proxied by Cambium |

Pages consume these functions through TanStack Query. Components do not call `fetch()` directly.

## Authentication

`src/lib/auth/context.tsx` owns UI session state and refresh coordination. Access tokens live only in module memory. Cambium owns the refresh cookie. Route guards live in `src/routes/ProtectedRoute.tsx` and `PublicOnlyRoute.tsx`.

## Testing

| Behavior | Primary location |
|---|---|
| API request contract | `src/lib/api/*.test.ts` |
| Auth and route guards | auth/route tests |
| Reusable component interaction | colocated component test |
| Page behavior and regressions | page tests |
| Full browser workflow | `e2e/` Playwright tests |

Run `npm run test:run`, `npm run lint`, and `npm run build` for the standard local verification set. Full live-stack E2E tests additionally require Cambium, Rhizome, their database, and configured providers or deterministic fixtures.

## Common Changes

**New endpoint:** verify backend route, update types, add domain client function, add request test, consume through Query, update capability/page docs.

**New page:** add route component, register route, add navigation only when persistent access is needed, add/update page spec, add focused tests.

**Debug an API failure:** inspect the domain module, `apiFetch`, auth refresh, Cambium health at `http://localhost:8080/health`, and the current backend response schema.

**Change a visual rule:** update tokens or the appropriate shared component before introducing page-local exceptions; verify light/dark and mobile/desktop rendering.
