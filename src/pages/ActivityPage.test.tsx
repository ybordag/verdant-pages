import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { listActivity } from '@/lib/api/activity'
import type { ActivityEventView } from '@/lib/types/rhizome'
import ActivityPage from './ActivityPage'

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

describe('ActivityPage', () => {
  beforeEach(() => {
    vi.mocked(listActivity).mockResolvedValue(EVENTS)
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

  it('filters sample events by category and resets filters', async () => {
    renderActivityPage()

    await screen.findByText('Completed morning watering for container tomatoes.')

    await userEvent.selectOptions(screen.getByLabelText('Category'), 'incident')

    expect(screen.getByText('Flagged aphid pressure on kale starts.')).toBeInTheDocument()
    expect(screen.queryByText('Completed morning watering for container tomatoes.')).not.toBeInTheDocument()
    expect(screen.getByText('1 events')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByText('Completed morning watering for container tomatoes.')).toBeInTheDocument()
    expect(screen.getByText('4 events')).toBeInTheDocument()
  })

  it('filters sample events by subject and date bounds', async () => {
    renderActivityPage()

    await screen.findByText('Completed morning watering for container tomatoes.')

    await userEvent.selectOptions(screen.getByLabelText('Subject'), 'plant')
    await userEvent.type(screen.getByLabelText('Since'), '2026-06-20')
    await userEvent.type(screen.getByLabelText('Before'), '2026-06-21')

    expect(screen.getByText('Flagged aphid pressure on kale starts.')).toBeInTheDocument()
    expect(screen.queryByText('Updated cherry tomato transplant status.')).not.toBeInTheDocument()
    expect(screen.getByText('1 events')).toBeInTheDocument()
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
