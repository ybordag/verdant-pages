# Deferred Work

**Last updated:** 2026-06-21

Things that are consciously incomplete right now — not bugs, not oversights. Each entry says what's missing, why it's not worth doing yet, and the concrete condition that should trigger picking it back up. Modeled on rhizome's and cambium's `DEFERRED_TESTS.md` convention: a deferral without a re-enable condition is just a TODO that never gets read again.

If you're auditing test coverage or docs completeness and find something not listed here, it's probably a real gap — file it as a task, don't assume it belongs in this doc.

---

### `src/lib/api/` endpoint-level deferrals

**What's deferred:** Auth core, SSE parsing, query retry/connectivity plumbing, and 15 of 16 domain modules are built and tested against the documented contract in [api-client.md](../architecture/api-client.md): `garden.ts`, `plants.ts`, `tasks.ts`, `calendar.ts`, `shopping.ts`, `search.ts`, `alerts.ts`, `notifications.ts`, `interactions.ts`, `chat.ts`, `triage.ts`, `weather.ts`, `incidents.ts`, `projects.ts`, and `activity.ts`. `src/lib/types/rhizome.ts` has the view/request types these modules need.

`triage.ts`/`weather.ts` were the last to land — rhizome#133 was independently verified (code review + a from-scratch happy-path test covering the actual point of the fix: resolving task IDs into full `TaskSummaryView` objects, which had zero coverage anywhere before) rather than trusted at face value, the same standard `#136`/`#138` got. `triage.ts` omits `getTriageRecommendations` — confirmed `GET /triage/recommendations` doesn't exist in Rhizome's `data_router`; the stale Cambium proxy has been removed, and `getLatestTriage()` is the structured replacement.

`src/lib/sse/stream.ts` (`consumeSSEStream`, `consumeNotificationStream`) is now also built — confirmed `chatStream`/`chatResumeStream` (Cambium) and `/agent/stream`/`/notifications/stream` (Rhizome) all emit the exact `data: {...}\n\n` framing the parser expects, by reading both sides directly rather than assuming the doc's spec matched reality. `chat.ts`'s `streamChat`/`streamResume` and `notifications.ts`'s `streamNotifications` are wired to it. Both functions and `consumeSSEStream`/`consumeNotificationStream` now also accept an optional `signal?: AbortSignal`, added after a coverage audit found there was previously no way to cancel an open stream client-side (route change, unmount, logout) — without it a long-lived stream (especially `consumeNotificationStream`, which has no terminal event) keeps running on a token that may no longer be valid.

**Live-verified (2026-06-21):** `consumeSSEStream`'s actual wire-parsing logic was checked against the real running Cambium → Rhizome stack with `google_genai` and `openai`. That pass found rhizome#141 (sync checkpointer wired into async streaming); the backend fix was later verified and the issue was closed. Streaming is no longer a Phase 4 blocker.

Unit-tested (fake `ReadableStream`, no live backend needed for these): token ordering, interaction events, malformed-line skipping, chunk-split-across-reads, non-2xx → `ApiError`, omitting the Authorization header instead of sending the literal string `"Bearer null"` when logged out (a real bug found and fixed in the same pass — `stream.ts` previously interpolated the token unconditionally, unlike `apiFetch`'s conditional pattern), a network drop mid-stream surfacing as a rejection rather than a silent stop, `AbortSignal`-driven cancellation mid-stream (simulates logout/unmount — rejects with `AbortError`, stops yielding further events), and that a stream already open keeps its original token through a token refresh while a *new* stream call afterward picks up the refreshed one.

**Still genuinely empty:** `media.ts` — blocked on rhizome#117. The media/image endpoints are not started server-side and are separate from the structured-JSON backlog.

**rhizome#135 closed (2026-06-21) — incidents/treatment-plan structured JSON.** `incidents.ts` built: full CRUD on incidents (`listIncidents`, `getIncident`, `createIncident`, `updateIncident`, `deleteIncident`, `resolveIncident`) plus treatment plans (`getIncidentTreatment`, `createManualTreatmentPlan`, `updateTreatmentPlan`, `deleteTreatmentPlan`, `approveTreatmentPlan`) and `getIncidentActivity`. Also added `draftTreatmentPlan(id, threadId): Promise<ChatResponse>` — confirmed via `cambium/internal/api/triggers.go` that `POST /api/v1/incidents/{id}/treatment` is a distinct AI-trigger handler (`triggerTreatmentDraft`, calls `h.rhizome.RunAgent(...)` with a synthesized message and returns a `ChatResponse`), not a plain CRUD proxy — same pattern as `triage.ts`'s `runTriage`. New types added to `rhizome.ts`: `IncidentView`, `IncidentDetailView`, `IncidentSubjectView`, `TreatmentPlanView`, plus the matching request types. Typecheck clean, 15 new tests, full suite at 300/300.

**rhizome#140 closed (2026-06-21) — garden/plants/tasks CRUD writes + remaining activity feeds.** This unblocked almost everything that was previously omitted. Now built, code-reviewed, test-verified (50 new rhizome tests + the full 798-test suite), and live-curled against a running instance:
- `garden.ts`: `updateGardenProfile`, `updateBed`, `createContainer`, `updateContainer`, `getBedActivity`, `getContainerActivity`
- `plants.ts`: `getPlant` (was already structured from earlier #116 work, just never wired), `createPlant`, `updatePlant`, `createPlantBatch`, `batchUpdatePlants`, `getPlantActivity`, `getBatchActivity`
- `tasks.ts`: `updateTask`, `getTaskActivity`, `updateTaskSeries`

`ActivityEventView`/`ActivitySubjectView`/`PlantBatchResultView` added to `rhizome.ts`; several existing request types (`CreateContainerRequest`, `CreatePlantRequest`, `UpdateTaskRequest`, `UpdateTaskSeriesRequest`) were also corrected against the actual rhizome tool signatures while wiring these — a couple of fields were missing or wrongly marked optional/required.

**Intentionally absent:**
- `triage.ts`: no `getTriageRecommendations` by design; use `getLatestTriage()` for structured grouped recommendations

`projects.ts` is built against the structured routes from rhizome#137, including briefs, proposals, progress, task graph, expenses, shopping, assignments, and `GET /projects/{id}/activity`. Assignment endpoints still return Rhizome's `{"result": "<string>"}` envelope because Cambium proxies the existing tool result; the wrappers expose that envelope explicitly as `ResultResponse` rather than pretending those calls are `void`.

`tasks.ts` now includes `listTasksBlocked` — Rhizome's `GET /tasks/blocked` returns `TaskSummaryView[]` with `blocked: true`.
`plants.ts` now includes `batchRemovePlants` — Rhizome's `PATCH /garden/plants/batch/remove` returns `PlantSummaryView[]` for the plants actually marked `removed`.

**Why deferred:** This was a deliberate scope split within Phase 4 — auth core first and verified working end-to-end, domain modules as a follow-up. Within that follow-up, modules were split further by actual backend readiness (verified per-endpoint, not per-module) rather than built all-or-nothing against a spec that assumed full backend support.

**Re-enable when:** `media.ts` once rhizome#117 lands. `getTriageRecommendations` is no longer deferred — the old proxy is removed from the contract, and `getLatestTriage()` is the supported structured path.

---

### Test coverage thresholds in Vitest

**What's deferred:** No `coverage` config (v8/istanbul) is set up in `vite.config.ts`. There's no CI gate preventing a coverage regression.

**Why deferred:** Coverage thresholds are only meaningful once there's a stable baseline of real feature code to measure against. Gating on coverage during Phase 1–3 (scaffold and shell) would mostly just penalize legitimate stub pages.

**Re-enable when:** Phase 4 lands with its own tests (auth, API client) — this has now happened (125 unit + 19 E2E, including a full audit pass that closed gaps in `auth.ts`, `NavContext`, `ThemeToggle`, and `AppNav`). Still no `@vitest/coverage-v8` wired into `vite.config.ts`'s `test` block, and no CI to gate on it (CI itself is also on hold — see project notes). Worth adding the coverage tool itself now to get visibility, but hold off on enforcing a threshold until CI exists to enforce it against.

---

### `NotificationDrawer` and `Toast` real implementations

**What's deferred:** Both components render empty shells. `NotificationDrawer` opens/closes but shows no content; `Toast` accepts a `toasts` array but nothing ever populates it.

**Why deferred:** Both depend on the notification SSE stream (`consumeNotificationStream`), which depends on Cambium's notification endpoint. That backend dependency (rhizome#130) closed on 2026-06-21 — the remaining work is purely sequencing: building the UI shell now (done in Phase 3) and wiring it later avoids redoing layout work, but the wiring itself is scheduled for Phase 8, not blocked on anything anymore.

**Re-enable when:** Phase 8 starts. Tracked in [roadmap/overview.md](../roadmap/overview.md) under Phase 8 — "Notifications."

---

### Offline banner + retry-visibility toasts — done (2026-06-21)

Built: `src/lib/toast/toastStore.ts` (generic module-level toast store, not tied to notifications — `pushToast`/`dismissToast`/`subscribeToasts`), `src/lib/connectivity/connectivity.ts` (`reportNetworkFailure`/`reportNetworkSuccess`/`useConnectivity`, three-consecutive-failure heuristic + native `online`/`offline` events), `src/components/shell/OfflineBanner/`, and `src/lib/query/queryClient.ts` (custom `retry`: never retries `ApiError`, retries a raw network failure up to 3x with a toast per attempt). All mounted in `AppShell`/`App.tsx`. This also retires the "`lib/query/` still EMPTY" note in `CLAUDE.md` — it now holds the query client config.

### SSE manual-retry UI, notification-stream auto-reconnect, 409 query invalidation

**What's deferred:** [error-handling.md](error-handling.md) specifies behavior for SSE connection-failure-before-first-event (manual retry button), notification-stream auto-reconnect with backoff, and 409 conflicts (toast + query invalidation) — none of this exists yet.

**Why deferred:** The SSE manual-retry button needs a chat UI to attach it to — Agent chat is part of Phase 5, not started yet; the contract is already spec'd in [pages/05-agent.md](../pages/05-agent.md)'s "Connection handling" section so it's settled before that build starts. Notification-stream auto-reconnect is scheduled alongside the rest of the notification drawer in Phase 8 (rhizome#130, its only real dependency, is closed — this is purely a sequencing deferral now). 409 invalidation needs a real mutation flow wired to the UI to invalidate against, which doesn't exist until later phases build out real forms.

**Re-enable when:** SSE retry UI + 409 invalidation: as Phase 5/6/7 pages get built and have real mutation flows to attach to. Notification auto-reconnect: Phase 8.

---

### Page-level component tests (all 27 page stubs)

**What's deferred:** Every page under `src/pages/` is a 3-line stub (`<div className="pi">PageName</div>`) with no tests beyond the E2E smoke test confirming the app loads.

**Why deferred:** There's nothing to test yet — no data fetching, no forms, no interactions. Writing tests against a placeholder div would just be testing that the placeholder div exists.

**Re-enable when:** Each page gets built out in its respective phase (5–8 per [roadmap/overview.md](../roadmap/overview.md)). Test it then, against real behavior — not before.
