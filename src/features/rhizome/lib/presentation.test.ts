import { describe, expect, it } from 'vitest'
import type { TaskSummaryView } from '@/lib/types/rhizome'
import { sessionFocusLabel, shortlistFromTriage, taskMeta, threadTitle } from './presentation'
import { weatherIconKind, weatherTemperatureLabel } from './weather'

const task = (id: string, title = id): TaskSummaryView => ({
  id,
  project_id: 'project-1',
  title,
  type: 'inspection',
  status: 'pending',
  priority: 'high',
  estimated_minutes: 15,
  is_user_modified: false,
  created_at: '2026-07-10T12:00:00Z',
})

describe('Rhizome presentation helpers', () => {
  it('uses durable session focus text before reference labels', () => {
    expect(
      sessionFocusLabel({
        time_text: null,
        energy_text: null,
        focus_text: 'Prepare tomatoes for heat',
        focus_context: [{ subject_type: 'plant', subject_id: 'plant-1', label: 'Tomato' }],
        source: 'user',
        updated_at: null,
      }),
    ).toBe('Prepare tomatoes for heat')
  })

  it('builds a unique three-task shortlist in priority order', () => {
    expect(
      shortlistFromTriage({
        urgent_tasks: [task('one'), task('two')],
        routine_tasks: [task('two'), task('three')],
        project_tasks: [task('four')],
      }).map(({ id }) => id),
    ).toEqual(['one', 'two', 'three'])
  })

  it('formats neutral labels and classifies weather summaries', () => {
    expect(threadTitle()).toBe('Untitled thread')
    expect(taskMeta({ ...task('one'), urgency: 'urgent' })).toBe('urgent · pending · 15 min')
    expect(weatherTemperatureLabel('high 78.4F-equivalent, rain 0.0mm')).toBe('78')
    expect(weatherIconKind('breezy and cloudy', '')).toBe('wind')
    expect(weatherIconKind('', 'Smoke advisory')).toBe('smoke')
  })
})
