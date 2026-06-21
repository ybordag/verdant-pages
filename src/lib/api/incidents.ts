import { apiFetch, toQueryString } from './client'
import type { ChatResponse } from '@/lib/types/cambium'
import type {
  ActivityEventView,
  CreateIncidentRequest,
  CreateManualTreatmentPlanRequest,
  IncidentDetailView,
  IncidentView,
  ListIncidentsParams,
  ResolveIncidentRequest,
  TreatmentPlanView,
  UpdateIncidentRequest,
  UpdateTreatmentPlanRequest,
} from '@/lib/types/rhizome'

export function listIncidents(params?: ListIncidentsParams): Promise<IncidentView[]> {
  return apiFetch(`/api/v1/incidents${toQueryString(params)}`)
}

export function getIncident(id: string): Promise<IncidentDetailView> {
  return apiFetch(`/api/v1/incidents/${id}`)
}

export function createIncident(data: CreateIncidentRequest): Promise<IncidentView> {
  return apiFetch('/api/v1/incidents', { method: 'POST', body: JSON.stringify(data) })
}

export function updateIncident(id: string, data: UpdateIncidentRequest): Promise<IncidentView> {
  return apiFetch(`/api/v1/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteIncident(id: string): Promise<void> {
  return apiFetch(`/api/v1/incidents/${id}`, { method: 'DELETE' })
}

export function resolveIncident(id: string, data?: ResolveIncidentRequest): Promise<IncidentView> {
  return apiFetch(`/api/v1/incidents/${id}/resolve`, { method: 'PATCH', body: JSON.stringify(data ?? {}) })
}

export function getIncidentTreatment(id: string): Promise<TreatmentPlanView> {
  return apiFetch(`/api/v1/incidents/${id}/treatment`)
}

export function draftTreatmentPlan(id: string, threadId: string): Promise<ChatResponse> {
  return apiFetch(`/api/v1/incidents/${id}/treatment`, {
    method: 'POST',
    body: JSON.stringify({ thread_id: threadId }),
  })
}

export function createManualTreatmentPlan(
  id: string,
  data: CreateManualTreatmentPlanRequest,
): Promise<TreatmentPlanView> {
  return apiFetch(`/api/v1/incidents/${id}/treatment/manual`, { method: 'POST', body: JSON.stringify(data) })
}

export function updateTreatmentPlan(planId: string, data: UpdateTreatmentPlanRequest): Promise<TreatmentPlanView> {
  return apiFetch(`/api/v1/treatment-plans/${planId}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteTreatmentPlan(planId: string): Promise<void> {
  return apiFetch(`/api/v1/treatment-plans/${planId}`, { method: 'DELETE' })
}

export function approveTreatmentPlan(planId: string): Promise<TreatmentPlanView> {
  return apiFetch(`/api/v1/treatment-plans/${planId}/approve`, { method: 'PATCH' })
}

export function getIncidentActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]> {
  return apiFetch(`/api/v1/incidents/${id}/activity${toQueryString(params)}`)
}
