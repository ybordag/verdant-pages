import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import type { SessionContextView } from '@/lib/types/rhizome'
import useSessionContext from './useSessionContext'

const mocks = vi.hoisted(() => ({
  getThreadSessionContext: vi.fn(),
  search: vi.fn(),
  updateThreadSessionContext: vi.fn(),
}))

vi.mock('@/lib/api/chat', () => ({
  getThreadSessionContext: mocks.getThreadSessionContext,
  updateThreadSessionContext: mocks.updateThreadSessionContext,
}))
vi.mock('@/lib/api/search', () => ({ search: mocks.search }))

const initialContext: SessionContextView = {
  time_text: '30 minutes',
  energy_text: 'steady',
  focus_text: null,
  focus_context: [],
  source: 'user',
  updated_at: '2026-07-10T12:00:00Z',
}

function wrapper({ children }: PropsWithChildren) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useSessionContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getThreadSessionContext.mockResolvedValue(initialContext)
    mocks.search.mockResolvedValue({
      results: [
        {
          subject_type: 'project',
          subject_id: 'project-1',
          label: 'Courtyard tomatoes',
        },
      ],
      by_type: { project: 1 },
    })
    mocks.updateThreadSessionContext.mockImplementation(
      async (_threadId: string, data: Record<string, unknown>) => ({
        ...initialContext,
        ...data,
      }),
    )
  })

  it('loads, edits, searches, and saves the dedicated session context contract', async () => {
    const { result } = renderHook(() => useSessionContext('thread-1', null), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.timeDisplay).toBe('30 minutes')

    act(() => result.current.startEditing())
    act(() => result.current.focus.changeTerm('tomato'))
    await waitFor(() => expect(result.current.focus.groups).toHaveLength(1))
    act(() => result.current.focus.select(result.current.focus.groups[0][1][0]))
    act(() => result.current.setDraft({ time_text: '15 minutes', energy_text: 'low but focused' }))
    act(() => result.current.save())

    await waitFor(() => expect(mocks.updateThreadSessionContext).toHaveBeenCalledOnce())
    expect(mocks.updateThreadSessionContext).toHaveBeenCalledWith('thread-1', {
      time_text: '15 minutes',
      energy_text: 'low but focused',
      focus_text: 'Courtyard tomatoes',
      focus_context: [{ subject_type: 'project', subject_id: 'project-1' }],
    })
    await waitFor(() => expect(result.current.isEditing).toBe(false))
  })

  it('uses optimistic startup labels only for their matching thread', async () => {
    mocks.getThreadSessionContext.mockResolvedValue({
      ...initialContext,
      time_text: null,
      energy_text: null,
      focus_text: null,
    })
    const optimistic = {
      threadId: 'thread-1',
      timeLabel: '45 minutes',
      energyLabel: 'low but focused',
      focusLabel: 'Tomato care',
    }
    const { result } = renderHook(() => useSessionContext('thread-1', optimistic), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasOptimisticContext).toBe(true)
    expect(result.current.timeDisplay).toBe('45 minutes')
    expect(result.current.energyDisplay).toBe('low but focused')
    expect(result.current.focusDisplay).toBe('Tomato care')
  })

  it('keeps failed edits recoverable and restores persisted values on cancel', async () => {
    mocks.updateThreadSessionContext.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useSessionContext('thread-1', null), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    act(() => result.current.startEditing())
    act(() => result.current.setDraft({ time_text: '5 minutes', energy_text: 'exhausted' }))
    act(() => result.current.save())

    await waitFor(() => expect(result.current.error).toBe('Session context could not be saved.'))
    expect(result.current.isEditing).toBe(true)

    act(() => result.current.cancelEditing())
    expect(result.current.isEditing).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.draft).toEqual({ time_text: '30 minutes', energy_text: 'steady' })
  })
})
