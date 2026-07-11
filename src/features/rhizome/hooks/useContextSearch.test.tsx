import { useState, type PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import type { ContextObject, ThreadView } from '@/lib/types/rhizome'
import useContextSearch from './useContextSearch'

const mocks = vi.hoisted(() => ({
  addThreadContext: vi.fn(),
  removeThreadContext: vi.fn(),
  search: vi.fn(),
}))

vi.mock('@/lib/api/chat', () => ({
  addThreadContext: mocks.addThreadContext,
  removeThreadContext: mocks.removeThreadContext,
}))
vi.mock('@/lib/api/search', () => ({ search: mocks.search }))

const tomatoResult = {
  subject_type: 'plant',
  subject_id: 'plant-1',
  label: 'Cherry tomato',
  secondary_label: 'growbag_1',
}

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return { client, Wrapper }
}

function renderContextSearch({
  initialDraft = '',
  isNewThread = true,
  pinnedContext = [],
  threadId,
}: {
  initialDraft?: string
  isNewThread?: boolean
  pinnedContext?: ContextObject[]
  threadId?: string
} = {}) {
  const { client, Wrapper } = createWrapper()
  const hook = renderHook(() => {
    const [draft, setDraft] = useState(initialDraft)
    return {
      draft,
      search: useContextSearch({ draft, isNewThread, pinnedContext, threadId, setDraft }),
    }
  }, { wrapper: Wrapper })
  return { ...hook, client }
}

describe('useContextSearch', () => {
  beforeEach(() => {
    mocks.search.mockResolvedValue({ results: [tomatoResult], by_type: { plant: 1 } })
    mocks.addThreadContext.mockResolvedValue(undefined)
    mocks.removeThreadContext.mockResolvedValue(undefined)
  })

  it('owns startup focus search and selection', async () => {
    const { result } = renderContextSearch()

    act(() => result.current.search.startFocus.changeTerm('tomato'))
    await waitFor(() => expect(result.current.search.startFocus.groups).toHaveLength(1))
    act(() => result.current.search.startFocus.select(tomatoResult))

    expect(result.current.search.startFocus.context).toEqual({
      subject_type: 'plant',
      subject_id: 'plant-1',
      label: 'Cherry tomato',
    })
    expect(result.current.search.startFocus.term).toBe('Cherry tomato')
  })

  it('replaces a composer token with one message-context object', async () => {
    const { result } = renderContextSearch({ initialDraft: 'Question plant:tomato' })
    const textarea = document.createElement('textarea')
    textarea.value = 'Question plant:tomato'
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    document.body.append(textarea)

    act(() => result.current.search.composer.updateSelection(textarea))
    await waitFor(() => expect(result.current.search.composer.groups).toHaveLength(1))
    act(() => result.current.search.composer.select(tomatoResult))

    expect(result.current.draft).toBe('Question')
    expect(result.current.search.messageContext).toEqual([
      { subject_type: 'plant', subject_id: 'plant-1', label: 'Cherry tomato' },
    ])
    textarea.remove()
  })

  it('adds pinned context and updates both thread caches', async () => {
    const thread: ThreadView = {
      thread_id: 'thread-1',
      message_count: 0,
      pinned_context: [],
      created_at: '2026-07-10T12:00:00Z',
    }
    const { result, client } = renderContextSearch({ isNewThread: false, threadId: 'thread-1' })
    client.setQueryData(['threads', { limit: 20 }], [thread])
    client.setQueryData(['threads', 'thread-1'], thread)

    act(() => result.current.search.openTarget('thread'))
    act(() => result.current.search.inlineProps('thread', []).onSearchTermChange('tomato'))
    await waitFor(() => expect(result.current.search.inlineProps('thread', []).groups).toHaveLength(1))
    act(() => result.current.search.inlineProps('thread', []).onSelect(tomatoResult))

    await waitFor(() => expect(mocks.addThreadContext).toHaveBeenCalledOnce())
    expect(mocks.addThreadContext).toHaveBeenCalledWith('thread-1', {
      subject_type: 'plant',
      subject_id: 'plant-1',
      label: 'Cherry tomato',
    })
    await waitFor(() => {
      const cached = client.getQueryData<ThreadView>(['threads', 'thread-1'])
      expect(cached?.pinned_context).toHaveLength(1)
    })
  })
})
