import { render, screen } from '@testing-library/react'
import type { ActivityEventView } from '@/lib/types/rhizome'
import ActivityEventRow from './ActivityEventRow'

const baseEvent: ActivityEventView = {
  id: 'activity-row-1',
  created_at: '2026-06-21T15:24:00',
  actor_type: 'agent',
  actor_label: 'Rhizome',
  event_type: 'task_completed',
  category: 'task',
  summary: 'Completed morning watering.',
  notes: 'Soil was dry in the top inch.',
  subjects: [
    { subject_type: 'task', subject_id: 'task-water-001', role: 'primary' },
    { subject_type: 'container', subject_id: 'container-growbag-tomatoes-long-id', role: 'affected' },
  ],
}

describe('ActivityEventRow', () => {
  it('renders event metadata, notes, actor, and affected subject chips', () => {
    render(<ActivityEventRow event={baseEvent} />)

    expect(screen.getByText('task')).toBeInTheDocument()
    expect(screen.getByText('task completed')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Completed morning watering.' })).toBeInTheDocument()
    expect(screen.getByText('Soil was dry in the top inch.')).toBeInTheDocument()
    expect(screen.getByText('Rhizome')).toBeInTheDocument()
    expect(screen.getByText('primary task task-wat...')).toBeInTheDocument()
    expect(screen.getByText('affected container containe...')).toBeInTheDocument()
    expect(screen.getByLabelText('Affected objects')).toBeInTheDocument()
    expect(screen.getByText('Jun 21')).toBeInTheDocument()
  })

  it('falls back for unknown categories, missing actor labels, notes, and subjects', () => {
    render(
      <ActivityEventRow
        event={{
          ...baseEvent,
          actor_label: undefined,
          actor_type: 'system_actor',
          category: 'custom_category',
          event_type: 'custom_event',
          notes: undefined,
          subjects: [],
        }}
      />,
    )

    expect(screen.getByText('custom category')).toBeInTheDocument()
    expect(screen.getByText('custom event')).toBeInTheDocument()
    expect(screen.getByText('system actor')).toBeInTheDocument()
    expect(screen.queryByText('Soil was dry in the top inch.')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Affected objects')).not.toBeInTheDocument()
  })
})
