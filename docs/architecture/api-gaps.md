# Known API Gaps

**Last updated:** 2026-06-20

Gaps identified during design sessions (2026-06-19). Each has a GitHub issue. The frontend build is blocked on these for the affected pages.

## Issue tracker

### Daily driver — Tasks & Calendar

| Gap | Rhizome | Cambium |
|---|---|---|
| Task listing: optional `project_id`, `type` + subject filters | [#112](https://github.com/ybordag/rhizome/issues/112) | [#4](https://github.com/ybordag/cambium/issues/4) |
| Task creation (`POST /api/v1/tasks`) | [#112](https://github.com/ybordag/rhizome/issues/112) | [#4](https://github.com/ybordag/cambium/issues/4) |
| Task deletion (`DELETE /api/v1/tasks/{id}`) | [#112](https://github.com/ybordag/rhizome/issues/112) | [#4](https://github.com/ybordag/cambium/issues/4) |
| Task series creation (`POST /api/v1/tasks/series`) | [#113](https://github.com/ybordag/rhizome/issues/113) | [#5](https://github.com/ybordag/cambium/issues/5) |
| Task series deletion (`DELETE /api/v1/tasks/series/{id}`) | [#113](https://github.com/ybordag/rhizome/issues/113) | [#5](https://github.com/ybordag/cambium/issues/5) |
| Calendar annotations model + CRUD | [#114](https://github.com/ybordag/rhizome/issues/114) | [#6](https://github.com/ybordag/cambium/issues/6) |
| Activity stats endpoint (`GET /api/v1/activity/stats`) | [#115](https://github.com/ybordag/rhizome/issues/115) | [#7](https://github.com/ybordag/cambium/issues/7) |
| Activity endpoint missing `project_id` + `subject_type` params | [#115](https://github.com/ybordag/rhizome/issues/115) | [#7](https://github.com/ybordag/cambium/issues/7) |
| `ActivityEvent` missing `user_id` scoping (latent multi-tenancy bug) | [#115](https://github.com/ybordag/rhizome/issues/115) | — |

### Foundational — blocks all frontend pages

| Gap | Rhizome | Cambium |
|---|---|---|
| **All data endpoints return formatted strings, not structured JSON** — tools are `-> str` by design; router wraps as `{"result": "..."}`. Frontend cannot consume these. Needs a Pydantic view model layer + serializers across all entity types. | [#120](https://github.com/ybordag/rhizome/issues/120) | — (Cambium proxies as-is once Rhizome returns JSON) |

### Garden page

| Gap | Rhizome | Cambium |
|---|---|---|
| `GET /api/v1/garden/beds/{id}` — individual bed detail | [#116](https://github.com/ybordag/rhizome/issues/116) | [#8](https://github.com/ybordag/cambium/issues/8) |
| `GET /api/v1/garden/containers/{id}` — individual container detail | [#116](https://github.com/ybordag/rhizome/issues/116) | [#8](https://github.com/ybordag/cambium/issues/8) |
| `GET /api/v1/garden/plants/{id}` — individual plant detail | [#116](https://github.com/ybordag/rhizome/issues/116) | [#8](https://github.com/ybordag/cambium/issues/8) |
| `POST /api/v1/garden/beds` — bed creation (containers + plants exist, beds don't) | [#116](https://github.com/ybordag/rhizome/issues/116) | [#8](https://github.com/ybordag/cambium/issues/8) |
| Plant location filter (`GET /api/v1/garden/plants?location=X&bed_id=X&container_id=X`) | [#116](https://github.com/ybordag/rhizome/issues/116) | [#8](https://github.com/ybordag/cambium/issues/8) |
| Media/image upload + per-object attachments (beds, containers, plants) | [#117](https://github.com/ybordag/rhizome/issues/117) | [#9](https://github.com/ybordag/cambium/issues/9) |
| Garden spatial layout model (`GardenLayout`) + map endpoints | [#118](https://github.com/ybordag/rhizome/issues/118) | [#10](https://github.com/ybordag/cambium/issues/10) |

### Projects page

| Gap | Rhizome | Cambium |
|---|---|---|
| Task dependency create/delete + Gantt graph data (`include_dependencies` param) | [#121](https://github.com/ybordag/rhizome/issues/121) | [#11](https://github.com/ybordag/cambium/issues/11) |
| Bulk task date update (`PATCH /api/v1/projects/{id}/tasks/bulk`) | [#122](https://github.com/ybordag/rhizome/issues/122) | [#12](https://github.com/ybordag/cambium/issues/12) |
| Available resources query (`?available=true` on beds/containers) | [#123](https://github.com/ybordag/rhizome/issues/123) | [#13](https://github.com/ybordag/cambium/issues/13) |
| Project expenses model + CRUD + summary endpoint | [#124](https://github.com/ybordag/rhizome/issues/124) | [#14](https://github.com/ybordag/cambium/issues/14) |
| Shopping list model (`ShoppingItem`) + CRUD + purchase action | [#125](https://github.com/ybordag/rhizome/issues/125) | [#15](https://github.com/ybordag/cambium/issues/15) |

### Garden objects — creation and care

| Gap | Rhizome | Cambium |
|---|---|---|
| Quick care recording — `POST /api/v1/garden/{type}/{id}/care` (find-or-create + complete care task) | [#128](https://github.com/ybordag/rhizome/issues/128) | [#17](https://github.com/ybordag/cambium/issues/17) |

### Incidents page

| Gap | Rhizome | Cambium |
|---|---|---|
| `PATCH /api/v1/incidents/{id}` — edit | [#129](https://github.com/ybordag/rhizome/issues/129) | [#18](https://github.com/ybordag/cambium/issues/18) |
| `DELETE /api/v1/incidents/{id}` — delete | [#129](https://github.com/ybordag/rhizome/issues/129) | [#18](https://github.com/ybordag/cambium/issues/18) |
| Incident list filters: severity, incident_type, since/before, subject | [#129](https://github.com/ybordag/rhizome/issues/129) | [#18](https://github.com/ybordag/cambium/issues/18) |
| `POST /api/v1/incidents/{id}/treatment/manual` — user-authored treatment plan | [#129](https://github.com/ybordag/rhizome/issues/129) | [#18](https://github.com/ybordag/cambium/issues/18) |
| `PATCH /api/v1/treatment-plans/{id}` — edit treatment steps | [#129](https://github.com/ybordag/rhizome/issues/129) | [#18](https://github.com/ybordag/cambium/issues/18) |
| `DELETE /api/v1/treatment-plans/{id}` — delete draft plan | [#129](https://github.com/ybordag/rhizome/issues/129) | [#18](https://github.com/ybordag/cambium/issues/18) |

### Notifications (app shell)

| Gap | Rhizome | Cambium |
|---|---|---|
| `GET /api/v1/notifications/stream` — SSE with heartbeat, job events, alert/interaction push | [#130](https://github.com/ybordag/rhizome/issues/130) | [#19](https://github.com/ybordag/cambium/issues/19) |
| `GET /api/v1/notifications` — sync snapshot (current alerts + pending interactions + active jobs) | [#130](https://github.com/ybordag/rhizome/issues/130) | [#19](https://github.com/ybordag/cambium/issues/19) |
| Background job instrumentation — triage, weather, treatment, monitor jobs emit subtask events | [#130](https://github.com/ybordag/rhizome/issues/130) | — |

### Agent / Rhizome chat page

| Gap | Rhizome | Cambium |
|---|---|---|
| Unified entity search (`GET /api/v1/search?q=X&types=plant,task,...`) | [#126](https://github.com/ybordag/rhizome/issues/126) | [#16](https://github.com/ybordag/cambium/issues/16) |
| Thread pinned context — model, add/remove endpoints, `session_context_intake` integration | [#127](https://github.com/ybordag/rhizome/issues/127) | [#16](https://github.com/ybordag/cambium/issues/16) |

### Account / Settings page

| Gap | Rhizome | Cambium |
|---|---|---|
| `PATCH /auth/profile` — update preferred_provider, preferred_model | — | [#20](https://github.com/ybordag/cambium/issues/20) |
| `POST /auth/password` — change password | — | [#20](https://github.com/ybordag/cambium/issues/20) |

## Gap descriptions

**Task listing too rigid** — `GET /api/v1/tasks` currently requires `project_id`. Blocks the Today, This Week, By Kind, and By Area views on the Tasks page. Needs: optional `project_id`, `type` filter, and `subject_type`+`subject_id` filter.

**No task creation** — Tasks are currently only created by the agent. Blocks the New Task drawer on the Tasks page. User-created tasks need `is_user_modified = true` to survive agent regeneration.

**No task deletion** — Tasks can be superseded or skipped but not deleted. Blocks the delete action on task detail. Should reject if task is `in_progress`.

**No task series creation** — `PATCH /api/v1/tasks/series/{id}` exists but no `POST`. Blocks the New Recurring Series form.

**No task series deletion** — No delete endpoint. Should accept `?delete_pending_tasks=true|false`.

**No calendar annotations** — No model or endpoints for day-level notes. Blocks the annotation feature on the Calendar page. Needs a new `CalendarAnnotation` model with Alembic migration.

**No activity aggregation** — `GET /api/v1/activity` returns raw events, not counts. Blocks the velocity strip (completed this week, streak, deferred rate) and the Progress view bar chart on the Tasks page. Needs a new `GET /api/v1/activity/stats` endpoint returning daily aggregated counts.

**Activity missing params** — `list_recent_activity_entries()` supports `project_id` and `subject_type` internally but the router never exposes them. Small fix.

**ActivityEvent user scoping** — No `user_id` column on `ActivityEvent`. Currently implicit via project scoping. Latent multi-tenancy bug; deferred until multi-user work begins.
