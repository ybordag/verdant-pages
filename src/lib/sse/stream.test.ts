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
})
