import { ApiError, BASE, getAccessToken } from '@/lib/api/client'
import type { NotificationEvent, SSEEvent } from '@/lib/types/cambium'

async function* readSSEEvents<T>(res: Response): AsyncGenerator<T> {
  if (!res.ok || !res.body) throw new ApiError(res.status, null)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6)) as T & { type: string }
          yield event as T
          if (event.type === 'done') return
        } catch {
          // malformed line — skip
        }
      }
    }
  }
}

// Never use EventSource — it only supports GET and can't send a custom
// Authorization header, and a token in a query param would leak into browser
// history, server logs, and Referer headers. fetch + ReadableStream instead.
//
// `signal` lets a caller cancel an in-flight stream (route change, component
// unmount, logout) — without it, an open connection has no way to be torn
// down client-side and keeps yielding events on a token that may no longer
// be valid.
export async function* consumeSSEStream(
  url: string,
  body: unknown,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const token = getAccessToken()
  const res = await fetch(BASE + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  })
  yield* readSSEEvents<SSEEvent>(res)
}

export async function* consumeNotificationStream(signal?: AbortSignal): AsyncGenerator<NotificationEvent> {
  const token = getAccessToken()
  const res = await fetch(BASE + '/api/v1/notifications/stream', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal,
  })
  yield* readSSEEvents<NotificationEvent>(res)
}
