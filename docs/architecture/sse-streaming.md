# SSE And Agent Streaming

**Last verified:** 2026-07-10

## Why Fetch Streams

Cambium chat streams use POST bodies and authorization headers. Native `EventSource` supports neither requirement safely. Verdant uses `fetch`, `ReadableStream`, and an async generator in `src/lib/sse/stream.ts`.

Tokens remain in the `Authorization` header. Never put access tokens in stream URLs.

## Ownership

| Layer | Responsibility |
|---|---|
| `src/lib/sse/stream.ts` | Request, byte decoding, SSE frame parsing, abort behavior, normalized stream errors |
| `src/lib/api/chat.ts` | Thread-oriented chat and resume stream operations |
| `src/lib/api/notifications.ts` | Long-lived notification stream operation |
| Rhizome page/workbench | Optimistic messages, partial assistant state, interaction state, retry, and thread switching |

Event types are defined in `src/lib/types/cambium.ts`. Source and stream tests are authoritative; do not duplicate full event unions here.

## Chat Turn Lifecycle

```text
first send from /app/rhizome
  -> create thread
  -> save initial session context
  -> navigate to /app/rhizome/:threadId
  -> add one optimistic user message
  -> consume chat stream
  -> append tokens to one in-progress assistant message
  -> capture a structured interaction if emitted
  -> finalize on done
  -> reconcile with persisted history
```

Existing threads skip creation and stream directly after any required context update.

## Required Invariants

- Visiting `/app/rhizome` does not create a thread.
- One send produces one user message and at most one finalized assistant response.
- Thread/session context is persisted through the dedicated contract, not injected as fake user prose.
- Stream cancellation occurs on thread switch, unmount, or superseding work.
- A stale stream cannot append into the newly selected thread.
- Interaction resolution uses the resume stream rather than starting an unrelated chat turn.
- Reloaded history contains no empty bubbles, raw tool events, or `[object Object]` content.

## Failure Behavior

- Failure before useful output: show the attention row with explicit Retry.
- Failure after partial output: preserve the partial response, mark it incomplete, and offer retry/recovery without silently sending twice.
- Abort caused by navigation/unmount: do not show a user-facing connection error.
- Non-2xx response: surface a normalized API/stream error.
- Malformed protocol data: fail or skip according to the parser contract, but never render raw data as a message.

Chat does not automatically reconnect because replaying a turn may duplicate agent work. Notification streams may reconnect because they are read-only event subscriptions and reconcile from a snapshot.

## Testing

Transport unit tests cover framing across chunks, event ordering, errors, auth
headers, and abort. Rhizome hook/page tests cover optimistic deduplication,
partial failure, cancellation, thread switching, retry, interaction/resume, and
history rendering. Mocked browser tests cover the primary create/context/stream,
retry, navigation, review/resume, responsive shell, and Markdown paths.

A seeded live create -> context -> stream -> review/resume -> switch/reload flow
is still required before Phase 5 closes; mocked browser coverage does not prove
Cambium/Rhizome compatibility.
