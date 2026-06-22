# Activity — Global Feed

**Last updated:** 2026-06-22

## Purpose

A single page showing everything that has happened across the whole garden — task completions, care actions, project updates, incidents, weather events, agent actions, and interactions. The primary use is verifying what Rhizome did, cross-referencing events across objects, and building a picture of the garden's history.

Per-object history is surfaced on each object's detail page using the same `ObjectActivityFeed` component. The Activity page is that same component pointed at the global feed.

---

## Page (`/app/activity`)

**Status:** Phase 5a implemented on `sugar-maple`. The page is wired to real `GET /api/v1/activity` data, custom Verdant-themed filters/date pickers, lazy infinite scroll, loading/error/empty states, mobile overflow coverage, and focused unit/component/E2E tests.

### Layout

Filter rail (left) + activity feed (main, infinite scroll).

### Filter rail

- **Category:** All / Task / Project / Plant / Care / Incident / Interaction / Weather
- **Event type:** specific event types within the selected category (e.g. `task_completed`, `plant_watered`, `proposal_accepted`)
- **Since / Before:** date range pickers
- **Subject:** plant/bed/container/project picker — filters to events involving a specific object

Date filters validate before querying: `Since` cannot be in the future, and `Before` must be after `Since`.

### Activity feed

Cursor-paginated, newest first. Each row:
- Date/time (relative for recent, absolute for older)
- Event type badge (colour-coded by category — task=pine, care=chartreuse, incident=clay, interaction=cornflower, weather=buttercup)
- Summary text — human-readable description
- Actor label — "Rhizome" or "You"
- Affected objects as clickable chips (navigate to detail page)

Sentinel-driven infinite scroll fetches older events with the `before_timestamp` cursor. Each page appends to the feed while de-duping by event id so overlapping cursor responses do not duplicate rows.

**Decision:** Activity history uses lazy infinite scroll rather than numbered pagination. This page is a chronological journal/audit trail, so the primary workflow is scanning backward through time while preserving filter context. Numbered pages would add navigation chrome without giving the user a meaningful page number model. The backend still exposes cursor-style pagination through `before_timestamp`; Verdant consumes that cursor through a scroll sentinel.

### API coverage

Endpoint needs:

| Requirement | Endpoint |
|---|---|
| Global feed with filters | `GET /api/v1/activity` |
| Cursor pagination | `before_timestamp` param |
| Per-object feeds | `GET /api/v1/garden/{type}/{id}/activity` |
| Velocity stats | `GET /api/v1/activity/stats` |

---

## Shared `ObjectActivityFeed` component

Used in two places:
1. The `/app/activity` page — full page with filter rail
2. Every garden object detail page (plant, bed, container, task, incident, project) — embedded section, no filters

```typescript
interface ObjectActivityFeedProps {
  events: ActivityEventView[]
  isLoading?: boolean
  error?: string | null
  hasMore?: boolean
  isFetchingMore?: boolean
  onRetry?: () => void
  onLoadMore?: () => void
}
```

The page owns API querying and filter state. `ObjectActivityFeed` stays presentational so it can be reused later with object-scoped activity endpoints.
