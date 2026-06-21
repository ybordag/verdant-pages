import { useMemo, useState } from 'react'
import FilterRail, { type ActivityFilters } from '@/components/activity/FilterRail'
import ObjectActivityFeed from '@/components/activity/ObjectActivityFeed'
import type { ActivityEventView } from '@/lib/types/rhizome'
import s from './ActivityPage.module.css'

const DEFAULT_FILTERS: ActivityFilters = {
  category: '',
  eventType: '',
  subjectType: '',
  since: '',
  before: '',
}

const SAMPLE_EVENTS: ActivityEventView[] = [
  {
    id: 'activity-1',
    created_at: '2026-06-21T15:24:00',
    actor_type: 'agent',
    actor_label: 'Rhizome',
    event_type: 'task_completed',
    category: 'task',
    summary: 'Completed morning watering for container tomatoes.',
    notes: 'Soil moisture was dry in the top inch; next check remains scheduled for tomorrow morning.',
    project_id: 'project-summer-veg',
    subjects: [
      { subject_type: 'task', subject_id: 'task-water-001', role: 'primary' },
      { subject_type: 'container', subject_id: 'growbag-tomatoes', role: 'affected' },
    ],
  },
  {
    id: 'activity-2',
    created_at: '2026-06-21T11:08:00',
    actor_type: 'user',
    actor_label: 'Yashi',
    event_type: 'plant_updated',
    category: 'garden',
    summary: 'Updated cherry tomato transplant status.',
    subjects: [{ subject_type: 'plant', subject_id: 'plant-cherry-tomato', role: 'primary' }],
  },
  {
    id: 'activity-3',
    created_at: '2026-06-20T18:42:00',
    actor_type: 'agent',
    actor_label: 'Rhizome',
    event_type: 'incident_reported',
    category: 'incident',
    summary: 'Flagged aphid pressure on kale starts.',
    notes: 'Treatment planning is pending review before tasks are generated.',
    project_id: 'project-brassicas',
    subjects: [
      { subject_type: 'incident', subject_id: 'incident-aphids-kale', role: 'primary' },
      { subject_type: 'plant', subject_id: 'plant-kale-starts', role: 'affected' },
    ],
  },
  {
    id: 'activity-4',
    created_at: '2026-06-19T07:15:00',
    actor_type: 'agent',
    actor_label: 'Weather watcher',
    event_type: 'weather_advisory_created',
    category: 'weather',
    summary: 'Created heat advisory tasks for the next two afternoons.',
    subjects: [{ subject_type: 'weather_snapshot', subject_id: 'weather-2026-06-19', role: 'source' }],
  },
]

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function toDateStamp(value: string): string {
  return value.slice(0, 10)
}

export default function ActivityPage() {
  const [filters, setFilters] = useState<ActivityFilters>(DEFAULT_FILTERS)

  const categoryOptions = useMemo(() => uniqueSorted(SAMPLE_EVENTS.map((event) => event.category)), [])
  const eventTypeOptions = useMemo(() => uniqueSorted(SAMPLE_EVENTS.map((event) => event.event_type)), [])
  const subjectTypeOptions = useMemo(
    () => uniqueSorted(SAMPLE_EVENTS.flatMap((event) => event.subjects.map((subject) => subject.subject_type))),
    [],
  )

  const visibleEvents = useMemo(
    () =>
      SAMPLE_EVENTS.filter((event) => {
        if (filters.category && event.category !== filters.category) return false
        if (filters.eventType && event.event_type !== filters.eventType) return false
        if (filters.subjectType && !event.subjects.some((subject) => subject.subject_type === filters.subjectType)) return false
        if (filters.since && toDateStamp(event.created_at) < filters.since) return false
        if (filters.before && toDateStamp(event.created_at) >= filters.before) return false
        return true
      }),
    [filters],
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
        <ObjectActivityFeed events={visibleEvents} hasMore onLoadMore={() => undefined} />
      </div>
    </main>
  )
}
