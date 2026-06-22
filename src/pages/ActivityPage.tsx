import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import FilterRail, { type ActivityFilters } from '@/components/activity/FilterRail'
import ObjectActivityFeed from '@/components/activity/ObjectActivityFeed'
import { listActivity } from '@/lib/api/activity'
import type { ActivityEventView, ActivityListParams } from '@/lib/types/rhizome'
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

function buildActivityParams(filters: ActivityFilters): ActivityListParams {
  const params: ActivityListParams = { limit: PAGE_SIZE }
  if (filters.category) params.category = filters.category
  if (filters.eventType) params.event_type = filters.eventType
  if (filters.subjectType) params.subject_type = filters.subjectType
  if (filters.since) params.since = filters.since
  if (filters.before) params.before_timestamp = filters.before
  return params
}

export default function ActivityPage() {
  const [filters, setFilters] = useState<ActivityFilters>(DEFAULT_FILTERS)
  const activityParams = useMemo(() => buildActivityParams(filters), [filters])
  const activityQuery = useQuery({
    queryKey: ['activity', 'list', activityParams],
    queryFn: () => listActivity(activityParams),
  })

  const events = activityQuery.data ?? EMPTY_EVENTS

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
          onRetry={() => void activityQuery.refetch()}
        />
      </div>
    </main>
  )
}
