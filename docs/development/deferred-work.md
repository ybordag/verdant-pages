# Deferred Work

**Last updated:** 2026-06-20

Things that are consciously incomplete right now — not bugs, not oversights. Each entry says what's missing, why it's not worth doing yet, and the concrete condition that should trigger picking it back up. Modeled on rhizome's and cambium's `DEFERRED_TESTS.md` convention: a deferral without a re-enable condition is just a TODO that never gets read again.

If you're auditing test coverage or docs completeness and find something not listed here, it's probably a real gap — file it as a task, don't assume it belongs in this doc.

---

### `src/lib/api/` domain modules, `src/lib/sse/`, `src/lib/query/` tuning

**What's deferred:** Auth is done — `src/lib/api/client.ts` (`apiFetch`, `ApiError`, in-memory token, 401→refresh→retry), `src/lib/api/auth.ts` (`login`, `register`, `logout`, `tryRefreshToken`, `getSession`), and `src/lib/auth/context.tsx` (`AuthProvider`, `useAuth`, proactive refresh) are all built and tested against a real Cambium instance. `ProtectedRoute` does a real check. `LoginPage`/`RegisterPage` call the real API and handle 401/409 inline. `QueryClientProvider` is wired into `App.tsx` with default options.

Still empty: the 16 domain modules (`garden.ts`, `plants.ts`, `tasks.ts`, `projects.ts`, `chat.ts`, `triage.ts`, `weather.ts`, `incidents.ts`, `interactions.ts`, `activity.ts`, `alerts.ts`, `notifications.ts`, `shopping.ts`, `search.ts`, `calendar.ts`, `media.ts`) and `src/lib/types/rhizome.ts` — only `src/lib/types/cambium.ts`'s auth types (`TokenResponse`, `SessionResponse`) exist so far. `src/lib/api/stream.ts` (`consumeSSEStream`, `consumeNotificationStream`) is also unbuilt — not needed until chat (Phase 6c) or notifications (Phase 7).

**Why deferred:** This was a deliberate scope split within Phase 4 — auth core first and verified working end-to-end, domain modules as a follow-up, since the domain modules are large in count but mechanical (signatures fully specified in [api-client.md](../architecture/api-client.md)) and don't block verifying the auth plumbing.

**Re-enable when:** Starting the Phase 5 feature pages — each domain module gets built (or the relevant subset does) as the page that needs it gets built, rather than all 16 up front with no caller.

---

### Test coverage thresholds in Vitest

**What's deferred:** No `coverage` config (v8/istanbul) is set up in `vite.config.ts`. There's no CI gate preventing a coverage regression.

**Why deferred:** Coverage thresholds are only meaningful once there's a stable baseline of real feature code to measure against. Gating on coverage during Phase 1–3 (scaffold and shell) would mostly just penalize legitimate stub pages.

**Re-enable when:** Phase 4 lands with its own tests (auth, API client) — this has now happened (125 unit + 19 E2E, including a full audit pass that closed gaps in `auth.ts`, `NavContext`, `ThemeToggle`, and `AppNav`). Still no `@vitest/coverage-v8` wired into `vite.config.ts`'s `test` block, and no CI to gate on it (CI itself is also on hold — see project notes). Worth adding the coverage tool itself now to get visibility, but hold off on enforcing a threshold until CI exists to enforce it against.

---

### `NotificationDrawer` and `Toast` real implementations

**What's deferred:** Both components render empty shells. `NotificationDrawer` opens/closes but shows no content; `Toast` accepts a `toasts` array but nothing ever populates it.

**Why deferred:** Both depend on the notification SSE stream (`consumeNotificationStream`), which depends on Cambium's notification endpoint, which is blocked on [rhizome#130](https://github.com/ybordag/rhizome/issues/130). Building the UI shell now (done in Phase 3) and wiring it later avoids redoing layout work, but the wiring itself can't happen until the backend exists.

**Re-enable when:** rhizome#130 ships. Tracked as Phase 7 in [build-phases.md](../architecture/build-phases.md) — "Notification drawer + toasts."

---

### Offline banner, SSE manual-retry UI, 409 query invalidation

**What's deferred:** [error-handling.md](error-handling.md) specifies behavior for network failure (offline banner), SSE connection-failure-before-first-event (manual retry button), and 409 conflicts (toast + query invalidation) — but none of this UI exists yet, because nothing in the app makes a real network call yet.

**Why deferred:** Same root cause as the empty `lib/` directories — these are Phase 4+ behaviors that can't be built (or meaningfully tested) before `apiFetch` and TanStack Query are wired up.

**Re-enable when:** Phase 4, alongside the API client itself. The spec in error-handling.md is meant to be implemented as part of that phase, not bolted on after.

---

### Page-level component tests (all 27 page stubs)

**What's deferred:** Every page under `src/pages/` is a 3-line stub (`<div className="pi">PageName</div>`) with no tests beyond the E2E smoke test confirming the app loads.

**Why deferred:** There's nothing to test yet — no data fetching, no forms, no interactions. Writing tests against a placeholder div would just be testing that the placeholder div exists.

**Re-enable when:** Each page gets built out in its respective phase (5a–6c per [build-phases.md](../architecture/build-phases.md)). Test it then, against real behavior — not before.
