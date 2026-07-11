# Route Structure

**Last verified:** 2026-07-10

`src/routes/router.tsx` is authoritative. Route presence does not imply page completion; see [current status](../status/current.md) and the [page specs](../pages/).

## Public Routes

| Route | Page |
|---|---|
| `/` | Landing |
| `/login` | Login; redirects authenticated users to Today |
| `/register` | Registration; redirects authenticated users to Today |

## Authenticated Routes

All routes below use `ProtectedRoute` and `AppShell`. `/app` redirects to `/app/today`.

| Area | Routes |
|---|---|
| Today | `/app/today` |
| Tasks | `/app/tasks`, `/week`, `/project/:id`, `/kind/:type`, `/area`, `/progress`, `/new`, `/series/:id`, `/:id` under `/app/tasks` |
| Calendar | `/app/calendar` |
| Rhizome | `/app/rhizome`, `/app/rhizome/:threadId` |
| Garden | `/app/garden` |
| Beds | `/app/beds`, `/app/beds/new`, `/app/beds/:id` |
| Containers | `/app/containers`, `/app/containers/new`, `/app/containers/:id` |
| Plants | `/app/plants`, `/app/plants/new`, `/app/plants/:id` |
| Projects | `/app/projects`, `/app/projects/new`, `/app/projects/:id`, `/app/projects/:id/proposals/:proposalId` |
| Incidents | `/app/incidents`, `/app/incidents/:id` |
| Activity | `/app/activity` |
| Account | `/app/settings` |

`/app/rhizome` shows a blank/new-thread workspace and recent threads. It does not silently create a thread; creation occurs when the user starts the conversation.

## Navigation

Top-level navigation:

- Orientation: Rhizome, Today
- Work: Tasks, Calendar, Projects
- Operational: Incidents, Activity

Garden, Plants, Beds, and Containers are accessed through the garden profile section rather than the top-level nav.

## Route Rules

- Durable objects and editing flows use durable URLs.
- Filters that users may bookmark or revisit should use URL search parameters.
- Temporary panels may support thread navigation, context inspection, and structured review without becoming routes of their own.
- Route parameters identify records; do not put access tokens or sensitive context in URLs.
