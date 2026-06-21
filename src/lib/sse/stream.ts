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
export async function* consumeSSEStream(url: string, body: unknown): AsyncGenerator<SSEEvent> {
  const res = await fetch(BASE + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(body),
  })
  yield* readSSEEvents<SSEEvent>(res)
}

export async function* consumeNotificationStream(): AsyncGenerator<NotificationEvent> {
  const res = await fetch(BASE + '/api/v1/notifications/stream', {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  })
  yield* readSSEEvents<NotificationEvent>(res)
}
