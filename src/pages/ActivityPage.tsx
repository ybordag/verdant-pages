import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import FilterRail, { type ActivityFilters } from '@/components/activity/FilterRail'
import ObjectActivityFeed from '@/components/activity/ObjectActivityFeed'
import { listActivity } from '@/lib/api/activity'
import type { ActivityEventView } from '@/lib/types/rhizome'
import s from './ActivityPage.module.css'

const PAGE_SIZE = 20
const EMPTY_EVENTS: ActivityEventView[] = []

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

function toDateStamp(value: string): string {
  return value.slice(0, 10)
}

export default function ActivityPage() {
  const [filters, setFilters] = useState<ActivityFilters>(DEFAULT_FILTERS)
  const activityQuery = useQuery({
    queryKey: ['activity', 'list', { limit: PAGE_SIZE }],
    queryFn: () => listActivity({ limit: PAGE_SIZE }),
  })

  const events = activityQuery.data ?? EMPTY_EVENTS

  const categoryOptions = useMemo(() => uniqueSorted(events.map((event) => event.category)), [events])
  const eventTypeOptions = useMemo(() => uniqueSorted(events.map((event) => event.event_type)), [events])
  const subjectTypeOptions = useMemo(
    () => uniqueSorted(events.flatMap((event) => event.subjects.map((subject) => subject.subject_type))),
    [events],
  )

  const visibleEvents = useMemo(
    () =>
      events.filter((event) => {
        if (filters.category && event.category !== filters.category) return false
        if (filters.eventType && event.event_type !== filters.eventType) return false
        if (filters.subjectType && !event.subjects.some((subject) => subject.subject_type === filters.subjectType)) return false
        if (filters.since && toDateStamp(event.created_at) < filters.since) return false
        if (filters.before && toDateStamp(event.created_at) >= filters.before) return false
        return true
      }),
    [events, filters],
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
        <div className={s.count}>{visibleEvents.length} events</div>
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
          events={visibleEvents}
          isLoading={activityQuery.isLoading}
          error={activityQuery.isError ? 'Recent activity is unavailable right now.' : null}
          onRetry={() => void activityQuery.refetch()}
        />
      </div>
    </main>
  )
}
