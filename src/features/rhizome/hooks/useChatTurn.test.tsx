import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import type { InteractionEnvelopeView } from '@/lib/types/rhizome'
import useChatTurn from './useChatTurn'

const mocks = vi.hoisted(() => ({
  createThread: vi.fn(),
  streamChat: vi.fn(),
  streamResume: vi.fn(),
  updateThreadSessionContext: vi.fn(),
}))

vi.mock('@/lib/api/chat', () => mocks)

const interaction: InteractionEnvelopeView = {
  id: 'interaction-1',
  interaction_type: 'weather_change_review',
  status: 'pending',
  title: 'Review watering',
  summary: 'Rain is expected.',
  sections: [],
  actions: [{ id: 'confirm', label: 'Approve', kind: 'confirm', style_hint: 'primary' }],
  context: {},
  created_at: '2026-07-10T12:00:00Z',
}

async function* events(items: Array<Record<string, unknown>>) {
  for (const item of items) yield item
}

function wrapper({ children }: PropsWithChildren) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <MemoryRouter>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </MemoryRouter>
  )
}

function renderChatTurn(threadId = 'thread-1') {
  const callbacks = {
    onInteraction: vi.fn(),
    onInteractionComplete: vi.fn(),
    onMessageAccepted: vi.fn(),
  }
  const hook = renderHook(
    ({ activeThreadId }) =>
      useChatTurn({
        threadId: activeThreadId,
        interactionNotes: 'Looks good',
        getStartupLabels: () => ({
          timeLabel: 'Not set',
          energyLabel: 'Not set',
          focusLabel: 'Not set',
        }),
        getStartupPayload: () => null,
        ...callbacks,
      }),
    { initialProps: { activeThreadId: threadId }, wrapper },
  )
  return { ...hook, callbacks }
}

describe('useChatTurn', () => {
  beforeEach(() => {
    mocks.createThread.mockResolvedValue({ thread_id: 'thread-new' })
    mocks.updateThreadSessionContext.mockResolvedValue({})
    mocks.streamChat.mockImplementation(() => events([{ type: 'done' }]))
    mocks.streamResume.mockImplementation(() => events([{ type: 'done' }]))
  })

  it('preserves partial output and marks a stream that closes without done as incomplete', async () => {
    mocks.streamChat.mockImplementation(() =>
      events([{ type: 'token', content: 'Partial answer' }]),
    )
    const { result } = renderChatTurn()

    await act(async () => result.current.submitMessage('Question'))

    expect(result.current.streamingText).toContain('Partial answer')
    expect(result.current.streamingText).toContain('Response may be incomplete.')
    expect(result.current.streamError).toBe('Connection dropped before Rhizome finished.')
  })

  it('pauses for an interaction and resumes the same thread with notes', async () => {
    mocks.streamChat.mockImplementation(() => events([{ type: 'interaction', payload: interaction }]))
    mocks.streamResume.mockImplementation(() =>
      events([{ type: 'token', content: 'Decision recorded.' }, { type: 'done' }]),
    )
    const { result, callbacks } = renderChatTurn()

    await act(async () => result.current.submitMessage('Should I skip watering?'))
    expect(callbacks.onInteraction).toHaveBeenCalledWith(interaction)
    expect(result.current.streamError).toBeNull()

    await act(async () => result.current.resumeInteraction(interaction.actions[0]))
    expect(mocks.streamResume).toHaveBeenCalledWith(
      'thread-1',
      'confirm\n\nNotes: Looks good',
      expect.any(AbortSignal),
    )
    expect(callbacks.onInteractionComplete).toHaveBeenCalledOnce()
    expect(result.current.pendingMessages.at(-1)?.content).toBe('Decision recorded.')
  })

  it('aborts the active stream when the selected thread changes', async () => {
    let capturedSignal: AbortSignal | undefined
    mocks.streamChat.mockImplementation((_threadId, _message, signal: AbortSignal) =>
      (async function* () {
        capturedSignal = signal
        await new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          setTimeout(resolve, 10_000)
        })
        yield { type: 'done' }
      })(),
    )
    const { result, rerender } = renderChatTurn()
    let request: Promise<void>
    act(() => {
      request = result.current.submitMessage('Long request')
    })
    await waitFor(() => expect(capturedSignal).toBeDefined())

    rerender({ activeThreadId: 'thread-2' })
    await act(async () => request)

    expect(capturedSignal?.aborted).toBe(true)
    expect(result.current.streamError).toBeNull()
  })

  it('aborts the active stream on unmount without showing a connection error', async () => {
    let capturedSignal: AbortSignal | undefined
    mocks.streamChat.mockImplementation((_threadId, _message, signal: AbortSignal) =>
      (async function* () {
        capturedSignal = signal
        await new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          setTimeout(resolve, 10_000)
        })
        yield { type: 'done' }
      })(),
    )
    const { result, unmount } = renderChatTurn()
    let request: Promise<void>
    act(() => {
      request = result.current.submitMessage('Long request')
    })
    await waitFor(() => expect(capturedSignal).toBeDefined())

    unmount()
    await request!
    expect(capturedSignal?.aborted).toBe(true)
  })

  it('retains a failed message for retry and records one successful assistant response', async () => {
    mocks.streamChat
      .mockImplementationOnce(() =>
        (async function* () {
          throw new Error('offline')
          yield { type: 'done' }
        })(),
      )
      .mockImplementationOnce(() =>
        events([{ type: 'token', content: 'Recovered' }, { type: 'done' }]),
      )
    const { result } = renderChatTurn()

    await act(async () => result.current.submitMessage('Retry me'))
    expect(result.current.retryMessage).toBe('Retry me')
    expect(result.current.streamError).toBe('Connection failed - try again.')

    await act(async () => result.current.submitMessage(result.current.retryMessage ?? ''))
    expect(result.current.pendingMessages.filter((message) => message.role === 'assistant')).toEqual([
      { role: 'assistant', content: 'Recovered', type: 'ai' },
    ])
    expect(result.current.retryMessage).toBeNull()
  })
})
