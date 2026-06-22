import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import type { ThreadView } from '@/lib/types/rhizome'
import RhizomePage from './RhizomePage'

const mocks = vi.hoisted(() => ({
  getThread: vi.fn(),
  listThreads: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('@/lib/api/chat', () => ({
  getThread: mocks.getThread,
  listThreads: mocks.listThreads,
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

describe('RhizomePage', () => {
  beforeEach(() => {
    mocks.listThreads.mockResolvedValue(THREADS)
    mocks.getThread.mockResolvedValue(THREADS[0])
    mocks.useAuth.mockReturnValue({
      user: { preferred_provider: 'openai', preferred_model: 'gpt-4.1' },
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
    expect(screen.getByText('Start a thread when you are ready.')).toBeInTheDocument()
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

  it('uses the selected thread from the recent-thread list', async () => {
    renderRhizome('/app/rhizome/thread-1')

    expect(await screen.findByRole('button', { name: 'Tomato care plan' })).toBeInTheDocument()
    expect(screen.getByText('openai · gpt-4.1')).toBeInTheDocument()
    expect(screen.getByText('Conversation selected.')).toBeInTheDocument()
    expect(mocks.getThread).not.toHaveBeenCalled()
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

  it('falls back to a neutral model label when session has no preferred model', async () => {
    mocks.useAuth.mockReturnValue({ user: { preferred_provider: null, preferred_model: null } })
    renderRhizome()

    expect(await screen.findByText('Model not set')).toBeInTheDocument()
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
})
