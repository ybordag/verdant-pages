# Deferred Work

**Last updated:** 2026-06-20

Things that are consciously incomplete right now — not bugs, not oversights. Each entry says what's missing, why it's not worth doing yet, and the concrete condition that should trigger picking it back up. Modeled on rhizome's and cambium's `DEFERRED_TESTS.md` convention: a deferral without a re-enable condition is just a TODO that never gets read again.

If you're auditing test coverage or docs completeness and find something not listed here, it's probably a real gap — file it as a task, don't assume it belongs in this doc.

---

### `src/lib/api/` domain modules, `src/lib/sse/`, `src/lib/query/` tuning

**What's deferred:** Auth core is done (see the previous entry's history). As of 2026-06-21, 12 of 16 domain modules are also built and tested against the documented contract in [api-client.md](../architecture/api-client.md): `garden.ts`, `plants.ts`, `tasks.ts`, `calendar.ts`, `shopping.ts`, `search.ts`, `alerts.ts`, `notifications.ts`, `interactions.ts`, `chat.ts`, `triage.ts`, `weather.ts`. `src/lib/types/rhizome.ts` now exists with the view/request types these modules need.

`triage.ts`/`weather.ts` were the last to land — rhizome#133 was independently verified (code review + a from-scratch happy-path test covering the actual point of the fix: resolving task IDs into full `TaskSummaryView` objects, which had zero coverage anywhere before) rather than trusted at face value, the same standard `#136`/`#138` got. `triage.ts` omits `getTriageRecommendations` — confirmed `GET /triage/recommendations` doesn't exist anywhere in Rhizome's `data_router`; Cambium's `routes.go` still proxies to it (a dead route that will always 404), separate finding, not filed as its own issue since it's cheap to just not call.

`src/lib/sse/stream.ts` (`consumeSSEStream`, `consumeNotificationStream`) is now also built — confirmed `chatStream`/`chatResumeStream` (Cambium) and `/agent/stream`/`/notifications/stream` (Rhizome) all emit the exact `data: {...}\n\n` framing the parser expects, by reading both sides directly rather than assuming the doc's spec matched reality. `chat.ts`'s `streamChat`/`streamResume` and `notifications.ts`'s `streamNotifications` are wired to it. Both functions and `consumeSSEStream`/`consumeNotificationStream` now also accept an optional `signal?: AbortSignal`, added after a coverage audit found there was previously no way to cancel an open stream client-side (route change, unmount, logout) — without it a long-lived stream (especially `consumeNotificationStream`, which has no terminal event) keeps running on a token that may no longer be valid.

**Live-verified (2026-06-21):** ran `consumeSSEStream`'s actual wire-parsing logic against the real running Cambium → Rhizome stack (not mocked) with two throwaway users — one on the default `google_genai` provider, one explicitly `PATCH /auth/profile`'d to `openai`. **Both failed identically** — found a real backend bug, not a frontend issue: Rhizome's `agent/core/graph.py` wires the LangGraph checkpointer with the sync-only `PostgresSaver`/`SqliteSaver`, but the streaming endpoints call `agent.astream_events(...)`, which needs the checkpointer's async interface; the sync savers raise `NotImplementedError` on `aget_tuple` before any LLM call happens. Non-streaming `/api/v1/chat` against the same thread worked fine (proves it's specifically the async-checkpointer gap, not auth/provider/thread setup). Filed as [rhizome#141](https://github.com/ybordag/rhizome/issues/141) with root cause, repro, and fix sketch (swap to `AsyncPostgresSaver`/`AsyncSqliteSaver`, already available with no new dependency — but `agent` is a module-level singleton built at import time with sync `setup()`, so the fix needs a FastAPI-lifespan-based async init, not a one-line swap).

Unit-tested (fake `ReadableStream`, no live backend needed for these): token ordering, interaction events, malformed-line skipping, chunk-split-across-reads, non-2xx → `ApiError`, omitting the Authorization header instead of sending the literal string `"Bearer null"` when logged out (a real bug found and fixed in the same pass — `stream.ts` previously interpolated the token unconditionally, unlike `apiFetch`'s conditional pattern), a network drop mid-stream surfacing as a rejection rather than a silent stop, `AbortSignal`-driven cancellation mid-stream (simulates logout/unmount — rejects with `AbortError`, stops yielding further events), and that a stream already open keeps its original token through a token refresh while a *new* stream call afterward picks up the refreshed one. **Still not coverable here:** the actual live token-stream content (real provider output, mid-turn interaction pauses) — blocked until rhizome#141 closes, since right now every live streaming call fails before any LLM call happens.

**Still genuinely empty:** `projects.ts`, `incidents.ts`, `activity.ts`, `media.ts` — blocked on rhizome backend work (see below).

**Functions intentionally omitted from the 12 "done" modules** (the backend endpoint still returns `{"result": "<string>"}` instead of structured JSON, confirmed by reading `agent/api/routers.py` directly — not by trusting a closed-issue label):
- `garden.ts`: `updateGardenProfile`, `updateBed`, `createContainer`, `updateContainer`
- `plants.ts`: `getPlant`, `createPlant`, `updatePlant`, `createPlantBatch`, `getPlantActivity`
- `tasks.ts`: `listTasksBlocked`, `updateTask`, `getTaskActivity`, `updateTaskSeries`
- `triage.ts`: `getTriageRecommendations` (route doesn't exist server-side at all, not a string-wrap issue)

Tracked in a rhizome issue for the garden/plants/tasks create+update gap (filed by the project owner directly, not by Claude — confirm the issue number before linking it here). These omissions don't block the rest of each module; everything else in each file is real and safe to use.

**Why deferred:** This was a deliberate scope split within Phase 4 — auth core first and verified working end-to-end, domain modules as a follow-up. Within that follow-up, modules were split further by actual backend readiness (verified per-endpoint, not per-module) rather than built all-or-nothing against a spec that assumed full backend support.

**Re-enable when:** `incidents.ts`/`activity.ts`/`projects.ts` once rhizome#134/#135/#137 land; the omitted create/update functions above once the garden/plants/tasks write-endpoint gap is fixed; `media.ts` once rhizome#117 lands (not started at all, separate from the structured-JSON backlog).

---

### Test coverage thresholds in Vitest

**What's deferred:** No `coverage` config (v8/istanbul) is set up in `vite.config.ts`. There's no CI gate preventing a coverage regression.

**Why deferred:** Coverage thresholds are only meaningful once there's a stable baseline of real feature code to measure against. Gating on coverage during Phase 1–3 (scaffold and shell) would mostly just penalize legitimate stub pages.

**Re-enable when:** Phase 4 lands with its own tests (auth, API client) — this has now happened (125 unit + 19 E2E, including a full audit pass that closed gaps in `auth.ts`, `NavContext`, `ThemeToggle`, and `AppNav`). Still no `@vitest/coverage-v8` wired into `vite.config.ts`'s `test` block, and no CI to gate on it (CI itself is also on hold — see project notes). Worth adding the coverage tool itself now to get visibility, but hold off on enforcing a threshold until CI exists to enforce it against.

---

### `NotificationDrawer` and `Toast` real implementations

**What's deferred:** Both components render empty shells. `NotificationDrawer` opens/closes but shows no content; `Toast` accepts a `toasts` array but nothing ever populates it.

**Why deferred:** Both depend on the notification SSE stream (`consumeNotificationStream`), which depends on Cambium's notification endpoint, which is blocked on [rhizome#130](https://github.com/ybordag/rhizome/issues/130). Building the UI shell now (done in Phase 3) and wiring it later avoids redoing layout work, but the wiring itself can't happen until the backend exists.

**Re-enable when:** rhizome#130 ships. Tracked as Phase 7 in [roadmap/overview.md](../roadmap/overview.md) — "Notification drawer + toasts."

---

### Offline banner, SSE manual-retry UI, 409 query invalidation

**What's deferred:** [error-handling.md](error-handling.md) specifies behavior for network failure (offline banner), SSE connection-failure-before-first-event (manual retry button), and 409 conflicts (toast + query invalidation) — but none of this UI exists yet, because nothing in the app makes a real network call yet.

**Why deferred:** Same root cause as the empty `lib/` directories — these are Phase 4+ behaviors that can't be built (or meaningfully tested) before `apiFetch` and TanStack Query are wired up.

**Re-enable when:** Phase 4, alongside the API client itself. The spec in error-handling.md is meant to be implemented as part of that phase, not bolted on after.

---

### Page-level component tests (all 27 page stubs)

**What's deferred:** Every page under `src/pages/` is a 3-line stub (`<div className="pi">PageName</div>`) with no tests beyond the E2E smoke test confirming the app loads.

**Why deferred:** There's nothing to test yet — no data fetching, no forms, no interactions. Writing tests against a placeholder div would just be testing that the placeholder div exists.

**Re-enable when:** Each page gets built out in its respective phase (5a–6c per [roadmap/overview.md](../roadmap/overview.md)). Test it then, against real behavior — not before.
