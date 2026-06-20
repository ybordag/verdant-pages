# Deferred Work

**Last updated:** 2026-06-20

Things that are consciously incomplete right now — not bugs, not oversights. Each entry says what's missing, why it's not worth doing yet, and the concrete condition that should trigger picking it back up. Modeled on rhizome's and cambium's `DEFERRED_TESTS.md` convention: a deferral without a re-enable condition is just a TODO that never gets read again.

If you're auditing test coverage or docs completeness and find something not listed here, it's probably a real gap — file it as a task, don't assume it belongs in this doc.

---

### Unit tests for the 10 UI primitives

**What's deferred:** `Button`, `Input`, `Select`, `Textarea`, `Chip`, `FieldLabel`, `Modal`, `InlinePopover`, `StatusBadge`, `ProgressBar` have no dedicated test files. They're only exercised indirectly through `App.test.tsx` and E2E tests that happen to render pages using them.

**Why deferred:** Phase 3's goal was getting the shell and routing in place fast enough to unblock Phase 4+ page work, and the primitives' current consumers (nav, two sidebar cards) already have coverage at the integration level. Writing 10 sets of render+interaction tests for components with no real usage variety yet (no forms exist to exercise `Input` validation states, no list exists to exercise `Select`) would mostly test props that aren't proven correct against real usage.

**Re-enable when:** The first page that uses a given primitive in a real form or interaction (Phase 4's login/register screens for `Input`/`Button`; Phase 5a's plant creation wizard for `Select`/`Textarea`) is built. Add that primitive's tests alongside the page, written against its actual usage rather than speculative props. By the end of Phase 5a, all 10 should have tests — if any don't, that's a real gap, not a deferral anymore.

---

### `src/lib/api/`, `src/lib/auth/`, `src/lib/sse/`, `src/lib/query/`

**What's deferred:** All four directories are empty. No `apiFetch`, no `AuthContext`, no SSE consumer, no `QueryClient` setup exists yet, despite being fully specified in [api-client.md](../architecture/api-client.md), [auth.md](../architecture/auth.md), and [sse-streaming.md](../architecture/sse-streaming.md).

**Why deferred:** This is Phase 4 scope by design — see [build-phases.md](../architecture/build-phases.md). Building the API client before there's any page that consumes it would mean testing against assumptions instead of real call sites.

**Re-enable when:** Phase 4 starts. Not a soft target — this is the literal next phase after Phase 3 (current).

---

### Test coverage thresholds in Vitest

**What's deferred:** No `coverage` config (v8/istanbul) is set up in `vite.config.ts`. There's no CI gate preventing a coverage regression.

**Why deferred:** Coverage thresholds are only meaningful once there's a stable baseline of real feature code to measure against. Gating on coverage during Phase 1–3 (scaffold and shell) would mostly just penalize legitimate stub pages.

**Re-enable when:** Phase 4 lands with its own tests (auth, API client). At that point, set thresholds based on the actual achieved baseline rather than picking an arbitrary number — see [development/testing.md](testing.md).

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
