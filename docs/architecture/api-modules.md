# API Module Catalog

**Last verified:** 2026-07-10

This is a capability index for `src/lib/api/`, not a duplicate of backend Swagger. Function signatures in source and colocated tests are authoritative.

| Module | Current client capabilities |
|---|---|
| `activity.ts` | Paginated/filterable activity and activity statistics |
| `alerts.ts` | List and dismiss monitor alerts |
| `auth.ts` | Login, register, logout, refresh, and current session |
| `calendar.ts` | List, create, update, and delete calendar annotations |
| `chat.ts` | Threads, messages, dedicated session context, pinned context, chat stream, and interaction resume stream |
| `client.ts` | Base URL, auth token, refresh, errors, request wrapper, and query serialization |
| `garden.ts` | Garden profile, location resolution, beds, containers, care state, care recording, and activity |
| `incidents.ts` | Incident lifecycle, treatment plans, approvals, drafting, and activity |
| `interactions.ts` | Pending/recent interaction reads, detail, and resolution |
| `notifications.ts` | Notification snapshot and authenticated stream |
| `plants.ts` | Plant CRUD, batch creation/update/removal, care, activity, remove, and delete |
| `projects.ts` | Project CRUD, progress, brief, proposals, tasks/series, resources, activity, expenses, and shopping |
| `search.ts` | Cross-domain context search with optional type filtering |
| `shopping.ts` | Shopping item CRUD and purchase state |
| `tasks.ts` | Daily/due/blocked/general lists, CRUD, lifecycle actions, blockers, dependencies, series, bulk dates, and activity |
| `triage.ts` | Run triage and retrieve the latest structured triage snapshot |
| `weather.ts` | Latest/refresh weather, impacted tasks, changeset approval, and task drafting |

## Important Contract Decisions

- `GET /triage/recommendations` is intentionally absent. `getLatestTriage()` is the supported structured recommendation source.
- `listTasksBlocked()` returns structured `TaskSummaryView[]`.
- `batchRemovePlants()` returns the structured plants actually marked removed.
- `ThreadView.session_context` is raw stored JSON. Display and edit flows use `getThreadSessionContext()` and `updateThreadSessionContext()`.
- Rhizome focus uses natural-language focus text plus zero-to-many stable object references; it is not a single project filter.
- Streaming calls use the stream layer rather than `apiFetch` because they consume incremental events.

## Maintenance Rule

When exports change, update this capability table only if the module's user-facing responsibility changes. Avoid listing every route and DTO here; source tests provide a more reliable executable catalog.
