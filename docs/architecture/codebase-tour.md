# Codebase Tour

**Last updated:** 2026-06-21

This is the orientation layer between "the dev server runs" and "I know where to make a change." It describes how the current repo is wired, with paths that match the source tree.

---

## Runtime Entry Points

The browser enters through `src/main.tsx`. That file imports the global CSS layers in order:

1. `src/styles/tokens.css` — design tokens and theme variables.
2. `src/styles/global.css` — base element styles.
3. `src/styles/utilities.css` — small reusable utility classes.

`src/App.tsx` wraps the router in the app-level providers:

```text
ThemeProvider
  QueryClientProvider
    AuthProvider
      RouterProvider
```

That provider order matters. Theme is available everywhere, TanStack Query owns server state below it, auth owns session state and token refresh, and the router renders the active page.

---

## Routing And Shell

Routes live in `src/routes/router.tsx`. Public routes are `/`, `/login`, and `/register`. Authenticated routes live under `/app` and render through `ProtectedRoute` plus `AppShell`.

`src/components/shell/AppShell/AppShell.tsx` is the authenticated layout:

- `AppNav` renders the sidebar, garden profile card, quick actions, theme toggle, notification bell, and logout.
- `OfflineBanner` sits above page content.
- `<Outlet />` renders the current page.
- `NotificationDrawer` is the only drawer in the app.
- `ToastHost` renders global toast notifications.

When adding a new page route, update both `src/routes/router.tsx` and [routes.md](routes.md). If the route needs navigation, update `AppNav` and the relevant page spec.

---

## Pages

Page components live flat in `src/pages/`, with auth-only pages in `src/pages/auth/`.

The page docs in `docs/pages/` are the product specs. They describe UX, route ownership, and API expectations. The source files are currently a mix of shipped Phase 4 infrastructure and placeholder product pages for Phases 5–8, so use both:

- Read `docs/pages/<page>.md` to understand intended behavior.
- Read `src/pages/<PageName>.tsx` to see what actually exists.
- If they disagree, update the doc or implementation in the same change.

Creation and edit flows should use dedicated routes or inline editing. Do not add new drawers; the notification drawer is the only exception.

---

## Components

Reusable UI lives under `src/components/`.

| Folder | Purpose |
|---|---|
| `components/primitives/` | Small reusable controls: Button, Input, Select, Modal, StatusBadge, ThemeToggle |
| `components/shell/` | App frame components: AppNav, AppShell, Breadcrumb, NotificationDrawer, OfflineBanner, Toast |

Each component owns its CSS module and usually has a colocated test. Keep that pattern when adding components:

```text
ComponentName/
  ComponentName.tsx
  ComponentName.module.css
  ComponentName.test.tsx
```

Shared visual decisions belong in tokens, not one-off CSS values. Use [design-tokens.md](design-tokens.md) as the reference for color, spacing, typography, and theme variables.

---

## API And Server State

All Cambium calls go through `src/lib/api/`.

| Path | Role |
|---|---|
| `client.ts` | Base `apiFetch`, in-memory access token, refresh-on-401, network-failure reporting |
| `auth.ts` | Login/register/logout/session helpers |
| `chat.ts` | Agent chat stream request helpers |
| domain modules | `garden.ts`, `tasks.ts`, `projects.ts`, `incidents.ts`, etc. |
| `*.test.ts` | Contract tests for URL, method, body, and query-string behavior |

Components should not call `fetch()` directly. They should call domain API functions through TanStack Query hooks or mutations. If a new endpoint is needed, add it to the relevant `src/lib/api/*.ts` module first, then cover the request shape in the colocated test.

DTO types live in:

- `src/lib/types/cambium.ts` for auth, notification, and gateway-facing types.
- `src/lib/types/rhizome.ts` for domain DTOs returned through Cambium's versioned API.

---

## Auth And Session

`src/lib/auth/context.tsx` owns UI session state. On mount it attempts `POST /auth/refresh`, loads `/auth/session` if refresh succeeds, and starts a proactive refresh interval.

The access token itself lives only in `src/lib/api/client.ts` module state. It is never written to localStorage, sessionStorage, cookies, or URLs. Cambium owns the httpOnly refresh cookie.

Route guards live in:

- `src/routes/ProtectedRoute.tsx`
- `src/routes/PublicOnlyRoute.tsx`

---

## SSE

SSE is implemented with `fetch` plus `ReadableStream` in `src/lib/sse/stream.ts`. Do not use `EventSource`: chat streams require POST bodies, and authenticated streams need headers without leaking tokens into query strings.

`consumeSSEStream` handles chat-style streams and accepts an `AbortSignal` so page navigation, logout, or component unmount can cancel the request. `consumeNotificationStream` handles the long-lived notification stream; reconnect behavior is specified but scheduled with Phase 8 notification wiring.

See [sse-streaming.md](sse-streaming.md) and [error-handling.md](../development/error-handling.md) for the contract.

---

## Testing Map

Use the smallest test that proves the behavior:

| Change | Test location |
|---|---|
| API request shape | `src/lib/api/<module>.test.ts` |
| Auth/session behavior | `src/lib/auth/context.test.tsx`, route guard tests |
| Primitive component behavior | colocated component test |
| Shell/navigation behavior | `src/components/shell/**` tests |
| End-to-end route behavior | `e2e/` Playwright tests |

Run `npm run test:run` for unit/component tests and `npm run test:e2e` for browser flows. Full E2E flows that need real data require Cambium and Rhizome to be running.

---

## Common Change Paths

**Add a new API endpoint**

1. Add types in `src/lib/types/rhizome.ts` or `src/lib/types/cambium.ts`.
2. Add a function in the relevant `src/lib/api/*.ts` module.
3. Add or update the colocated API test.
4. Wire the page through TanStack Query.
5. Update the relevant page spec and [api-modules.md](api-modules.md).

**Add a new page**

1. Add `src/pages/NewPage.tsx`.
2. Register the route in `src/routes/router.tsx`.
3. Add navigation in `AppNav` only if it belongs in the sidebar or a shell card.
4. Add or update the page spec in `docs/pages/`.
5. Add focused component or route tests.

**Debug a failing API call**

1. Check the domain module in `src/lib/api/`.
2. Check `apiFetch` behavior in `src/lib/api/client.ts`.
3. Check whether auth refresh is involved in `src/lib/auth/context.tsx`.
4. Confirm Cambium is reachable with `curl http://localhost:8080/health`.
5. Compare the frontend DTO with Cambium/Rhizome's current response.
