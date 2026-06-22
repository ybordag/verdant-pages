import { useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import FilterRail, { type ActivityFilters } from '@/components/activity/FilterRail'
import ObjectActivityFeed from '@/components/activity/ObjectActivityFeed'
import { listActivity } from '@/lib/api/activity'
import type { ActivityEventView, ActivityListParams } from '@/lib/types/rhizome'
import { getFilterErrors } from './activityFilters'
import s from './ActivityPage.module.css'

const PAGE_SIZE = 20
const EMPTY_EVENTS: ActivityEventView[] = []
const CATEGORY_OPTIONS = ['care', 'garden', 'incident', 'interaction', 'project', 'task', 'weather']
const SUBJECT_TYPE_OPTIONS = [
  'batch',
  'bed',
  'container',
  'incident',
  'incident_report',
  'plant',
  'project',
  'task',
  'task_series',
  'treatment_plan',
  'weather_snapshot',
]
const EVENT_TYPE_OPTIONS = [
  'batch_created',
  'incident_reported',
  'incident_updated',
  'interaction_recorded',
  'plant_created',
  'plant_removed',
  'plant_updated',
  'project_created',
  'project_updated',
  'task_completed',
  'task_created',
  'task_deferred',
  'task_skipped',
  'treatment_plan_approved',
  'treatment_plan_created',
  'weather_advisory_created',
]

const DEFAULT_FILTERS: ActivityFilters = {
  category: '',
  eventType: '',
  subjectType: '',
  since: '',
  before: '',
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function buildActivityParams(filters: ActivityFilters, cursor?: string): ActivityListParams {
  const params: ActivityListParams = { limit: PAGE_SIZE }
  if (filters.category) params.category = filters.category
  if (filters.eventType) params.event_type = filters.eventType
  if (filters.subjectType) params.subject_type = filters.subjectType
  if (filters.since) params.since = filters.since
  if (cursor) params.before_timestamp = cursor
  else if (filters.before) params.before_timestamp = filters.before
  return params
}

function uniqueEvents(pages: ActivityEventView[][]): ActivityEventView[] {
  const seen = new Set<string>()
  return pages.flat().filter((event) => {
    if (seen.has(event.id)) return false
    seen.add(event.id)
    return true
  })
}

export default function ActivityPage() {
  const [filters, setFilters] = useState<ActivityFilters>(DEFAULT_FILTERS)
  const filterErrors = useMemo(() => getFilterErrors(filters), [filters])
  const hasFilterErrors = Boolean(filterErrors.since || filterErrors.before)
  const activityParams = useMemo(() => buildActivityParams(filters), [filters])
  const activityQuery = useInfiniteQuery({
    queryKey: ['activity', 'list', activityParams],
    queryFn: ({ pageParam }) => listActivity(buildActivityParams(filters, pageParam)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return lastPage[lastPage.length - 1]?.created_at
    },
    enabled: !hasFilterErrors,
  })

  const events = useMemo(() => uniqueEvents(activityQuery.data?.pages ?? [EMPTY_EVENTS]), [activityQuery.data])

  const categoryOptions = useMemo(
    () => uniqueSorted([...CATEGORY_OPTIONS, ...events.map((event) => event.category)]),
    [events],
  )
  const eventTypeOptions = useMemo(
    () => uniqueSorted([...EVENT_TYPE_OPTIONS, ...events.map((event) => event.event_type)]),
    [events],
  )
  const subjectTypeOptions = useMemo(
    () =>
      uniqueSorted([
        ...SUBJECT_TYPE_OPTIONS,
        ...events.flatMap((event) => event.subjects.map((subject) => subject.subject_type)),
      ]),
    [events],
  )

  return (
    <main className={s.page}>
      <header className={s.header}>
        <div>
          <p className={s.eyebrow}>Global journal</p>
          <h1 className={s.title}>Activity</h1>
          <p className={s.subtitle}>
            A chronological record of Rhizome actions, garden changes, incidents, weather adjustments, and task progress across the workspace.
          </p>
        </div>
        <div className={s.count}>{events.length} events</div>
      </header>

      <div className={s.content}>
        <div className={s.rail}>
          <FilterRail
            filters={filters}
            errors={filterErrors}
            categoryOptions={categoryOptions}
            eventTypeOptions={eventTypeOptions}
            subjectTypeOptions={subjectTypeOptions}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>
        <ObjectActivityFeed
          events={events}
          isLoading={activityQuery.isLoading}
          error={activityQuery.isError ? 'Recent activity is unavailable right now.' : null}
          hasMore={activityQuery.hasNextPage}
          isFetchingMore={activityQuery.isFetchingNextPage}
          onRetry={() => void activityQuery.refetch()}
          onLoadMore={() => void activityQuery.fetchNextPage()}
        />
      </div>
    </main>
  )
}
