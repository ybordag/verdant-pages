# Notifications

**Last verified:** 2026-07-10

## Current State

The backend and client foundation exists:

- notification snapshot API wrapper;
- authenticated notification stream wrapper;
- alert list/dismiss API;
- pending/recent interaction APIs;
- shell bell and `NotificationDrawer` shell;
- generic toast store/host;
- offline connectivity banner.

The notification drawer is not yet a complete product surface: it does not currently coordinate the stream into persistent alert, interaction, and job-progress content. That work is sequenced for Phase 9. Rhizome's workbench already has its own first-pass review panel; do not confuse that page-local workflow with the global notification drawer.

See [capabilities](../capabilities.md) and [current status](../status/current.md).

## Intended Responsibilities

The global notification experience should combine:

1. **Pending reviews**: structured interactions requiring a decision.
2. **Alerts**: monitor-generated signals with severity, subject links, and dismissal.
3. **Background progress**: active/completed jobs when the stream exposes them.

The bell badge must use real backend state, never placeholder counts.

## Data Flow

```text
App mount or reconnect
  -> GET notification snapshot
  -> open authenticated notification stream
  -> merge events into a user-scoped notification store
  -> update bell, drawer sections, and selected toasts
```

On reconnection, fetch a new snapshot before reopening the stream so events missed during sleep/offline periods are reconciled. Do not rely on an in-memory event queue as durable history.

## Interaction Rules

- Clicking a review opens the appropriate structured review workflow.
- Clicking an alert opens its subject/incident/context when available.
- Dismiss actions update the backend and invalidate the snapshot.
- High-value completions may emit a toast; routine stream events should not create noise.
- The drawer must render loading, empty, error, reconnecting, and populated states.
- Narrow layouts may use an overlay, but focus and close/reopen behavior must remain predictable.

## Reconnection

The notification stream is long-lived and may reconnect automatically with bounded exponential backoff. Chat streams are different: they represent a single user turn and use explicit retry to avoid silently duplicating writes.

## Security

- Streams use authorization headers, never query-string tokens.
- Notification state is user-scoped by Cambium authentication.
- Do not render raw backend errors or untrusted HTML.
- Clear in-memory notification state on logout.

## Completion Criteria

Phase 9 should provide:

- snapshot plus reconnecting stream integration;
- accurate bell counts;
- pending review, alert, and job sections supported by actual events;
- dismissal/navigation behavior;
- keyboard/focus support;
- deterministic mocked tests and a controlled live reconnect smoke.
