# Notifications

**Last updated:** 2026-06-20

## Overview

A real-time notification system surfaced as a bell icon in the nav sidebar. Covers background job progress, new monitor alerts, and pending interactions requiring approval. Built on SSE — the same `fetch + ReadableStream` infrastructure as the chat stream.

---

## Nav bell icon

Always visible in `AppNav`. Shows a badge count: total of unread alerts + pending interactions. Clicking opens the notification panel.

Badge counts come from:
- `alerts` array length from the last sync or stream event
- `pending_interactions` count from the last sync or stream event

---

## Notification panel

Slides in from the right (or as a dropdown from the bell icon). Three sections:

### In Progress

Background jobs currently running. Each job shows its title and a subtask tree:

```
🔄 Daily triage
   ✅ Loading garden state
   ✅ Checking weather impacts
   🔄 Scoring tasks...
```

Subtask steps arrive via `job_step` stream events. Completed steps render with a checkmark. The job collapses to a single "Done" entry on `job_complete`.

### Pending Approval

All pending interactions — approval cards waiting for the user. Each item: title, interaction type, "Review →" link. Clicking navigates to:
- Weather/task change reviews → Rhizome chat (interaction panel)
- Proposal reviews → Projects page
- Treatment plan approvals → Incident detail page

### Alerts

Current `MonitorAlert` records. Each: severity icon, title, body. "Dismiss" button calls `POST /api/v1/alerts/{id}/dismiss`. Alerts expire automatically (`expires_at` field).

---

## SSE connection lifecycle

```
App mount
  └─ GET /api/v1/notifications (sync — get current state)
  └─ Open SSE stream → GET /api/v1/notifications/stream
       └─ Receive events → update notification panel + badge count

Stream drops (network, tab sleep)
  └─ Reconnect: GET /api/v1/notifications?since=ISO_TIMESTAMP
  └─ Reopen SSE stream

Tab regains focus after >60s background
  └─ GET /api/v1/notifications (re-sync)
  └─ SSE stream resumes or reopens
```

The HTTP sync call is made at exactly two moments — mount and reconnection. It is not polled on a timer.

---

## Event types

| Type | When emitted | Payload |
|---|---|---|
| `heartbeat` | Every 30s (keep-alive) | — |
| `alert` | New `MonitorAlert` created | `{ id, alert_type, severity, title, body }` |
| `interaction_pending` | New `InteractionRecord` created | `{ id, title, interaction_type }` |
| `job_started` | Background job begins | `{ job_id, title }` |
| `job_step` | Step within a job completes or starts | `{ job_id, step, status: "running\|done" }` |
| `job_complete` | Job finishes successfully | `{ job_id, title, summary }` |
| `job_failed` | Job fails | `{ job_id, title, error }` |

---

## Toast notifications

For immediate real-time feedback while the user is actively working on a page, `job_complete` and high-severity `alert` events also render a **toast** — a small notification that appears in the bottom-right corner, auto-dismisses after 4 seconds, and can be manually dismissed. Clicking a toast navigates to the relevant page.

Toasts are ephemeral — they don't persist in the notification panel. The panel is the persistent record.

---

## Backend architecture

### Per-user event queue

```python
# Module-level dict: user_id → asyncio.Queue
_user_queues: dict[str, asyncio.Queue] = {}

def get_or_create_user_queue(user_id: str) -> asyncio.Queue:
    if user_id not in _user_queues:
        _user_queues[user_id] = asyncio.Queue(maxsize=100)
    return _user_queues[user_id]

def push_notification(user_id: str, event: dict):
    """Called by background jobs and DB hooks to push events."""
    if user_id in _user_queues:
        try:
            _user_queues[user_id].put_nowait(event)
        except asyncio.QueueFull:
            pass  # drop event if queue is full
```

### Job instrumentation pattern

```python
async def run_daily_triage(user_id: str, event_sink=None):
    def emit(event): 
        if event_sink: event_sink(event)
    
    emit({"type": "job_started", "job_id": job_id, "title": "Daily triage"})
    
    emit({"type": "job_step", "job_id": job_id, "step": "Loading garden state", "status": "running"})
    # ... load garden state ...
    emit({"type": "job_step", "job_id": job_id, "step": "Loading garden state", "status": "done"})
    
    # ... continue for each step ...
    
    emit({"type": "job_complete", "job_id": job_id, "title": "Daily triage", "summary": f"{n} urgent tasks found"})
```

When called from the notification stream handler, `event_sink = lambda e: push_notification(user_id, e)`. When called from CLI or cron without a connected user, `event_sink = None` — jobs run unchanged.

### Jobs instrumented

| Job | Steps |
|---|---|
| Daily triage | Loading garden state, Checking weather impacts, Scoring tasks, Generating recommendations |
| Weather analysis | Fetching forecast, Deriving impacts, Identifying affected tasks |
| Task series materialisation | Materialising recurring tasks |
| Treatment plan drafting | Loading incident context, Analysing subjects, Generating steps |
| Proposal generation | Checking feasibility, Costing, Building timeline, Writing proposal |

### Alert and interaction push

When a `MonitorAlert` is inserted into the DB: `push_notification(user_id, {"type": "alert", "payload": {...}})`  
When an `InteractionRecord` is created: `push_notification(user_id, {"type": "interaction_pending", "payload": {...}})`

---

## Frontend components

**`NotificationBell`** — nav item with badge count. Reads from notification store.

**`NotificationPanel`** — slide-in panel with In Progress / Pending Approval / Alerts sections.

**`JobProgressTree`** — renders a job's step tree with running/done state. Receives `job_step` events and updates in place.

**`Toast`** — ephemeral bottom-right notification. Auto-dismisses. Triggered by `job_complete` and high-severity `alert` events.

**`useNotificationStream`** — custom hook that opens the SSE connection, handles reconnection, dispatches events to a Zustand or Context store.

---

## API endpoints

| Endpoint | Used for | Status |
|---|---|---|
| `GET /api/v1/alerts` | Initial sync — current alerts | ✅ (already returns structured JSON) |
| `POST /api/v1/alerts/{id}/dismiss` | Dismiss an alert | ✅ |
| `GET /api/v1/interactions/pending` | Initial sync — pending interactions | ✅ (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `GET /api/v1/notifications/stream` | Live SSE event stream | Blocked on [#130](https://github.com/ybordag/rhizome/issues/130) |
| `GET /api/v1/notifications` | Sync snapshot on mount/reconnect | Blocked on [#130](https://github.com/ybordag/rhizome/issues/130) |
