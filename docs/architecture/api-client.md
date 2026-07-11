# API Client Architecture

**Last verified:** 2026-07-10

Verdant Pages calls Cambium only. Rhizome DTOs reach the browser through Cambium's versioned routes, but the frontend never calls Rhizome directly.

```text
React page or hook
  -> TanStack Query
  -> src/lib/api/<domain>.ts
  -> apiFetch or authenticated stream helper
  -> Cambium
```

The exported module catalog is in [api modules](api-modules.md). The exact request and response contracts are defined by Cambium's current API and verified by the colocated `src/lib/api/*.test.ts` files. Do not copy full DTO definitions into architecture docs.

## Ordinary Requests

`src/lib/api/client.ts` owns:

- `BASE`, from `VITE_CAMBIUM_URL` or the same origin;
- the in-memory access token;
- `ApiError` normalization;
- JSON request/response handling;
- a single refresh-and-retry attempt after a `401`;
- query-string serialization;
- network-failure reporting.

Domain modules must use `apiFetch` for ordinary JSON requests. React components must not call `fetch()` directly.

### Error behavior

- Successful empty responses return `undefined`.
- Other successful responses are parsed as JSON.
- A `401` triggers one refresh attempt, then retries the original request once.
- A failed refresh clears authentication and reports an `ApiError`.
- Other non-2xx responses throw `ApiError` with status and parsed body when available.
- Network failures are surfaced separately from HTTP failures so the shell can report connectivity state.

UI code should render user-meaningful feedback and must not expose raw backend objects, stack traces, or tool errors as normal content.

## Authentication

The access token is module-scoped memory. Cambium owns the httpOnly refresh cookie. It is never stored in local storage, session storage, or a URL.

`src/lib/auth/context.tsx` coordinates initial refresh, login, registration, logout, session loading, and proactive refresh. See [auth architecture](auth.md).

## Streaming Exception

Authenticated SSE uses `fetch` plus `ReadableStream` because chat requires a POST body and authorization headers. `EventSource` cannot satisfy that contract.

The streaming layer in `src/lib/sse/stream.ts` owns framing, decoding, abort handling, and event parsing. `src/lib/api/chat.ts` and `notifications.ts` expose domain-oriented stream functions.

Rules:

- accept and propagate an `AbortSignal`;
- stop work on route change, logout, or unmount;
- treat malformed frames as protocol failures according to the stream contract;
- prevent duplicate optimistic and persisted messages;
- resume interaction streams only through the dedicated resume operation.

See [SSE streaming](sse-streaming.md).

## Types

| File | Ownership |
|---|---|
| `src/lib/types/cambium.ts` | Gateway/auth/stream-facing DTOs |
| `src/lib/types/rhizome.ts` | Structured gardening-domain views proxied by Cambium |

Types are handwritten today. When a backend contract changes:

1. verify Rhizome's structured view and Cambium's exposed schema;
2. update the relevant frontend type;
3. update the domain client function;
4. update its request-shape test;
5. update consumers and page behavior tests;
6. update page or capability docs if user-visible behavior changed.

## TanStack Query

Use queries for server-owned reads and mutations for writes. Query keys should be arrays ordered from broad to specific:

```ts
['tasks']
['tasks', 'daily', params]
['tasks', taskId]
['threads', threadId, 'session-context']
```

After a mutation, invalidate the narrowest keys that can have changed. Use optimistic updates only when rollback and duplicate suppression are explicit and tested.

## Adding An Endpoint

1. Confirm the route exists in Cambium and is structured end to end.
2. Add or update DTOs in `src/lib/types/`.
3. Add the function to the matching `src/lib/api/<domain>.ts` module.
4. Add a colocated test for method, URL, query parameters, and body.
5. Consume it through TanStack Query in the page or hook.
6. Update [api modules](api-modules.md) if the module's capability changes.

If Cambium or Rhizome does not support the behavior, document the dependency and open the backend issue before adding a speculative frontend wrapper.

## Development Proxy

In local development, Vite proxies `/api` and `/auth` to Cambium at `http://localhost:8080`. Cambium health is checked at `http://localhost:8080/health`; `/health` is not an application API module.
