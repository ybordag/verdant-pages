import { apiFetch } from './client'
import type { ContextObject, CreateThreadRequest, ThreadMessagesResponse, ThreadView } from '@/lib/types/rhizome'
import type { ThreadIDResponse } from '@/lib/types/cambium'

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

export function deleteThread(id: string): Promise<void> {
  return apiFetch(`/api/v1/threads/${id}`, { method: 'DELETE' })
}

export function addThreadContext(threadId: string, data: ContextObject): Promise<void> {
  return apiFetch(`/api/v1/threads/${threadId}/context`, { method: 'POST', body: JSON.stringify(data) })
}

export function removeThreadContext(threadId: string, subjectType: string, subjectId: string): Promise<void> {
  return apiFetch(`/api/v1/threads/${threadId}/context/${subjectType}/${subjectId}`, { method: 'DELETE' })
}

// streamChat/streamResume (SSE) are intentionally not implemented yet — both
// depend on src/lib/sse/stream.ts (consumeSSEStream), which is still empty
// pending Phase 6c. See deferred-work.md.
