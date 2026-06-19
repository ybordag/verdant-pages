# Agent — Rhizome Chat

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
│  TOPBAR: "June 14, 2026 · Saturday"  [Upload Photo] [New    │              │
│          Incident] [Run Triage]                              │              │
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

**Left — Startup intake:** Rhizome asks three questions at the beginning of a session: "How much time do you have? What's your energy level? What do you want to focus on?" The user answers via the chat, and their responses are shown here as compact tiles. These ground Rhizome's recommendations for the session.

**Right — System status:** Weather snapshot timestamp, count of pending reviews needing approval. Clicking the review count jumps to the interaction panel.

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

Source: `GET /api/v1/search?q=X&types=Y` *(requires [rhizome#126](https://github.com/ybordag/rhizome/issues/126))*

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

**Thread list:** A collapsible sidebar or dropdown in the topbar showing recent threads (from `GET /api/v1/threads?limit=20`), sorted by `last_active_at`. "New thread" button creates a fresh conversation.

---

## Composer

A `<textarea>` at the bottom. Enter sends (Shift+Enter newline). "Send" button becomes active when input is non-empty.

Placeholder: *"Ask Rhizome about tasks, plants, projects, weather, or incidents…"*

Status line below: zone + model indicator ("Zone 9b · Rhizome is listening").

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

| Endpoint | Used for | Status |
|---|---|---|
| `POST /api/v1/threads` | Create thread (+ initial_context) | ✅ (initial_context requires [rhizome#127](https://github.com/ybordag/rhizome/issues/127)) |
| `GET /api/v1/threads?limit=20` | Thread list in topbar | ✅ (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `GET /api/v1/threads/{id}/messages` | Load thread history | ✅ (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `DELETE /api/v1/threads/{id}` | Delete thread | ✅ |
| `POST /api/v1/chat/stream` | Send message (SSE) | ✅ |
| `POST /api/v1/chat/resume/stream` | Resume after interaction approval | ✅ |
| `GET /api/v1/interactions/pending` | Populate interaction panel | ✅ (blocked on [#120](https://github.com/ybordag/rhizome/issues/120)) |
| `POST /api/v1/threads/{id}/context` | Pin context object | Blocked on [#127](https://github.com/ybordag/rhizome/issues/127) |
| `DELETE /api/v1/threads/{id}/context/{type}/{id}` | Remove context chip | Blocked on [#127](https://github.com/ybordag/rhizome/issues/127) |
| `GET /api/v1/search?q=X&types=Y` | Context search modal | Blocked on [#126](https://github.com/ybordag/rhizome/issues/126) |
| `POST /api/v1/triage/run` | "Run Triage" button in topbar | ✅ |
| `POST /api/v1/incidents` | "New Incident" button in topbar | ✅ |
