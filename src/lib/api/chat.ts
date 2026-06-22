import { apiFetch } from './client'
import { consumeSSEStream } from '@/lib/sse/stream'
import type {
  ContextObject,
  CreateThreadRequest,
  SessionContextView,
  ThreadMessagesResponse,
  ThreadView,
  UpdateSessionContextRequest,
} from '@/lib/types/rhizome'
import type { SSEEvent, ThreadIDResponse } from '@/lib/types/cambium'

export function createThread(data: CreateThreadRequest): Promise<ThreadIDResponse> {
  return apiFetch('/api/v1/threads', { method: 'POST', body: JSON.stringify(data) })
}

export function listThreads(params?: { limit?: number }): Promise<ThreadView[]> {
  const qs = params?.limit !== undefined ? `?limit=${params.limit}` : ''
  return apiFetch(`/api/v1/threads${qs}`)
}

export function getThread(id: string): Promise<ThreadView> {
  return apiFetch(`/api/v1/threads/${id}`)
}

export function getThreadMessages(id: string): Promise<ThreadMessagesResponse> {
  return apiFetch(`/api/v1/threads/${id}/messages`)
}

export function getThreadSessionContext(id: string): Promise<SessionContextView> {
  return apiFetch(`/api/v1/threads/${id}/session-context`)
}

export function updateThreadSessionContext(
  id: string,
  data: UpdateSessionContextRequest,
): Promise<SessionContextView> {
  return apiFetch(`/api/v1/threads/${id}/session-context`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteThread(id: string): Promise<void> {
  return apiFetch(`/api/v1/threads/${id}`, { method: 'DELETE' })
}

export function addThreadContext(threadId: string, data: ContextObject): Promise<void> {
  return apiFetch(`/api/v1/threads/${threadId}/context`, { method: 'POST', body: JSON.stringify(data) })
}

export function removeThreadContext(threadId: string, subjectType: string, subjectId: string): Promise<void> {
  return apiFetch(`/api/v1/threads/${threadId}/context/${subjectType}/${subjectId}`, { method: 'DELETE' })
}

export function streamChat(threadId: string, message: string, signal?: AbortSignal): AsyncGenerator<SSEEvent> {
  return consumeSSEStream(`/api/v1/chat/stream?thread_id=${encodeURIComponent(threadId)}`, { message }, signal)
}

export function streamResume(threadId: string, resolution: string, signal?: AbortSignal): AsyncGenerator<SSEEvent> {
  return consumeSSEStream('/api/v1/chat/resume/stream', { thread_id: threadId, resolution }, signal)
}
