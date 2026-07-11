# Error Handling

**Last verified:** 2026-07-10

Errors should tell the user what happened, whether their action was saved, and what they can do next. Raw backend bodies, stack traces, tool output, and provider errors are never normal UI content.

## HTTP Errors

`apiFetch` throws `ApiError` for non-successful HTTP responses.

| Status | Client behavior | UI behavior |
|---|---|---|
| `401` | Refresh once and retry once; clear auth if refresh fails | Route returns to login without an error loop |
| `403` | No retry | Explain that the action is unavailable/not permitted |
| `404` | No retry | Detail route shows a not-found state; stale list references are reconciled |
| `400` / `422` | No retry | Show actionable validation near the relevant fields |
| `409` | No blind retry | Explain conflict and refresh/invalidate affected server state |
| `5xx` | No automatic write retry | Preserve user input and offer a safe retry where appropriate |

Generic failure copy should not reveal internal service topology unless the user is in a development-only diagnostic surface.

## Network Failure

Network failures are not `ApiError` responses. `apiFetch` reports them to the connectivity store, and TanStack Query may retry safe reads according to query-client policy. Mutations are not blindly retried because the server may have applied the write before the connection dropped.

The shell offline banner appears after reliable browser-offline state or repeated request failures. Recovery clears the banner and may invalidate stale reads.

## Form And Mutation Rules

- Validate deterministic constraints locally.
- Preserve entered values after recoverable errors.
- Disable duplicate submission while a mutation is pending.
- Optimistic updates require rollback and eventual server reconciliation.
- Destructive failures leave the object visible unless deletion is confirmed.
- Use inline feedback for field errors; use toasts for cross-page outcomes, not routine validation.

## Stream Failures

Chat uses explicit retry and duplicate suppression. Notification streams may reconnect with snapshot reconciliation. See [SSE streaming](../architecture/sse-streaming.md) and [notifications](../architecture/notifications.md).

An abort caused by navigation, thread switching, or unmount is expected control flow and should not create an error banner.

## Page States

Every implemented data page should distinguish:

- loading;
- empty;
- filtered-empty;
- not found;
- validation error;
- offline/network failure;
- service failure;
- stale/conflicting update;
- successful retry.

Do not collapse these into a blank screen or one generic “something went wrong” state when the user can take a specific action.

## Logging And Diagnostics

User-facing copy stays concise. Development logs may include normalized status, route, and correlation/telemetry identifiers but must not include access tokens, provider keys, passwords, or unredacted secrets.

When a failure crosses services, inspect Cambium and Rhizome logs/telemetry before compensating in the frontend. Verdant should not hide a backend contract defect with prose parsing or guessed state.
