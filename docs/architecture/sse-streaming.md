# SSE & Agent Chat Streaming

**Last updated:** 2026-06-21

## The EventSource problem

The native `EventSource` API cannot be used for Cambium's streaming endpoints because:
1. It only supports `GET` — chat endpoints require `POST` (to carry a message body)
2. It cannot send custom headers — our endpoints require `Authorization: Bearer <token>`

**Query param token is not an alternative.** JWT in a URL leaks in browser history, server logs, and Referer headers.

## Solution: fetch + ReadableStream

```typescript
// src/lib/sse/stream.ts

export async function* consumeSSEStream(
  url: string,
  body: unknown,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const token = getAccessToken();
  const res = await fetch(BASE + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) throw new ApiError(res.status, null);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6)) as SSEEvent;
          yield event;
          if (event.type === 'done') return;
        } catch {
          // malformed line — skip
        }
      }
    }
  }
}
```

Fully supported in all modern browsers. Token stays in the Authorization header where it belongs.

## SSE event types (from Cambium)

```typescript
export type SSEEvent =
  | { type: 'token'; content: string }
  | { type: 'interaction'; payload: InteractionPayload }
  | { type: 'done' };
```

## RhizomePage stream flow

```
User types message → hits Enter/Send
  └─ POST /api/v1/threads (create if no current thread)
  └─ consumeSSEStream('/api/v1/chat/stream?thread_id=X', { message })
       ├─ { type: 'token', content } → append to StreamingMessage bubble
       ├─ { type: 'interaction', payload } → add ProposalCard to proposals panel
       └─ { type: 'done' } → finalize message, stop streaming indicator

User clicks Accept on ProposalCard
  └─ consumeSSEStream('/api/v1/chat/resume/stream', { thread_id, resolution: 'confirm' })
       └─ same token/interaction/done flow
```

## Component implications

Two distinct rendering modes for a message:

**In-progress (`StreamingMessage`)** — mounted while the stream is live. Holds `streamingText` in local state, appends each `token` event, shows a blinking cursor. Unmounted when `done` arrives.

**Completed (`MessageBubble`)** — a static component rendering a finished string from history. No stream involvement.

RhizomePage manages the handoff:

```
streaming state:
  isStreaming: true
  streamingText: "Your cherry tomatoes haven't been wa..."
  proposals: []  ← populates on interaction event

on { type: 'done' }:
  isStreaming → false
  append { role: 'assistant', content: streamingText } to messages array
  StreamingMessage unmounts, MessageBubble renders in its place
```

**Error handling is required.** If the stream drops — network blip, 401, Cambium restart — the `for await` loop throws. Wrap the loop in a `try/catch` and set an error state with a retry button. Without this the UI silently freezes mid-sentence with no recovery path.

## Thread management

- Do not auto-create a thread on first visit to `/app/rhizome`
- On first send from the blank state, Verdant generates a `thread_id`, calls `POST /api/v1/threads`, navigates to `/app/rhizome/:threadId`, then streams the message
- Thread title auto-populates from Rhizome-side metadata when available
- Thread list at `GET /api/v1/threads?limit=20` — shown in the thread navigator and blank-state shortcuts
