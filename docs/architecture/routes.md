# Route Structure

All authenticated routes live under `/app` and are wrapped by `ProtectedRoute`.

```
/                           → redirect to /app/today (authed) or /login
/login                      → LoginPage
/register                   → RegisterPage

/app                        → ProtectedRoute + AppShell layout
  /app/today                → TodayPage

  /app/tasks                → TasksPage — Today view (tasks/daily, default)
  /app/tasks/week           → TasksPage — This Week view (tasks/due?days_ahead=7)
  /app/tasks/project/:id    → TasksPage — By Project view (tasks?project_id=X)
  /app/tasks/kind/:type     → TasksPage — By Kind view (tasks?type=X)
  /app/tasks/area           → TasksPage — By Area view (tasks?subject_type=X&subject_id=Y)
  /app/tasks/progress       → TasksPage — Progress / Velocity view
  /app/tasks/:id            → TaskDetailPage — full task detail and edit
  /app/tasks/series/:id     → TaskSeriesPage — edit a recurring series rule

  /app/calendar             → CalendarPage — full month/week view across all entity types

  /app/rhizome              → RhizomePage — agent chat (auto-creates thread if none)
  /app/rhizome/:threadId    → RhizomePage — specific thread loaded

  /app/garden               → GardenPage — profile, areas, beds, containers
  /app/garden/beds/new      → BedCreatePage — static form
  /app/garden/beds/:id      → BedDetailPage
  /app/garden/containers/new → ContainerCreatePage — static form
  /app/garden/containers/:id → ContainerDetailPage
  /app/plants               → PlantsPage — plant list
  /app/plants/new           → PlantCreatePage — 4-step progressive wizard
  /app/plants/:id           → PlantDetailPage

  /app/projects             → ProjectsPage — project list
  /app/projects/:id         → ProjectDetailPage
  /app/projects/:id/proposals/:proposalId → ProposalDetailPage

  /app/incidents            → IncidentsPage
  /app/incidents/:id        → IncidentDetailPage

  /app/activity             → ActivityPage — global activity feed

  /app/settings             → SettingsPage — provider keys, preferences
```

## Nav items

Seven top-level nav items in three groups:

| Group | Nav items |
|---|---|
| Orientation | Rhizome, Today |
| Work | Tasks, Calendar, Projects |
| Operational | Incidents, Activity |

**Garden, Plants, Beds, and Containers are NOT nav items.** They are accessed through the garden profile card widget in the sidebar, which links to `/app/garden`, `/app/plants`, `/app/garden/beds/:id`, `/app/garden/containers/:id`. Their routes still exist — they are just not directly in the nav.

## Notes

- The Tasks page shares a single route component (`TasksPage`) across all its views. The active view is determined by the URL. A filter rail in the left of the page shows all view options.
- `/app/tasks` and `/app/calendar` are deliberately separate — they serve different cognitive modes (operational ledger vs temporal overview). The Calendar is not a view mode within Tasks.
- Deep links work for all views — every URL is bookmarkable and browser-back navigable.
- The notification drawer is the only drawer in the app. It opens from the 🔔 button in the nav footer. All other creation/editing flows use dedicated pages (`/new` routes) or inline interactions.
