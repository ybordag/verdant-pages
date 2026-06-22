import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import type { ActivityEventView } from '@/lib/types/rhizome'
import ObjectActivityFeed from './ObjectActivityFeed'

const event: ActivityEventView = {
  id: 'activity-1',
  created_at: '2026-06-21T12:00:00',
  actor_type: 'agent',
  actor_label: 'Rhizome',
  event_type: 'task_created',
  category: 'task',
  summary: 'Created a watering task.',
  subjects: [{ subject_type: 'task', subject_id: 'task-1', role: 'primary' }],
}

describe('ObjectActivityFeed', () => {
  it('renders loading, empty, and error states', async () => {
    const onRetry = vi.fn()
    const { rerender } = render(<ObjectActivityFeed events={[]} isLoading />)

    expect(screen.getByText('Loading activity')).toBeInTheDocument()

    rerender(<ObjectActivityFeed events={[]} />)
    expect(screen.getByText('No activity found')).toBeInTheDocument()

    rerender(<ObjectActivityFeed events={[]} error="Activity failed." onRetry={onRetry} />)
    expect(screen.getByText('Activity could not load')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders events with infinite-scroll footer states', () => {
    const { rerender } = render(<ObjectActivityFeed events={[event]} hasMore isFetchingMore />)

    expect(screen.getByText('Created a watering task.')).toBeInTheDocument()
    expect(screen.getByText('Loading older activity...')).toBeInTheDocument()

    rerender(<ObjectActivityFeed events={[event]} hasMore={false} />)
    expect(screen.getByText('End of activity')).toBeInTheDocument()
  })
})
