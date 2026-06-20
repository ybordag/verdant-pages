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

  /app/garden               → GardenPage — hub (map, profile, tab previews for beds/containers/plants/activity)
  /app/beds                 → BedListPage — full bed list with filters and TanStack Table
  /app/beds/new             → BedCreatePage — static form
  /app/beds/:id             → BedDetailPage
  /app/containers           → ContainerListPage — full container list with filters and TanStack Table
  /app/containers/new       → ContainerCreatePage — static form
  /app/containers/:id       → ContainerDetailPage
  /app/plants               → PlantsPage — full plant list (card grid or ledger, filters)
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

**Garden, Plants, Beds, and Containers are NOT nav items.** They are accessed through the garden profile card widget in the sidebar. The card links to:

| Card link | Route |
|---|---|
| Garden (overview) | `/app/garden` |
| Plants | `/app/plants` |
| Beds | `/app/beds` |
| Containers | `/app/containers` |

**The Garden hub tabs are previews only.** Each tab (Beds, Containers, Plants, Activity) shows a compact summary with a "See all →" link that navigates to the full dedicated list page. Plants, Beds, and Containers all follow the same pattern: preview tab in the hub → full list page → detail page → creation page.

Plants are a top-level nav item (frequent daily access). Beds and Containers are accessed via the garden card — they are less frequently visited and more structural than operational.

## Notes

- The Tasks page shares a single route component (`TasksPage`) across all its views. The active view is determined by the URL. A filter rail in the left of the page shows all view options.
- `/app/tasks` and `/app/calendar` are deliberately separate — they serve different cognitive modes (operational ledger vs temporal overview). The Calendar is not a view mode within Tasks.
- Deep links work for all views — every URL is bookmarkable and browser-back navigable.
- The notification drawer is the only drawer in the app. It opens from the 🔔 button in the nav footer. All other creation/editing flows use dedicated pages (`/new` routes) or inline interactions.
