# Roadmap

## How we work

Work is organised into **phases** — each phase has a clear deliverable and a smoke test. Phases 1–4 are sequential. Phases 5a–5e are independent and can run in parallel. Phase 6 is blocked on a Rhizome backend dependency.

Active phase work gets a doc in `docs/current_work/`. Completed phase docs stay there as a record.

---

## Phase status

| Phase | Name | Status | Branch |
|---|---|---|---|
| 0 | Pre-build setup | **complete** | — |
| 1 | Scaffold + build tooling | **complete** | `willow` |
| 2 | Tokens + theme + fonts | **complete** | `aspen` |
| 3 | Primitives + app shell | **complete** | `cedar` |
| 4 | Auth + API client foundation | **in progress** (auth core done and verified end-to-end; domain modules not started) | `birch` |
| 5a | Garden objects | not started | — |
| 5b | Tasks | not started | — |
| 5c | Projects | not started (partial blockers) | — |
| 5d | Calendar | not started (partial blockers) | — |
| 5e | Activity | not started | — |
| 6a | Today page | blocked on rhizome#120 P1 | — |
| 6b | Incidents | blocked on rhizome#120 P1 | — |
| 6c | Agent chat (SSE) | blocked on rhizome#120 P1 | — |
| 7 | Feature backfill | ongoing as backend issues close | — |
| 8 | Polish + deploy | not started | — |

---

## Phase 0 — Pre-build setup ✅

- CLAUDE.md written to repo root
- Confirmed Cambium runs on `:8080`
- Confirmed Rhizome runs on `:8001`
- Confirmed test user exists

---

## Phase 1 — Scaffold + build tooling ✅

**Deliverable:** Project boots, proxies to Cambium, TypeScript compiles clean.

Done:
- Vite 8, React 19, TypeScript strict mode
- Vite proxy: `/api` + `/auth` → `localhost:8080`
- `@/` path alias
- `react-router-dom`, `@tanstack/react-query`, `@tanstack/react-table` installed
- Prettier, ESLint
- `.env.example`, `.nvmrc` (Node 24)
- Empty `src/styles/`, `src/lib/`, `src/components/`, `src/pages/`, `src/routes/`
- `App.tsx` renders `<div>Verdant Pages</div>`
- **Vitest + @testing-library/react** — unit/component test scaffold
- **Playwright** — E2E scaffold with Chromium
- Smoke tests passing: App renders, `npm run build` clean

---

## Phase 2 — Tokens + theme + fonts ✅

**Deliverable:** Full visual foundation — light/dark toggle works, all fonts load. See [phase2_tokens.md](../current_work/phase2_tokens.md) for the full record.

- `src/styles/tokens.css` — full token system ported from `docs/design/mockup.html` (not the simplified prototype): inkwell/vellum scale, RGB channel variables, border radius scale, display variation tokens, semantic surface/text/line tokens for both themes
- `src/styles/global.css` — reset, body, scrollbar, shared keyframes
- `src/styles/utilities.css` — layout and chip utilities
- Google Fonts `<link>` in `index.html` — Shantell Sans, Caveat, Nunito, Montserrat
- `ThemeProvider` — reads/writes `localStorage('theme')`, sets `data-theme` on `<html>`, defaults to dark
- App.tsx wrapped in `ThemeProvider`

**Tests:** 9 unit (ThemeProvider) + 3 E2E (default dark, toggle to light, persistence on reload) — folded into the broader suite in Phase 3.

---

## Phase 3 — Primitives + app shell ✅

**Deliverable:** Full app shell with navigation, all routes stubbed, all 7 nav items. See [phase3_app_shell.md](../current_work/phase3_app_shell.md) for the full record.

**Primitives:** `Button`, `Input`, `Select`, `Textarea`, `Chip`, `FieldLabel`, `Modal`, `InlinePopover`, `StatusBadge`, `ProgressBar`

**Shell:** `AppShell`, `AppNav` (renamed from `VPNav` for genericness — see naming audit below), `NavContext`, `QuickActionsPanel`, `GardenProfileCard`, `NavFooter`, `NotificationDrawer` (empty shell), `Toast` (empty shell), `Breadcrumb`

**Router:** all routes from [routes.md](../architecture/routes.md), 27 page stubs, `ProtectedRoute` (passthrough until Phase 4)

**Tests:** 30 total (20 unit + 10 E2E) covering all 7 nav items, collapse/expand + persistence, pending-badge "lit icon" state, route navigation, notification drawer, theme toggle, Toast and Breadcrumb component behavior.

---

## Phase 4 — Auth + API client foundation 🚧 in progress (`birch`)

**Deliverable:** Login and register work against the real Cambium API. Protected routes redirect correctly. Proactive token refresh runs. All API modules are written and typed.

**Done so far — auth core, verified end-to-end against a real Cambium instance:**
- `LandingPage` — public marketing page at `/` (wordmark, tagline, GitHub link, theme toggle, Login/Sign Up)
- `src/lib/api/client.ts` — `apiFetch`, `ApiError`, in-memory token store, 401→refresh→retry. A 401 only triggers refresh when a token was actually attached, so a bad-login 401 surfaces as a normal `ApiError` instead of looping into the refresh/redirect path.
- `src/lib/api/auth.ts` — `login`, `register`, `logout`, `tryRefreshToken`, `getSession`
- `src/lib/auth/context.tsx` — `AuthProvider`, `useAuth`; silent refresh on mount, `setInterval` proactive refresh every 12 minutes, `visibilitychange` refresh-if-stale
- `ProtectedRoute` — real check, redirects to `/login` when unauthenticated, shows a loading state while resolving
- `AuthLayout`, `LoginPage`, `RegisterPage` — real forms wired to `useAuth().login`/`.register`, inline error messages for 401 (bad credentials) / 409 (email taken) / generic failure
- A "Log out" button landed in `AppNav`'s footer (next to the notification bell) — there was previously no UI path to call `logout()` at all
- `QueryClientProvider` wired into `App.tsx` (default options — nothing to tune yet, no domain queries exist)
- Vite proxy confirmed working end-to-end against real Cambium (manual `curl` + full Playwright suite, not just config)
- `ThemeToggle` extracted into a shared primitive (`src/components/primitives/ThemeToggle/`), used by `AppNav`, `LandingPage`, and `AuthLayout`
- All 10 UI primitives now have unit tests (see [deferred-work.md](../development/deferred-work.md))
- `Button` gained a `ghost-clay` variant — see the variant table in [components.md](../architecture/components.md)
- Password strength meter on `RegisterPage` (`passwordStrength.ts` + `PasswordStrengthMeter`) — 4-bar indicator enforcing length, letters+numbers, uppercase, and special-character requirements
- Light-theme nav/button color pass: `--bg`/`--bg-nav` swapped to `vellum-light`/`vellum`, new `--pine-light` and `--chartreuse-deep` tokens, per-theme `AppNav` overrides for the Garden Profile and Quick Actions cards
- Login/register now give actionable messages instead of bare errors: a 409 on register links to `/login` (prefilled email + notice) instead of silently failing, and a 401 on login links to `/register` — both deliberately avoid distinguishing "wrong password" from "no such account," since Cambium returns identical responses for both to prevent email enumeration
- Fixed a real StrictMode bug in `context.tsx`: the mount effect was double-invoked in dev, firing `/auth/refresh` twice and racing one cookie rotation against the other's revoke (symptom: login silently doing nothing after a logout). Fixed with a `hasMountedRef` guard; regression test added in `context.test.tsx` under `<StrictMode>`. Re-entrancy guards (`if (isSubmitting) return`) also added to both auth forms' submit handlers.
- Closed a coverage audit's findings: added unit tests for `auth.ts` (previously only covered indirectly through mocks), `NavContext` (collapse/persist, mirroring `ThemeProvider.test.tsx`), `ThemeToggle` (the one primitive without a test), and `AppNav` (Garden Profile/Quick Actions cards, log-out button, collapse behavior)
- Tests: full suite now 125 unit + 19 E2E, all passing against a live Cambium instance. `auth.spec.ts` covers register→logout→login, direct login to an existing account, wrong-password rejection, registering an already-taken email (with the "Log in instead" redirect), and the unauthenticated-redirect case.

**Not started:**
- All 16 domain API modules (`garden.ts`, `plants.ts`, `tasks.ts`, …) + `src/lib/types/rhizome.ts`
- `src/lib/api/stream.ts` — `consumeSSEStream`, `consumeNotificationStream` (needed for Phase 6c chat, Phase 7 notifications — not needed yet)

See [deferred-work.md](../development/deferred-work.md) for the full breakdown of what's deferred and why.

---

## Phases 5a–5e — Feature pages (parallel)

All require Phase 4 complete. No ordering between 5a–5e.

**5a Garden objects** — beds, containers, plants (list, detail, create, care)  
**5b Tasks** — 6 views, optimistic mutations, velocity strip ← highest priority  
**5c Projects** — planning mode, Gantt, Kanban (partial blockers: expenses #124, shopping #125, Gantt dependencies #121/#122)  
**5d Calendar** — drag-to-reschedule, month/week views (partial blocker: annotations #114)  
**5e Activity** — global feed with filtering and infinite scroll

---

## Phase 6 — Today, Incidents, Agent chat

**Blocked on:** rhizome#120 P1 — `TriageSnapshotView`, `WeatherSnapshotView`, `InteractionEnvelopeView`, `IncidentView`, `ThreadView` must land first.

**6a** Today page  
**6b** Incidents + treatment plans  
**6c** Agent chat with SSE streaming ← the user's milestone

---

## Phase 7 — Feature backfill

Each item is independent. Build in any order as backend issues close.

| Feature | Blocks on |
|---|---|
| Context search + pinned context | rhizome#126 + #127 |
| Care recording quick actions | rhizome#128 |
| Full Gantt dependency drag | rhizome#121 + #122 |
| Project expenses | rhizome#124 |
| Shopping list | rhizome#125 |
| Media gallery | rhizome#117 |
| Garden map | rhizome#118 |
| Calendar annotations | rhizome#114 |
| Notification drawer + toasts | rhizome#130 |
| Task series CRUD | rhizome#113 |

---

## Phase 8 — Polish + deploy

- Code splitting (`React.lazy` + `Suspense`)
- Accessibility audit
- Lighthouse baseline
- Self-hosted fonts
- Cambium static file handler (cambium#21)
- Deploy to spark-thor

---

## Dependency map

```
Phase 1 (scaffold)
  └── Phase 2 (tokens)
        └── Phase 3 (shell)
              └── Phase 4 (auth + API client)
                    ├── Phase 5a (garden objects)
                    ├── Phase 5b (tasks) ← priority
                    ├── Phase 5c (projects)
                    ├── Phase 5d (calendar)
                    └── Phase 5e (activity)
                          └── [wait for rhizome#120 P1]
                                ├── Phase 6a (today)
                                ├── Phase 6b (incidents)
                                └── Phase 6c (agent chat) ← the milestone
```
