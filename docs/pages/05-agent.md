# Agent — Rhizome Chat

**Last updated:** 2026-06-22

## Pages in this group

| Page | Route |
|---|---|
| Rhizome chat | `/app/rhizome` |
| Rhizome chat — specific thread | `/app/rhizome/:threadId` |

---

## Layout

Three vertical regions:

```
┌──────────────────────────────────────────────────────────────┬──────────────┐
│  TOPBAR: "June 14, 2026 · Saturday"  [Model ▾] [New         │              │
│          Incident] [Run Triage] [New Thread]                 │              │
├──────────────────────────────────────────────────────────────┤  INTERACTION │
│  SESSION STRIP                                               │  PANEL       │
│  Startup intake: Time 45min · Energy Medium · Focus Seeds   │  (open when  │
│  System status: Weather snapshot · 3 pending reviews        │  pending     │
├──────────────────────────────────────────────────────────────┤  interactions│
│  CONTEXT STRIP (if any objects pinned)                       │  exist)      │
│  🌱 Cherry Tomatoes  📋 Inspect tomatoes task  ×  + Add     │              │
├──────────────────────────────────────────────────────────────┤              │
│  CHAT THREAD                                                 │              │
│  (scrollable, dot-grid background)                           │              │
│                                                              │              │
├──────────────────────────────────────────────────────────────┤              │
│  COMPOSER: "Ask Rhizome..."                     [Send]       │              │
└──────────────────────────────────────────────────────────────┴──────────────┘
```

---

## Session strip

A persistent narrow strip at the top of the chat area (below the topbar) showing the session context that Rhizome loaded at startup.

**Left — Startup intake:** Rhizome should expose three structured session context values: "How much time do you have?", "What's your energy level?", and "What do you want to focus on?" Display them as compact tiles. These ground Rhizome's recommendations for the session.

Current backend note: rhizome#146 is complete. Rhizome persists structured thread session context and exposes GET/PATCH session-context routes internally. Verdant's normal API path is still waiting on cambium#23 to proxy those routes as `/api/v1/threads/{id}/session-context`; until then, render honest "Not set" / unavailable placeholders and do not invent client-only state that Rhizome cannot use.

**Right — System status:** Weather snapshot timestamp, count of pending reviews needing approval. Clicking the review count jumps to the interaction panel.

---

## Thread home and thread list

`/app/rhizome` without a `threadId` is a thread home, not a silently auto-created conversation.

**No threads yet:** show a blank new-thread state with the composer centered in the chat area, a short empty-state line, and a primary "Start new thread" action. Sending the first message creates the thread, streams the response, and navigates to `/app/rhizome/:threadId`.

**Existing threads:** show a scrollable recent-thread list plus a new-thread entrypoint. The list uses `GET /api/v1/threads?limit=20`, sorted by `last_active_at`, and each row shows thread name, last activity, and a short preview if available. Selecting a thread navigates to `/app/rhizome/:threadId`; "New thread" switches to the blank composer state without creating anything until the user sends.

The active thread page (`/app/rhizome/:threadId`) keeps a compact thread switcher in the topbar so the user can move between conversations without leaving the workbench.

---

## Context strip

Visible only when at least one object is pinned. A horizontal strip of entity chips between the session strip and the chat thread.

Each chip: small entity type icon (plant/bed/task/project/incident), entity name, `×` remove button. Active chips are highlighted.

**`+ Add context` button** opens the context search modal.

**Context search modal:**

A full-screen-overlay search input. Supports two modes:

- **Unified search:** type any text → searches across plants, beds, containers, tasks, projects, incidents simultaneously → results grouped by type with entity icon, name, secondary label (location/status), faint type badge
- **Typed search:** prefix the query with an entity type — `plant:tomatoes`, `task:water`, `incident:aphids`, `project:summer` → narrows results to that type only, autosuggest fires on each keystroke

Selecting a result pins it as a context chip. Multiple objects can be pinned.

Source: `GET /api/v1/search?q=X&types=Y`

---

## Chat thread

The main conversation area. Dot-grid background matching the v2 prototype.

**Message bubbles:**
- User messages: right-aligned, clay accent left border
- Rhizome messages: left-aligned, pine accent left border
- Timestamps and author label above each bubble in `--font-label` uppercase
- Day separator labels between messages from different days

**Inline interaction cards:** When Rhizome triggers a structured interaction mid-conversation (approval needed), a compact summary card appears embedded in the bubble: title, type label, "Review in panel →" link. The full card lives in the interaction panel.

**Streaming:** `StreamingMessage` component renders tokens as they arrive. Blinking cursor during generation. Replaced by static `MessageBubble` on completion.

**Thread switcher:** A compact dropdown in the topbar showing recent threads from `GET /api/v1/threads?limit=20`. The dedicated `/app/rhizome` thread home owns the full scrollable list.

---

## Composer

A `<textarea>` at the bottom. Enter sends (Shift+Enter newline). "Send" button becomes active when input is non-empty.

Placeholder: *"Ask Rhizome about tasks, plants, projects, weather, or incidents…"*

Status line below: zone + model indicator ("Zone 9b · Rhizome is listening").

**Model selector:** A compact selector belongs in the topbar, not the composer. It shows provider + model from `GET /auth/session` (`preferred_provider`, `preferred_model`) and saves changes through `PATCH /auth/profile` when cambium#20 lands. Until that endpoint exists, render the current provider/model as read-only with a disabled selector affordance and a tooltip.

---

## Connection handling

SSE is the only transport for chat (`streamChat`/`streamResume` — see [sse-streaming.md](../architecture/sse-streaming.md)); there's no non-streaming fallback. Behavior on failure, per [error-handling.md](../development/error-handling.md):

- **Connection never opens / drops before any token arrives:** no auto-retry. Show "Connection failed — try again" in the composer area with a manual retry button. Resubmitting a half-sent message automatically would be worse than asking the user to re-trigger it.
- **Connection drops mid-stream** (after some tokens, before a `{ type: "done" }` event): the consuming component must track a local `sawDone` flag. If the generator returns without it ever being set, treat the response as incomplete — append "⚠ response may be incomplete" rather than presenting partial tokens as the full answer.

Neither case is built yet — there's no chat UI to attach it to until Phase 5 starts. This section exists so the contract is settled before the chat UI is built, not reverse-engineered after.

---

## Interaction panel (right, slides open)

Opens automatically when the stream delivers an `{ type: "interaction" }` event. Closed when no pending interactions exist.

**Panel header:** "Current interaction" label, interaction title, brief description.

**Pending list (collapsible):** Shows all pending interactions queued — not just the active one. Each item: title, interaction type (Weather change review / Proposal review / Treatment plan), "Now" badge on the active one. Clicking switches the review card below.

**Review card (full width):** The structured interaction card with:
- Title and subtitle
- Type-specific metric grid (e.g. Rain chance 78%, Window 9 PM–2 AM)
- Proposed changes (bulleted list)
- Affected subjects (chips: Containers, Herbs, Weather, Approval)
- Optional decision notes input — the user can add a note to Rhizome ("still water the porch basil")
- Action buttons: **Request Revision** · **Reject** · **Approve** (primary, chartreuse)

**Approve flow:** calls `POST /api/v1/chat/resume/stream` with `{ thread_id, resolution: "confirm" }`. Stream resumes — new tokens appear in the chat. Interaction marked resolved by the agent on the backend.

---

## Context-aware entry points

The Rhizome page can be entered from any other page in the app with pre-loaded context. Two flows:

**"Ask Rhizome about this" from a detail page** (plant, bed, container, task, incident):
- Navigates to `/app/rhizome?context_type=plant&context_id=abc123`
- On load: shows a modal — "Open new thread" or "Add to current thread"
- New thread: creates thread via `POST /api/v1/threads` with `initial_context: [{ subject_type, subject_id, label }]`, pins the entity as a context chip, focuses the composer
- Add to current: calls `POST /api/v1/threads/{id}/context` on the active thread

**From triage / incidents / projects:**
- "Continue in Rhizome" button navigates to `/app/rhizome?context_type=triage` or `?context_type=incident&context_id=X`
- Pre-seeds a message in the composer (e.g. "I just ran triage — let's work through today's recommendations") which the user can edit before sending

---

## Pinned context — how Rhizome uses it

When the user sends a message in a thread with pinned context, `session_context_intake` loads the current state of all pinned objects and prepends them to the session context:

```
Pinned context:
- Plant: Cherry Tomatoes (fruiting · Growbag A · last watered 2 days ago · 2 open tasks)
- Incident: Aphids on kale (reported 3 days ago · no treatment plan yet)
```

Rhizome can reference these directly without the user re-describing them. The summaries reflect live data — if the care state changes between turns, the next turn picks up the updated state.

---

## API endpoints

| Endpoint | Used for |
|---|---|
| `POST /api/v1/threads` | Create thread (+ initial_context) |
| `GET /api/v1/threads?limit=20` | Thread list in topbar |
| `GET /api/v1/threads/{id}` | Load active thread metadata |
| `GET /api/v1/threads/{id}/messages` | Load thread history |
| `GET /api/v1/threads/{id}/session-context` | Load structured startup/session context once cambium#23 lands |
| `PATCH /api/v1/threads/{id}/session-context` | Save user-edited session context once editing is enabled |
| `DELETE /api/v1/threads/{id}` | Delete thread |
| `POST /api/v1/chat/stream` | Send message (SSE) |
| `POST /api/v1/chat/resume/stream` | Resume after interaction approval |
| `GET /api/v1/interactions/pending` | Populate interaction panel |
| `POST /api/v1/threads/{id}/context` | Pin context object |
| `DELETE /api/v1/threads/{id}/context/{type}/{id}` | Remove context chip |
| `GET /api/v1/search?q=X&types=Y` | Context search modal |
| `POST /api/v1/triage/run` | "Run Triage" button in topbar |
| `POST /api/v1/incidents` | "New Incident" button in topbar |
| `GET /auth/session` | Current provider/model display |
| `PATCH /auth/profile` | Save provider/model selection once cambium#20 lands |

---

## Open design questions

**Thread preview source.** The thread list needs a preview line. If `ThreadView` does not include one, either omit previews in the first build or add a backend field later; do not fetch every thread's messages just to render the list.

**Model switching semantics.** The selector should save the user's preferred default. Whether switching model mid-thread should affect only future turns or require a new thread is still a product decision.
