import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { listActivity } from '@/lib/api/activity'
import type { ActivityEventView, ActivityListParams } from '@/lib/types/rhizome'
import ActivityPage from './ActivityPage'
import { getFilterErrors } from './activityFilters'

vi.mock('@/lib/api/activity', () => ({ listActivity: vi.fn() }))

const EVENTS: ActivityEventView[] = [
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

function renderActivityPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ActivityPage />
    </QueryClientProvider>,
  )
}

function mockActivityResponses() {
  vi.mocked(listActivity).mockImplementation(async (params?: ActivityListParams) => {
    if (params?.category === 'incident') return [EVENTS[2]]
    if (params?.subject_type === 'plant' && params.since === '2026-06-20' && params.before_timestamp === '2026-06-21') {
      return [EVENTS[2]]
    }
    return EVENTS
  })
}

describe('ActivityPage', () => {
  beforeEach(() => {
    mockActivityResponses()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads and renders the activity feed', async () => {
    renderActivityPage()

    expect(screen.getByRole('heading', { name: 'Activity' })).toBeInTheDocument()
    expect(screen.getByText('Loading activity')).toBeInTheDocument()

    expect(await screen.findByText('Completed morning watering for container tomatoes.')).toBeInTheDocument()
    expect(screen.getByText('Flagged aphid pressure on kale starts.')).toBeInTheDocument()
    expect(screen.getByText('4 events')).toBeInTheDocument()
    expect(listActivity).toHaveBeenCalledWith({ limit: 20 })
  })

  it('requests activity filtered by category and resets filters', async () => {
    renderActivityPage()

    await screen.findByText('Completed morning watering for container tomatoes.')

    await userEvent.click(screen.getByRole('button', { name: 'Category' }))
    await userEvent.click(screen.getByRole('option', { name: 'incident' }))

    expect(screen.queryByRole('listbox', { name: 'Category' })).not.toBeInTheDocument()
    await waitFor(() => expect(listActivity).toHaveBeenLastCalledWith({ category: 'incident', limit: 20 }))
    expect(await screen.findByText('Flagged aphid pressure on kale starts.')).toBeInTheDocument()
    expect(screen.queryByText('Completed morning watering for container tomatoes.')).not.toBeInTheDocument()
    expect(screen.getByText('1 events')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

    await waitFor(() => expect(listActivity).toHaveBeenLastCalledWith({ limit: 20 }))
    expect(await screen.findByText('Completed morning watering for container tomatoes.')).toBeInTheDocument()
    expect(screen.getByText('4 events')).toBeInTheDocument()
  })

  it('requests activity filtered by subject and date bounds', async () => {
    renderActivityPage()

    await screen.findByText('Completed morning watering for container tomatoes.')

    await userEvent.click(screen.getByRole('button', { name: 'Subject' }))
    await userEvent.click(screen.getByRole('option', { name: 'plant' }))
    await userEvent.click(screen.getByRole('button', { name: 'Since' }))
    await userEvent.click(screen.getByRole('button', { name: 'Since 06/20/2026' }))
    expect(screen.queryByRole('dialog', { name: 'Since calendar' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Before' }))
    await userEvent.click(screen.getByRole('button', { name: 'Before 06/21/2026' }))
    expect(screen.queryByRole('dialog', { name: 'Before calendar' })).not.toBeInTheDocument()

    await waitFor(() =>
      expect(listActivity).toHaveBeenLastCalledWith({
        subject_type: 'plant',
        since: '2026-06-20',
        before_timestamp: '2026-06-21',
        limit: 20,
      }),
    )
    expect(await screen.findByText('Flagged aphid pressure on kale starts.')).toBeInTheDocument()
    expect(screen.queryByText('Updated cherry tomato transplant status.')).not.toBeInTheDocument()
    expect(screen.getByText('1 events')).toBeInTheDocument()
  })

  it('shows date filter errors and does not request an invalid date range', async () => {
    renderActivityPage()

    await screen.findByText('Completed morning watering for container tomatoes.')

    await userEvent.click(screen.getByRole('button', { name: 'Since' }))
    await userEvent.click(screen.getByRole('button', { name: 'Since 06/20/2026' }))
    await waitFor(() => expect(listActivity).toHaveBeenLastCalledWith({ since: '2026-06-20', limit: 20 }))
    const callsBeforeInvalidRange = vi.mocked(listActivity).mock.calls.length

    await userEvent.click(screen.getByRole('button', { name: 'Before' }))
    await userEvent.click(screen.getByRole('button', { name: 'Before 06/19/2026' }))

    expect(await screen.findByText('Before must be after since.')).toBeInTheDocument()
    expect(listActivity).toHaveBeenCalledTimes(callsBeforeInvalidRange)
  })

  it('shows an error state with retry when activity loading fails', async () => {
    vi.mocked(listActivity).mockRejectedValueOnce(new Error('network down')).mockResolvedValueOnce(EVENTS)

    renderActivityPage()

    expect(await screen.findByText('Activity could not load')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Completed morning watering for container tomatoes.')).toBeInTheDocument()
    expect(listActivity).toHaveBeenCalledTimes(2)
  })

  it('shows an empty state when there are no activity events', async () => {
    vi.mocked(listActivity).mockResolvedValue([])

    renderActivityPage()

    expect(await screen.findByText('No activity found')).toBeInTheDocument()
  })
})

describe('getFilterErrors', () => {
  it('rejects future since dates and since dates after before dates', () => {
    expect(
      getFilterErrors(
        { category: '', eventType: '', subjectType: '', since: '2026-06-25', before: '' },
        '2026-06-21',
      ),
    ).toEqual({ since: 'Since cannot be in the future.' })

    expect(
      getFilterErrors(
        { category: '', eventType: '', subjectType: '', since: '2026-06-20', before: '2026-06-17' },
        '2026-06-21',
      ),
    ).toEqual({ before: 'Before must be after since.' })
  })
})
