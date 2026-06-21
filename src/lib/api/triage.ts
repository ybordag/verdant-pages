import { apiFetch } from './client'
import type { ChatResponse } from '@/lib/types/cambium'
import type { TriageSnapshotView } from '@/lib/types/rhizome'

// AI trigger — calls the agent, which calls the configured LLM provider.
export function runTriage(threadId: string): Promise<ChatResponse> {
  return apiFetch('/api/v1/triage/run', { method: 'POST', body: JSON.stringify({ thread_id: threadId }) })
}

export function getLatestTriage(): Promise<TriageSnapshotView | null> {
  return apiFetch('/api/v1/triage/latest')
}

// getTriageRecommendations is intentionally not implemented — Cambium proxies
// GET /api/v1/triage/recommendations, but no such route exists in Rhizome's
// data_router, so it always 404s. See deferred-work.md.
