# Testing Guide

**Last updated:** 2026-06-21

## Stack

| Tool | Role |
|---|---|
| **Vitest** | Unit and component tests. Runs inside Vite's pipeline — shares config, aliases, and transforms with zero extra setup. |
| **@testing-library/react** | Renders components and queries them by role, label, and visible text — not by class names or internal state. |
| **@testing-library/user-event** | Simulates real user interactions (click, type, keyboard) more faithfully than `fireEvent`. |
| **@testing-library/jest-dom** | Custom matchers: `toBeInTheDocument`, `toBeVisible`, `toHaveValue`, etc. Auto-imported via `src/test/setup.ts`. |
| **Playwright** | End-to-end browser tests against the running app. Chromium only for now. |

---

## Running tests

```bash
npm run test        # Vitest watch mode — for development
npm run test:run    # Vitest single run — for CI
npm run test:e2e    # Playwright E2E (auto-starts dev server if needed)
```

---

## Where tests live

- Unit and component tests: `src/**/*.test.{ts,tsx}` — co-located with source files
- E2E tests: `e2e/*.spec.ts`

Vitest is scoped to `src/**` only — it will not accidentally pick up Playwright specs.

---

## Writing component tests

The pattern: render, query by accessible role or text, assert.

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskRow } from './TaskRow'

describe('TaskRow', () => {
  it('shows task name', () => {
    render(<TaskRow task={mockTask} />)
    expect(screen.getByText('Water tomatoes')).toBeInTheDocument()
  })

  it('calls onComplete when checkbox is clicked', async () => {
    const onComplete = vi.fn()
    render(<TaskRow task={mockTask} onComplete={onComplete} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onComplete).toHaveBeenCalledWith(mockTask.id)
  })
})
```

**Query priority** (use the highest one that applies):
1. `getByRole` — most resilient, catches accessibility regressions
2. `getByLabelText` — for form inputs
3. `getByText` — for visible text content
4. `getByTestId` — last resort only, when no semantic query fits

---

## Testing components with API dependencies

Wrap with `QueryClientProvider` and mock `apiFetch` at the module boundary — never mock `fetch` directly.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as apiClient from '@/lib/api/client'

vi.mock('@/lib/api/client')

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
)

it('shows task list from API', async () => {
  vi.mocked(apiClient.apiFetch).mockResolvedValue([mockTask])
  render(<TasksPage />, { wrapper })
  expect(await screen.findByText('Water tomatoes')).toBeInTheDocument()
})
```

Use `findBy*` (async) when the component fetches data on mount — it waits for the element to appear.

---

## Testing auth-protected components

Wrap with `AuthProvider` and set the mock token state as needed.

```tsx
import { AuthProvider } from '@/lib/auth/context'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)
```

For components that require an authenticated user, mock `useAuth` to return a user object directly.

---

## Writing E2E tests

E2E tests live in `e2e/` and use the Playwright `test` and `expect` from `@playwright/test`. The dev server auto-starts via `webServer` in `playwright.config.ts`.

```ts
import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL('/app/today')
})
```

E2E tests that hit real API endpoints require Cambium and Rhizome to be running. Pure UI E2E tests (forms, navigation, rendering) work without the backend.

For page behavior that depends on structured API data but does not need a live backend, add Playwright route fixtures under `e2e/fixtures/`. The Activity page uses this pattern in `e2e/activity.spec.ts`: it mocks auth/session plus `GET /api/v1/activity`, generates a busy feed, verifies infinite-scroll cursor requests, checks invalid filter ranges do not query, covers reset/filter pagination behavior, checks mobile overflow, and covers a slow initial response racing with a newer filtered request. Its opt-in live backend smoke stays skipped unless `VERDANT_LIVE_ACTIVITY_E2E=1` is set with Cambium/Rhizome running.

---

## What to test at each phase

| Phase | Unit / component | E2E |
|---|---|---|
| 1 — Scaffold | App renders without crashing ✅ | App loads, text visible ✅ |
| 2 — Tokens + theme | `ThemeProvider` toggles `data-theme`, reads `localStorage` | Dark/light toggle persists across page reload |
| 3 — Primitives + shell | Each primitive renders, Modal traps focus, nav items render | All nav items clickable, route stubs resolve |
| 4 — Auth | `apiFetch` attaches token, 401 triggers refresh + retry, `ProtectedRoute` redirects | Register → login → protected page → logout → login required |
| 5 — Chat and context | `consumeSSEStream` yields tokens in order, stops on `done`; interaction cards render and resolve | Send message → tokens stream in, interaction card appears; Today/Incidents/Activity load real data |
| 6 — Tasks and projects | Complete task → optimistic strike-through → reverts on error; project/resource panels render with API data | Today task view loads, complete a task, project Gantt/resources smoke path works |
| 7a — Garden hub & objects | Lists render with mock data, filters reduce results, care state/activity sections render | Create bed/container → appears in list; click object → detail page |
| 7b — Plants | Plant list/card/detail render, lifecycle/care sections update, optimistic mutations rollback | Create plant/batch → appears in list; click plant → detail page |

The rule: **every new component gets at least one render test and one interaction test.** E2E tests cover the golden path for each phase before it's considered done.

---

## Mocking

- **API calls:** mock `apiFetch` at the module level with `vi.mock('@/lib/api/client')`
- **SSE streams:** use `ReadableStream` with a test controller that emits events on demand
- **Timers:** use `vi.useFakeTimers()` for token refresh interval tests
- **`localStorage`:** use `vi.stubGlobal` or jsdom's built-in implementation (it persists between tests — clear it in `beforeEach`)

Never mock React Router or TanStack Query internals. Wrap components in real providers with test-appropriate config instead.
