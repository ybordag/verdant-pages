# Error Handling

**Last updated:** 2026-06-21

How the frontend responds to every failure mode it can encounter — API errors, network failures, and SSE stream drops. Originally written before Phase 4 wired up `apiFetch`; now maintained as the contract for Phase 4's API client and later page-level flows.

---

## API error scenarios

Every non-2xx response from Cambium goes through `apiFetch` (see [api-client.md](../architecture/api-client.md)), which throws an `ApiError(status, body)`. This table is the contract for what happens next, by status code.

| Status | Meaning | `apiFetch` behavior | UI behavior |
|---|---|---|---|
| 401 | Access token expired or invalid | Attempt `POST /auth/refresh` once → retry original request. If refresh also fails, clear in-memory token and `window.location.replace('/login')`. | None — the redirect happens before any component renders an error. |
| 403 | Authenticated but not permitted | Throws `ApiError(403, body)`, no retry. | Inline error message: "You don't have permission to do that." Single-user system today, so this should be rare — mostly a defensive case for future multi-tenancy. |
| 404 | Resource not found | Throws `ApiError(404, body)`, no retry. | Page-level: render a "Not found" state instead of the detail view (e.g. a deleted plant navigated to via a stale link). List-level: silently exclude (the list endpoint already wouldn't return it). |
| 400 / 422 | Validation error | Throws `ApiError(status, body)`, no retry. `body` carries field-level errors from Cambium. | Form-level: map `body` fields to the relevant `Input`/`Select` and show inline validation messages. Never a toast for validation errors — they're actionable, not informational. |
| 409 | Conflict (e.g. duplicate name, stale optimistic update) | Throws `ApiError(409, body)`, no retry. | Toast: "That changed elsewhere — refreshing." Then invalidate the relevant TanStack Query key so the UI reloads current state. |
| 5xx | Cambium or Rhizome failure | Throws `ApiError(status, body)`, no retry. | Toast: "Something went wrong on our end." `ApiError` is never retried by the query client (see below) — it surfaces immediately, no backoff delay. |

**Rule:** components never construct their own error copy from `err.body` for 401/5xx — those are generic by design (the user can't act on a 500). 400/422 is the one case where `err.body` content reaches the UI, because those errors are specifically about what the user typed.

---

## Network failure (offline / DNS / connection refused)

`fetch()` rejects (not a 4xx/5xx response — it never got one) when the network is down or Cambium is unreachable.

- `apiFetch` doesn't swallow this — the raw `TypeError` from `fetch` still propagates, not an `ApiError` — but it does report the failure to `src/lib/connectivity/connectivity.ts` (`reportNetworkFailure()`/`reportNetworkSuccess()`) before rethrowing/returning, so connectivity state is tracked regardless of how a caller handles the rejection.
- Components should check `error instanceof ApiError` to branch on API errors; anything else (including this case) falls through to a generic "Connection lost" state.
- The query client's `retry` (`src/lib/query/queryClient.ts`) never retries an `ApiError` (see the 5xx row above) but retries a raw network failure up to 3 times, pushing a toast ("Retrying… (n/3)") on each attempt so a retry-in-progress is visible instead of the UI looking frozen. Mutations keep TanStack's default of no retry — unchanged, since blindly re-firing a write isn't safe.
- The nav shell (`AppShell` → `OfflineBanner`) shows a persistent banner ("You're offline — changes won't save") once three consecutive requests fail with a non-`ApiError`, or immediately on the browser's native `offline` event — `navigator.onLine` going false is the more reliable signal in practice (e.g. airplane mode), the failure-counter is the fallback for cases where the browser doesn't notice (Cambium reachable on the network but not responding). A toast fires on each offline/online transition.

---

## SSE stream failures

SSE consumption (`consumeSSEStream`, `consumeNotificationStream` — see [sse-streaming.md](../architecture/sse-streaming.md)) has two distinct failure shapes:

**1. Connection never opens / drops before any event.**
`fetch()` for the stream either rejects or returns a non-2xx `res`. The async generator throws before yielding anything. The calling component (chat composer, notification drawer) catches this and shows: "Connection failed — try again" with a manual retry button. No auto-retry for chat — resubmitting a half-sent message silently would be worse than asking the user to re-trigger it.

**2. Connection drops mid-stream (after some tokens/events already yielded).**
The `reader.read()` loop simply ends (`done: true`) without ever seeing a `{ type: 'done' }` event. From the consumer's side this is indistinguishable from a clean close unless the caller tracks whether `done` was seen. **Rule:** every consumer of `consumeSSEStream` must track a local `sawDone` flag; if the generator returns without setting it, treat the stream as having dropped — append "⚠ response may be incomplete" to the chat message rather than treating partial tokens as the full answer.

**3. Malformed event (unparseable JSON after `data: `).**
Per the implementation in [api-client.md](../architecture/api-client.md), malformed lines are silently skipped (`catch { /* malformed — skip */ }`). This is intentional — a single garbled line shouldn't kill the whole stream — but it means a malformed `done` event would cause case 2's behavior. Acceptable trade-off; not worth instrumenting further until it's observed in practice.

**4. Notification stream specifically** (`consumeNotificationStream`, no `done` event ever sent — it's long-lived) *should* reconnect automatically on drop with exponential backoff (1s, 2s, 4s, capped at 30s) — silent reconnection is correct here, since losing a few seconds of notifications is low-stakes, unlike losing part of an agent response. **Not built yet** — `stream.ts` today is a single `fetch` + read loop with no reconnect logic at all. This is the spec for when it gets wired up in Phase 8; the backend notification dependency is closed, so this is sequencing work rather than a blocker.

---

## What's deliberately not handled yet

See [deferred-work.md](deferred-work.md) for the full list with rationale. Still outstanding: the SSE manual-retry button (no chat UI exists yet to attach it to — contract specified in [pages/05-agent.md](../pages/05-agent.md)), notification-stream auto-reconnect (item 4 above, scheduled with notification UI wiring in Phase 8), and 409-triggered query invalidation. The offline banner and retry-visibility toasts described above **are** built (2026-06-21) — `src/lib/connectivity/connectivity.ts`, `src/lib/toast/toastStore.ts`, `src/lib/query/queryClient.ts`.
