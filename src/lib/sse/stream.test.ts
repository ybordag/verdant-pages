import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setAccessToken } from '@/lib/api/client'
import { consumeNotificationStream, consumeSSEStream } from './stream'

function sseResponse(lines: string[], status = 200) {
  const body = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      for (const line of lines) controller.enqueue(encoder.encode(line))
      controller.close()
    },
  })
  return new Response(body, { status })
}

// Simulates a real network drop: some chunks arrive, then the underlying
// connection errors instead of closing cleanly.
function interruptedSseResponse(linesBeforeDrop: string[], dropError: Error, status = 200) {
  const body = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      for (const line of linesBeforeDrop) controller.enqueue(encoder.encode(line))
      controller.error(dropError)
    },
  })
  return new Response(body, { status })
}

// Mirrors real fetch's abort semantics: a ReadableStream whose controller
// errors with an AbortError the moment the given signal is aborted, even if
// no more chunks were ever enqueued (matches a stream stuck mid-flight when
// the user logs out or navigates away).
function abortableSseResponse(linesBeforeAbort: string[], signal: AbortSignal | null | undefined, status = 200) {
  const body = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      for (const line of linesBeforeAbort) controller.enqueue(encoder.encode(line))
      signal?.addEventListener('abort', () => {
        controller.error(new DOMException('The operation was aborted.', 'AbortError'))
      })
    },
  })
  return new Response(body, { status })
}

async function collect<T>(gen: AsyncGenerator<T>): Promise<T[]> {
  const out: T[] = []
  for await (const event of gen) out.push(event)
  return out
}

describe('consumeSSEStream', () => {
  beforeEach(() => {
    setAccessToken('tok-123')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    setAccessToken(null)
  })

  it('posts the body and attaches the Authorization header', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(sseResponse(['data: {"type":"done"}\n\n']))
    await collect(consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'hi' }))
    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('/api/v1/chat/stream?thread_id=t1')
    expect(options?.method).toBe('POST')
    expect(options?.body).toBe(JSON.stringify({ message: 'hi' }))
    expect((options?.headers as Record<string, string>).Authorization).toBe('Bearer tok-123')
  })

  it('yields token events in order and stops at done', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      sseResponse([
        'data: {"type":"token","content":"Hello"}\n\n',
        'data: {"type":"token","content":" world"}\n\n',
        'data: {"type":"done"}\n\n',
      ]),
    )
    const events = await collect(consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'hi' }))
    expect(events).toEqual([
      { type: 'token', content: 'Hello' },
      { type: 'token', content: ' world' },
      { type: 'done' },
    ])
  })

  it('normalizes provider content block token events to text', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      sseResponse([
        'data: {"type":"token","content":[{"type":"text","text":"I can","extras":{"signature":"opaque"}},"\\u0027t show metadata."]}\n\n',
        'data: {"type":"done"}\n\n',
      ]),
    )
    const events = await collect(consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'hi' }))
    expect(events).toEqual([{ type: 'token', content: "I can't show metadata." }, { type: 'done' }])
  })

  it('yields an interaction event when the graph pauses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      sseResponse([
        'data: {"type":"interaction","payload":{"id":"int-1"}}\n\n',
        'data: {"type":"done"}\n\n',
      ]),
    )
    const events = await collect(consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'hi' }))
    expect(events[0]).toEqual({ type: 'interaction', payload: { id: 'int-1' } })
  })

  it('skips malformed lines instead of throwing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      sseResponse(['data: {not valid json\n\n', 'data: {"type":"done"}\n\n']),
    )
    const events = await collect(consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'hi' }))
    expect(events).toEqual([{ type: 'done' }])
  })

  it('handles a chunk split across multiple reads', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      sseResponse(['data: {"type":"to', 'ken","content":"hi"}\n\n', 'data: {"type":"done"}\n\n']),
    )
    const events = await collect(consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'hi' }))
    expect(events).toEqual([{ type: 'token', content: 'hi' }, { type: 'done' }])
  })

  it('throws ApiError when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 502 }))
    await expect(collect(consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'hi' }))).rejects.toMatchObject({
      status: 502,
    })
  })

  it('omits the Authorization header instead of sending "Bearer null" when logged out', async () => {
    setAccessToken(null)
    vi.mocked(fetch).mockResolvedValueOnce(sseResponse(['data: {"type":"done"}\n\n']))
    await collect(consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'hi' }))
    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect((options?.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('a network drop mid-stream surfaces as a rejection, not a silent stop', async () => {
    const dropError = new TypeError('network error')
    vi.mocked(fetch).mockResolvedValueOnce(
      interruptedSseResponse(['data: {"type":"token","content":"partial"}\n\n'], dropError),
    )
    const events: unknown[] = []
    await expect(
      (async () => {
        for await (const event of consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'hi' })) {
          events.push(event)
        }
      })(),
    ).rejects.toThrow('network error')
    // Whether the pre-drop chunk is delivered before the rejection is a
    // ReadableStream scheduling detail — the contract that matters is that
    // the drop surfaces as a rejection instead of looking like a clean "done".
    expect(events.length).toBeLessThanOrEqual(1)
  })

  it('rejects with AbortError and stops yielding once the caller aborts mid-stream', async () => {
    const controller = new AbortController()
    vi.mocked(fetch).mockImplementationOnce(async (_url, options) => {
      return abortableSseResponse(['data: {"type":"token","content":"before-abort"}\n\n'], options?.signal)
    })

    const events: unknown[] = []
    const run = (async () => {
      for await (const event of consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'hi' }, controller.signal)) {
        events.push(event)
      }
    })()

    // Give the stream a tick to deliver the pre-abort chunk, then simulate
    // the caller cancelling (e.g. logout, route change, component unmount).
    await new Promise((r) => setTimeout(r, 0))
    controller.abort()

    await expect(run).rejects.toMatchObject({ name: 'AbortError' })
    expect(events).toEqual([{ type: 'token', content: 'before-abort' }])
  })

  it('a stream opened before a token refresh keeps using its original token', async () => {
    setAccessToken('tok-old')
    let capturedAuth: string | undefined
    vi.mocked(fetch).mockImplementationOnce(async (_url, options) => {
      capturedAuth = (options?.headers as Record<string, string>).Authorization
      // Simulate the access token rotating while this stream is still open —
      // a single open HTTP response can't re-send headers mid-flight, so the
      // already-open connection is unaffected either way.
      setAccessToken('tok-new')
      return sseResponse(['data: {"type":"done"}\n\n'])
    })
    await collect(consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'hi' }))
    expect(capturedAuth).toBe('Bearer tok-old')
  })

  it('a new stream opened after a token refresh picks up the new token', async () => {
    setAccessToken('tok-old')
    vi.mocked(fetch).mockResolvedValueOnce(sseResponse(['data: {"type":"done"}\n\n']))
    await collect(consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'first' }))

    setAccessToken('tok-refreshed')
    vi.mocked(fetch).mockResolvedValueOnce(sseResponse(['data: {"type":"done"}\n\n']))
    await collect(consumeSSEStream('/api/v1/chat/stream?thread_id=t1', { message: 'second' }))

    const [, secondOptions] = vi.mocked(fetch).mock.calls[1]
    expect((secondOptions?.headers as Record<string, string>).Authorization).toBe('Bearer tok-refreshed')
  })
})

describe('consumeNotificationStream', () => {
  beforeEach(() => {
    setAccessToken('tok-123')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    setAccessToken(null)
  })

  it('issues a GET with the Authorization header, no body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(sseResponse(['data: {"type":"heartbeat"}\n\n']))
    const events = await collect(consumeNotificationStream())
    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('/api/v1/notifications/stream')
    expect(options?.method).toBeUndefined()
    expect(options?.body).toBeUndefined()
    expect((options?.headers as Record<string, string>).Authorization).toBe('Bearer tok-123')
    expect(events).toEqual([{ type: 'heartbeat' }])
  })

  it('does not stop on heartbeat (no terminal type)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      sseResponse(['data: {"type":"heartbeat"}\n\n', 'data: {"type":"alert","payload":{"id":"a1"}}\n\n']),
    )
    const events = await collect(consumeNotificationStream())
    expect(events).toHaveLength(2)
  })

  it('stops on logout when the caller aborts the long-lived stream', async () => {
    // The notification stream has no natural "done" event — it's meant to
    // live for the whole session. On logout, a caller must abort it
    // explicitly, or the connection (and its now-stale token) stays open
    // indefinitely.
    const controller = new AbortController()
    vi.mocked(fetch).mockImplementationOnce(async (_url, options) => {
      return abortableSseResponse(['data: {"type":"heartbeat"}\n\n'], options?.signal)
    })

    const events: unknown[] = []
    const run = (async () => {
      for await (const event of consumeNotificationStream(controller.signal)) events.push(event)
    })()

    await new Promise((r) => setTimeout(r, 0))
    setAccessToken(null) // simulates logout()
    controller.abort() // simulates the caller tearing the stream down on logout

    await expect(run).rejects.toMatchObject({ name: 'AbortError' })
    expect(events).toEqual([{ type: 'heartbeat' }])
  })
})
