import { apiFetch, toQueryString } from './client'
import type { InteractionEnvelopeView, ResolveInteractionRequest } from '@/lib/types/rhizome'

export function getPendingInteraction(): Promise<InteractionEnvelopeView | null> {
  return apiFetch('/api/v1/interactions/pending')
}

export function listRecentInteractions(params?: { limit?: number }): Promise<InteractionEnvelopeView[]> {
  return apiFetch(`/api/v1/interactions/recent${toQueryString(params)}`)
}

export function getInteraction(id: string): Promise<InteractionEnvelopeView> {
  return apiFetch(`/api/v1/interactions/${id}`)
}

export function resolveInteraction(id: string, data: ResolveInteractionRequest): Promise<InteractionEnvelopeView> {
  return apiFetch(`/api/v1/interactions/${id}/resolve`, { method: 'POST', body: JSON.stringify(data) })
}
