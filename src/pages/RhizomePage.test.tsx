import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import type { InteractionEnvelopeView, ThreadView } from '@/lib/types/rhizome'
import RhizomePage from './RhizomePage'

const mocks = vi.hoisted(() => ({
  addThreadContext: vi.fn(),
  createThread: vi.fn(),
  getThread: vi.fn(),
  getThreadMessages: vi.fn(),
  getThreadSessionContext: vi.fn(),
  getPendingInteraction: vi.fn(),
  getLatestWeather: vi.fn(),
  getLatestTriage: vi.fn(),
  listTasksDaily: vi.fn(),
  listThreads: vi.fn(),
  removeThreadContext: vi.fn(),
  search: vi.fn(),
  streamChat: vi.fn(),
  streamResume: vi.fn(),
  updateThreadSessionContext: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('@/lib/api/chat', () => ({
  addThreadContext: mocks.addThreadContext,
  createThread: mocks.createThread,
  getThread: mocks.getThread,
  getThreadMessages: mocks.getThreadMessages,
  getThreadSessionContext: mocks.getThreadSessionContext,
  listThreads: mocks.listThreads,
  removeThreadContext: mocks.removeThreadContext,
  streamChat: mocks.streamChat,
  streamResume: mocks.streamResume,
  updateThreadSessionContext: mocks.updateThreadSessionContext,
}))

vi.mock('@/lib/api/interactions', () => ({
  getPendingInteraction: mocks.getPendingInteraction,
}))

vi.mock('@/lib/api/weather', () => ({
  getLatestWeather: mocks.getLatestWeather,
}))

vi.mock('@/lib/api/triage', () => ({
  getLatestTriage: mocks.getLatestTriage,
}))

vi.mock('@/lib/api/tasks', () => ({
  listTasksDaily: mocks.listTasksDaily,
}))

vi.mock('@/lib/api/search', () => ({
  search: mocks.search,
}))

vi.mock('@/lib/auth/context', () => ({
  useAuth: mocks.useAuth,
}))

const THREADS: ThreadView[] = [
  {
    thread_id: 'thread-1',
    title: 'Tomato care plan',
    last_message_preview: 'Check the porch tomatoes after the heat wave.',
    last_active_at: '2026-06-21T17:30:00Z',
    message_count: 4,
    pinned_context: [],
    created_at: '2026-06-21T17:00:00Z',
  },
  {
    thread_id: 'thread-2',
    title: 'Kale aphid follow-up',
    last_message_preview: 'The kale starts need another inspection.',
    message_count: 1,
    pinned_context: [],
    created_at: '2026-06-20T12:00:00Z',
  },
  {
    thread_id: 'thread-3',
    title: 'Porch basil watering',
    last_message_preview: 'Keep the porch basil out of the heat.',
    message_count: 2,
    pinned_context: [],
    created_at: '2026-06-19T12:00:00Z',
  },
  {
    thread_id: 'thread-4',
    title: 'Rosemary container plan',
    last_message_preview: 'Repotting can wait until the weekend.',
    message_count: 3,
    pinned_context: [],
    created_at: '2026-06-18T12:00:00Z',
  },
]

const PENDING_INTERACTION: InteractionEnvelopeView = {
  id: 'interaction-1',
  interaction_type: 'weather_change_review',
  status: 'pending',
  title: 'Review watering changes',
  summary: 'Rain is likely tonight, so Rhizome wants to skip porch watering.',
  body: 'Approve this to update the task plan.',
  sections: [{ title: 'Rain window', summary: '9 PM to 2 AM' }],
  actions: [
    { id: 'request_revision', label: 'Request Revision', kind: 'revise', style_hint: 'secondary' },
    { id: 'reject', label: 'Reject', kind: 'reject', style_hint: 'danger' },
    { id: 'confirm', label: 'Approve', kind: 'confirm', style_hint: 'primary' },
  ],
  context: {},
  created_at: '2026-06-21T18:00:00Z',
}

function renderRhizome(path = '/app/rhizome') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/app/rhizome" element={<RhizomePage />} />
          <Route path="/app/rhizome/:threadId" element={<RhizomePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function* streamEvents(events: Array<{ type: string; content?: string; payload?: unknown }>) {
  for (const event of events) yield event
}

async function* failedStream() {
  throw new Error('stream unavailable')
  yield { type: 'done' }
}

describe('RhizomePage', () => {
  beforeEach(() => {
    mocks.createThread.mockResolvedValue({ thread_id: 'thread-new' })
    mocks.addThreadContext.mockResolvedValue(undefined)
    mocks.listThreads.mockResolvedValue(THREADS)
    mocks.getThread.mockResolvedValue(THREADS[0])
    mocks.getPendingInteraction.mockResolvedValue(null)
    mocks.getLatestWeather.mockResolvedValue({
      id: 'weather-1',
      created_at: '2026-06-22T12:00:00Z',
      location_label: 'Test garden',
      timezone: 'America/Los_Angeles',
      forecast_start_date: '2026-06-22',
      forecast_end_date: '2026-06-29',
      conditions_summary: '2026-06-22: high 78.0F-equivalent, low 58.0F-equivalent, rain 0.0mm, wind 10.0.',
      alerts_summary: 'No weather alerts.',
      derived_impacts: [],
      recommended_actions: [],
    })
    mocks.getLatestTriage.mockResolvedValue({
      id: 'triage-1',
      created_at: '2026-06-22T13:00:00Z',
      reasoning_summary: 'Check tomatoes first.',
      urgent_tasks: [
        {
          id: 'task-1',
          project_id: 'project-1',
          title: 'Check tomato leaves',
          type: 'inspection',
          status: 'pending',
          priority: 'high',
          estimated_minutes: 10,
          is_user_modified: false,
          created_at: '2026-06-22T13:00:00Z',
          urgency: 'urgent',
        },
      ],
      routine_tasks: [
        {
          id: 'task-2',
          project_id: 'project-1',
          title: 'Water porch basil',
          type: 'watering',
          status: 'pending',
          priority: 'medium',
          estimated_minutes: 5,
          is_user_modified: false,
          created_at: '2026-06-22T13:00:00Z',
          urgency: 'routine',
        },
      ],
      project_tasks: [],
    })
    mocks.listTasksDaily.mockResolvedValue([])
    mocks.getThreadMessages.mockResolvedValue({
      thread_id: 'thread-1',
      messages: [
        { role: 'user', content: 'Can you help with the tomatoes?', type: 'human' },
        { role: 'assistant', content: 'Check moisture before the afternoon heat.', type: 'ai' },
      ],
    })
    mocks.getThreadSessionContext.mockResolvedValue({
      available_minutes: 45,
      energy_level: 'medium',
      focus_project_id: 'project-1',
      focus_label: 'Seedlings',
      preferred_location_type: 'bed',
      open_to_outdoor_work: true,
      wants_quick_wins: false,
      source: 'inferred',
      updated_at: '2026-06-21T18:00:00Z',
    })
    mocks.updateThreadSessionContext.mockResolvedValue({
      available_minutes: 30,
      energy_level: 'high',
      focus_project_id: 'project-1',
      focus_label: 'Seedlings',
      preferred_location_type: 'container',
      open_to_outdoor_work: false,
      wants_quick_wins: true,
      source: 'user',
      updated_at: '2026-06-21T18:30:00Z',
    })
    mocks.useAuth.mockReturnValue({
      user: { preferred_provider: 'openai', preferred_model: 'gpt-4.1' },
    })
    mocks.streamChat.mockImplementation(() =>
      streamEvents([
        { type: 'token', content: 'Check ' },
        { type: 'token', content: 'soil moisture.' },
        { type: 'done' },
      ]),
    )
    mocks.streamResume.mockImplementation(() =>
      streamEvents([
        { type: 'token', content: 'Decision saved.' },
        { type: 'done' },
      ]),
    )
    mocks.removeThreadContext.mockResolvedValue(undefined)
    mocks.search.mockResolvedValue({
      results: [
        {
          subject_type: 'plant',
          subject_id: 'plant-1',
          label: 'Cherry Tomato',
          secondary_label: 'Growbag A',
        },
      ],
      by_type: { plant: 1 },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows a blank new-thread state without creating a thread', async () => {
    mocks.listThreads.mockResolvedValue([])
    renderRhizome()

    expect(screen.getByRole('heading', { name: 'Ask Rhizome' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Threads' })).not.toBeInTheDocument()
    expect(await screen.findByText('Before we start')).toBeInTheDocument()
    expect(screen.getByText('Start a thread when you are ready.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Session context')).not.toBeInTheDocument()
    expect(await screen.findByLabelText('78 degrees Fahrenheit')).toBeInTheDocument()
    expect(await screen.findByText('0.0mm')).toBeInTheDocument()
    expect(await screen.findByText('10.0 mph')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Browse threads' }))
    expect(await screen.findByRole('heading', { name: 'Threads' })).toBeInTheDocument()
    expect(screen.getByText('No threads yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Send/i })).toBeDisabled()
    expect(mocks.listThreads).toHaveBeenCalledWith({ limit: 20 })
    expect(mocks.getThread).not.toHaveBeenCalled()
  })

  it('renders recent threads in the blank state and opens the thread navigator', async () => {
    renderRhizome()

    expect(await screen.findByRole('link', { name: /Tomato care plan/i })).toHaveAttribute(
      'href',
      '/app/rhizome/thread-1',
    )
    expect(screen.getByRole('link', { name: /Kale aphid follow-up/i })).toHaveAttribute(
      'href',
      '/app/rhizome/thread-2',
    )
    expect(screen.getByRole('link', { name: /Porch basil watering/i })).toHaveAttribute(
      'href',
      '/app/rhizome/thread-3',
    )
    expect(screen.queryByRole('link', { name: /Rosemary container plan/i })).not.toBeInTheDocument()
    expect(screen.getByText('Check the porch tomatoes after the heat wave.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Look through more threads' }))
    expect(await screen.findByRole('heading', { name: 'Threads' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /New thread/i })).toHaveAttribute(
      'href',
      '/app/rhizome',
    )
    expect(screen.getByRole('link', { name: /Rosemary container plan/i })).toHaveAttribute(
      'href',
      '/app/rhizome/thread-4',
    )
  })

  it('renders today shortlist and seeds the composer from a task', async () => {
    const user = userEvent.setup()
    renderRhizome()

    expect(await screen.findByLabelText("Today's task shortlist")).toBeInTheDocument()
    expect(await screen.findByText('From latest triage')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Check tomato leaves/i }))

    expect(screen.getByLabelText('Message Rhizome')).toHaveValue(
      'Can you help me handle this task today: Check tomato leaves?',
    )
  })

  it('uses the page-level new button to return to a blank thread', async () => {
    renderRhizome('/app/rhizome/thread-1')

    await userEvent.click(screen.getByRole('button', { name: 'New' }))
    expect(await screen.findByText('Start a thread when you are ready.')).toBeInTheDocument()
  })

  it('sends blank-thread starter context without changing the visible composer message', async () => {
    const user = userEvent.setup()
    mocks.listThreads.mockResolvedValue([])
    mocks.getThreadMessages.mockResolvedValue({ thread_id: 'thread-new', messages: [] })
    renderRhizome()

    await user.click(await screen.findByRole('button', { name: 'Plan' }))
    expect(screen.getByLabelText('Message Rhizome')).toHaveValue(
      'Help me plan the next useful step for my garden today.',
    )

    await user.clear(screen.getByLabelText('Start time today'))
    await user.type(screen.getByLabelText('Start time today'), '20 minutes')
    await user.type(screen.getByLabelText('Start energy'), 'low but focused')
    expect(screen.queryByText(/For this thread/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() =>
      expect(mocks.streamChat).toHaveBeenCalledWith(
        'thread-new',
        'For this thread, I have 20 minutes, my energy is low but focused.\n\nHelp me plan the next useful step for my garden today.',
        expect.any(AbortSignal),
      ),
    )
    expect(await screen.findByText('Help me plan the next useful step for my garden today.')).toBeInTheDocument()
    expect(screen.queryByText(/For this thread, I have 20 minutes/)).not.toBeInTheDocument()
  })

  it('adds free-text blank-thread focus to the hidden first-send context', async () => {
    const user = userEvent.setup()
    mocks.listThreads.mockResolvedValue([])
    mocks.getThreadMessages.mockResolvedValue({ thread_id: 'thread-new', messages: [] })
    renderRhizome()

    await user.type(await screen.findByLabelText('Thread focus'), 'autumn flower bed')
    await user.type(screen.getByLabelText('Message Rhizome'), 'What should I do first?')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() =>
      expect(mocks.streamChat).toHaveBeenCalledWith(
        'thread-new',
        'For this thread, my focus is autumn flower bed.\n\nWhat should I do first?',
        expect.any(AbortSignal),
      ),
    )
    expect(screen.queryByText(/For this thread, my focus is autumn flower bed/)).not.toBeInTheDocument()
  })

  it('selects blank-thread focus from autocomplete and uses it in hidden first-send context', async () => {
    const user = userEvent.setup()
    mocks.listThreads.mockResolvedValue([])
    mocks.getThreadMessages.mockResolvedValue({ thread_id: 'thread-new', messages: [] })
    renderRhizome()

    await user.type(await screen.findByLabelText('Thread focus'), 'tomato')
    await user.click(await screen.findByRole('button', { name: /Cherry Tomato/i }))

    expect(screen.getByText('plant')).toBeInTheDocument()
    expect(screen.getByText('Cherry Tomato')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cherry Tomato/i })).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Message Rhizome'), 'What should I do first?')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() =>
      expect(mocks.streamChat).toHaveBeenCalledWith(
        'thread-new',
        'For this thread, my focus is Cherry Tomato (plant).\n\nWhat should I do first?',
        expect.any(AbortSignal),
      ),
    )
  })

  it('uses the selected thread from the recent-thread list', async () => {
    renderRhizome('/app/rhizome/thread-1')

    expect(await screen.findByRole('button', { name: 'Tomato care plan' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Model' })).toHaveTextContent('openai · gpt-4.1')
    expect(screen.getByRole('button', { name: 'Model' })).toBeDisabled()
    expect(await screen.findByText('Can you help with the tomatoes?')).toBeInTheDocument()
    expect(screen.getByText('Check moisture before the afternoon heat.')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getAllByText('Rhizome').length).toBeGreaterThan(0)
    expect(mocks.getThread).not.toHaveBeenCalled()
    expect(mocks.getThreadMessages).toHaveBeenCalledWith('thread-1')
  })

  it('renders dedicated session context for the active thread', async () => {
    renderRhizome('/app/rhizome/thread-1')

    const sessionContext = await screen.findByLabelText('Session context')
    expect(await within(sessionContext).findByText('45 minutes')).toBeInTheDocument()
    expect(within(sessionContext).getByText('Medium')).toBeInTheDocument()
    expect(within(sessionContext).getByText('Seedlings')).toBeInTheDocument()
    expect(within(sessionContext).getByText('Inferred')).toBeInTheDocument()
    expect(mocks.getThreadSessionContext).toHaveBeenCalledWith('thread-1')
  })

  it('saves editable session context through the dedicated endpoint', async () => {
    const user = userEvent.setup()
    renderRhizome('/app/rhizome/thread-1')

    await user.click(await screen.findByRole('button', { name: 'Edit time today' }))
    await user.clear(screen.getByLabelText('Time today'))
    await user.type(screen.getByLabelText('Time today'), '30')
    await user.selectOptions(screen.getByLabelText('Energy'), 'high')
    await user.selectOptions(screen.getByLabelText('Preferred location'), 'container')
    await user.click(screen.getByLabelText('Outdoor work'))
    await user.click(screen.getByLabelText('Quick wins'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(mocks.updateThreadSessionContext).toHaveBeenCalledWith('thread-1', {
        available_minutes: 30,
        energy_level: 'high',
        preferred_location_type: 'container',
        open_to_outdoor_work: false,
        wants_quick_wins: true,
        focus_project_id: 'project-1',
      }),
    )
    expect(await screen.findByText('User set')).toBeInTheDocument()
    expect(screen.getByText('30 minutes')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('persists selected project focus from the active session editor', async () => {
    const user = userEvent.setup()
    mocks.search.mockResolvedValue({
      results: [
        {
          subject_type: 'project',
          subject_id: 'project-2',
          label: 'Autumn Flower Bed',
          secondary_label: 'Planning',
        },
      ],
      by_type: { project: 1 },
    })
    renderRhizome('/app/rhizome/thread-1')

    await user.click(await screen.findByLabelText('Edit focus'))
    await user.click(screen.getByLabelText('Clear Project focus'))
    await user.type(screen.getByLabelText('Project focus'), 'autumn')
    await user.click(await screen.findByRole('button', { name: /Autumn Flower Bed/i }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(mocks.updateThreadSessionContext).toHaveBeenCalledWith(
        'thread-1',
        expect.objectContaining({ focus_project_id: 'project-2' }),
      ),
    )
  })

  it('dismisses focus autocomplete on outside click and reopens only after typing changes', async () => {
    const user = userEvent.setup()
    renderRhizome()

    const focusInput = await screen.findByLabelText('Thread focus')
    await user.type(focusInput, 'tom')
    expect(await screen.findByRole('button', { name: /Cherry Tomato/i })).toBeInTheDocument()

    await user.click(screen.getByText('Start a thread when you are ready.'))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Cherry Tomato/i })).not.toBeInTheDocument(),
    )

    await user.click(focusInput)
    expect(screen.queryByRole('button', { name: /Cherry Tomato/i })).not.toBeInTheDocument()

    await user.type(focusInput, 'a')
    expect(await screen.findByRole('button', { name: /Cherry Tomato/i })).toBeInTheDocument()
  })

  it('renders markdown styling in user and Rhizome messages', async () => {
    mocks.getThreadMessages.mockResolvedValue({
      thread_id: 'thread-1',
      messages: [
        { role: 'user', content: 'I have **clay soil**', type: 'human' },
        {
          role: 'assistant',
          content: 'Please confirm:\n\n* **Climate zone**\n* Last frost date',
          type: 'ai',
        },
      ],
    })

    renderRhizome('/app/rhizome/thread-1')

    const userStrongText = await screen.findByText('clay soil')
    expect(userStrongText.tagName).toBe('STRONG')

    const list = screen.getByText('Climate zone').closest('ul')
    expect(list).not.toBeNull()
    if (!list) return
    expect(within(list).getByText('Climate zone').tagName).toBe('STRONG')
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
  })

  it('loads the active thread when it is not in the recent-thread list', async () => {
    mocks.listThreads.mockResolvedValue([THREADS[1]])
    mocks.getThread.mockResolvedValue({
      ...THREADS[0],
      title: 'Loaded thread from route',
    })

    renderRhizome('/app/rhizome/thread-1')

    await waitFor(() => expect(mocks.getThread).toHaveBeenCalledWith('thread-1'))
    expect(
      await screen.findByRole('button', { name: 'Loaded thread from route' }),
    ).toBeInTheDocument()
  })

  it('shows an empty message state for an empty thread', async () => {
    mocks.getThreadMessages.mockResolvedValue({ thread_id: 'thread-1', messages: [] })

    renderRhizome('/app/rhizome/thread-1')

    expect(await screen.findByText('No messages in this thread yet.')).toBeInTheDocument()
  })

  it('ignores blank and non-chat history messages', async () => {
    mocks.getThreadMessages.mockResolvedValue({
      thread_id: 'thread-1',
      messages: [
        { role: 'assistant', content: '   ', type: 'ai' },
        { role: 'assistant', content: 'Error: no garden profile found.', type: 'tool' },
      ],
    })

    renderRhizome('/app/rhizome/thread-1')

    expect(await screen.findByText('No messages in this thread yet.')).toBeInTheDocument()
    expect(screen.queryByText('Error: no garden profile found.')).not.toBeInTheDocument()
  })

  it('shows a retry state when message history fails', async () => {
    mocks.getThreadMessages
      .mockRejectedValueOnce(new Error('history unavailable'))
      .mockResolvedValueOnce({
        thread_id: 'thread-1',
        messages: [{ role: 'assistant', content: 'Recovered message history.', type: 'ai' }],
      })

    renderRhizome('/app/rhizome/thread-1')

    expect(await screen.findByText('Message history could not load.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('Recovered message history.')).toBeInTheDocument()
  })

  it('falls back to a neutral model label when session has no preferred model', async () => {
    mocks.useAuth.mockReturnValue({ user: { preferred_provider: null, preferred_model: null } })
    renderRhizome()

    expect(await screen.findByRole('button', { name: 'Model' })).toHaveTextContent('Model not set')
    expect(screen.getByRole('button', { name: 'Model' })).toBeDisabled()
  })

  it('opens and closes the thread navigator from the selected thread title', async () => {
    renderRhizome('/app/rhizome/thread-1')

    expect(screen.queryByRole('heading', { name: 'Threads' })).not.toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: 'Tomato care plan' }))
    expect(await screen.findByRole('heading', { name: 'Threads' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Collapse threads panel' }))
    expect(screen.queryByRole('heading', { name: 'Threads' })).not.toBeInTheDocument()
  })

  it('does not render the reviews panel when there is no review content', async () => {
    renderRhizome()

    expect(await screen.findByText('Start a thread when you are ready.')).toBeInTheDocument()
    expect(screen.queryByText('No pending approvals')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Collapse reviews panel' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Open pending reviews' })).not.toBeInTheDocument()
  })

  it('opens the interaction panel from a streamed approval and resumes with notes', async () => {
    const user = userEvent.setup()
    mocks.streamChat.mockImplementationOnce(() =>
      streamEvents([
        { type: 'token', content: 'I need your approval first.' },
        { type: 'interaction', payload: PENDING_INTERACTION },
      ]),
    )

    renderRhizome('/app/rhizome/thread-1')

    await user.type(await screen.findByLabelText('Message Rhizome'), 'Adjust watering')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByRole('complementary', { name: 'Pending Rhizome reviews' })).toBeInTheDocument()
    expect(screen.getByText('Review watering changes')).toBeInTheDocument()
    expect(screen.getByText('Rain is likely tonight, so Rhizome wants to skip porch watering.')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Decision notes'), 'Still water the basil.')
    await user.click(screen.getByRole('button', { name: 'Approve' }))

    await waitFor(() =>
      expect(mocks.streamResume).toHaveBeenCalledWith(
        'thread-1',
        'confirm\n\nNotes: Still water the basil.',
        expect.any(AbortSignal),
      ),
    )
    expect(await screen.findByText('Decision saved.')).toBeInTheDocument()
  })

  it('adds and removes pinned context through the thread context section', async () => {
    const user = userEvent.setup()
    renderRhizome('/app/rhizome/thread-1')

    await user.click(screen.getByRole('button', { name: 'Add pinned context' }))
    expect(await screen.findByLabelText('Pinned context for this thread')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Search Pinned context for this thread'), 'tom')
    expect(await screen.findByRole('button', { name: /Cherry Tomato/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Cherry Tomato/i }))

    await waitFor(() =>
      expect(mocks.addThreadContext).toHaveBeenCalledWith('thread-1', {
        subject_type: 'plant',
        subject_id: 'plant-1',
        label: 'Cherry Tomato',
      }),
    )
    expect(await screen.findByText('Cherry Tomato')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove Cherry Tomato context' }))
    await waitFor(() =>
      expect(mocks.removeThreadContext).toHaveBeenCalledWith('thread-1', 'plant', 'plant-1'),
    )
    expect(screen.getByLabelText('Pinned context for this thread')).not.toHaveTextContent('Cherry Tomato')
  })

  it('normalizes plural and batch context prefixes before searching', async () => {
    const user = userEvent.setup()
    renderRhizome('/app/rhizome/thread-1')

    await user.click(screen.getByRole('button', { name: 'Add pinned context' }))
    await user.type(screen.getByLabelText('Search Pinned context for this thread'), 'batches:cos')

    await waitFor(() =>
      expect(mocks.search).toHaveBeenLastCalledWith({ q: 'cos', types: 'batch', limit: 8 }),
    )
  })

  it('only removes context when the chip remove button is clicked', async () => {
    const user = userEvent.setup()
    const threadWithContext = {
      ...THREADS[0],
      pinned_context: [
        { subject_type: 'plant', subject_id: 'plant-1', label: 'Cherry Tomato' },
        { subject_type: 'task', subject_id: 'task-1', label: 'Stake tomatoes' },
      ],
    }
    mocks.listThreads.mockResolvedValue([threadWithContext])
    mocks.getThread.mockResolvedValue(threadWithContext)
    renderRhizome('/app/rhizome/thread-1')

    const contextSection = await screen.findByLabelText('Pinned context for this thread')
    await user.click(within(contextSection).getByText('Stake tomatoes'))
    expect(mocks.removeThreadContext).not.toHaveBeenCalled()

    await user.click(within(contextSection).getByRole('button', { name: 'Remove Stake tomatoes context' }))
    await waitFor(() =>
      expect(mocks.removeThreadContext).toHaveBeenCalledWith('thread-1', 'task', 'task-1'),
    )
  })

  it('adds message context from composer keyword notation', async () => {
    const user = userEvent.setup()
    mocks.search.mockResolvedValue({
      results: [
        {
          subject_type: 'plant',
          subject_id: 'plant-1',
          label: 'Cherry Tomato (Sungold)',
          secondary_label: 'growbag_1',
        },
        {
          subject_type: 'plant',
          subject_id: 'plant-2',
          label: 'Cherry Tomato (Sungold)',
          secondary_label: 'growbag_2',
        },
      ],
      by_type: { plant: 2 },
    })
    renderRhizome('/app/rhizome/thread-1')

    const composer = screen.getByLabelText('Message Rhizome')
    await user.type(composer, 'Can you check plant:tom')
    await waitFor(() =>
      expect(mocks.search).toHaveBeenLastCalledWith({ q: 'tom', types: 'plant', limit: 8 }),
    )

    await user.click(await screen.findByRole('button', { name: /growbag_1/i }))

    expect(await screen.findByText('Cherry Tomato (Sungold)')).toBeInTheDocument()
    expect(composer).toHaveValue('Can you check')
    expect(mocks.addThreadContext).not.toHaveBeenCalled()

    await user.type(composer, ' plant:tom')

    expect(await screen.findByRole('button', { name: /growbag_2/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /growbag_1/i })).not.toBeInTheDocument()
  })

  it('dismisses composer keyword autocomplete until the token changes', async () => {
    const user = userEvent.setup()
    renderRhizome('/app/rhizome/thread-1')

    const composer = screen.getByLabelText('Message Rhizome')
    await user.type(composer, 'Can you check plant:tom')
    expect(await screen.findByRole('button', { name: /Cherry Tomato/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tomato care plan' }))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Cherry Tomato/i })).not.toBeInTheDocument(),
    )

    await user.click(composer)
    expect(screen.queryByRole('button', { name: /Cherry Tomato/i })).not.toBeInTheDocument()

    await user.type(composer, 'a')
    expect(await screen.findByRole('button', { name: /Cherry Tomato/i })).toBeInTheDocument()
  })

  it('adds local message context without sending it as thread context', async () => {
    const user = userEvent.setup()
    mocks.listThreads.mockResolvedValue([])
    mocks.getThreadMessages.mockResolvedValue({ thread_id: 'thread-new', messages: [] })
    renderRhizome()

    await user.click(screen.getByRole('button', { name: 'Add message context' }))
    expect(await screen.findByLabelText('Message context')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Search Message context'), 'plant:tom')
    await user.click(await screen.findByRole('button', { name: /Cherry Tomato/i }))
    expect(await screen.findByText('Cherry Tomato')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Message Rhizome'), 'How is this plant doing?')
    await user.click(screen.getByRole('button', { name: /Send/i }))

    await waitFor(() =>
      expect(mocks.createThread).toHaveBeenCalledWith({}),
    )
    expect(mocks.addThreadContext).not.toHaveBeenCalled()
  })

  it('creates a thread on first send and renders the streamed response', async () => {
    const user = userEvent.setup()
    mocks.listThreads.mockResolvedValue([])
    mocks.getThreadMessages.mockResolvedValue({ thread_id: 'thread-new', messages: [] })
    renderRhizome()

    await user.type(screen.getByLabelText('Message Rhizome'), 'What should I do today?')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(mocks.createThread).toHaveBeenCalledWith({})
    await waitFor(() =>
      expect(mocks.streamChat).toHaveBeenCalledWith(
        'thread-new',
        'What should I do today?',
        expect.any(AbortSignal),
      ),
    )
    expect(await screen.findByText('What should I do today?')).toBeInTheDocument()
    expect(await screen.findByText('Check soil moisture.')).toBeInTheDocument()
  })

  it('streams into an existing thread without creating a new thread', async () => {
    const user = userEvent.setup()
    renderRhizome('/app/rhizome/thread-1')

    await user.type(await screen.findByLabelText('Message Rhizome'), 'How are the tomatoes?')
    await user.keyboard('{Enter}')

    expect(mocks.createThread).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(mocks.streamChat).toHaveBeenCalledWith(
        'thread-1',
        'How are the tomatoes?',
        expect.any(AbortSignal),
      ),
    )
    expect(await screen.findByText('How are the tomatoes?')).toBeInTheDocument()
    expect(await screen.findByText('Check soil moisture.')).toBeInTheDocument()
  })

  it('shows a retry control when streaming fails', async () => {
    const user = userEvent.setup()
    mocks.streamChat
      .mockImplementationOnce(() => failedStream())
      .mockImplementationOnce(() => streamEvents([{ type: 'token', content: 'Recovered.' }, { type: 'done' }]))

    renderRhizome('/app/rhizome/thread-1')

    await user.type(await screen.findByLabelText('Message Rhizome'), 'Try this')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Connection failed - try again.')
    const sessionStrip = screen.getByLabelText('Session context')
    expect(alert.compareDocumentPosition(sessionStrip)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Recovered.')).toBeInTheDocument()
    expect(mocks.streamChat).toHaveBeenCalledTimes(2)
  })
})
