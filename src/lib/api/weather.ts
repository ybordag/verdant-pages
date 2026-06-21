import { apiFetch, toQueryString } from './client'
import type { ChatResponse } from '@/lib/types/cambium'
import type { WeatherImpactedTaskView, WeatherSnapshotView, WeatherTaskChangeSetView } from '@/lib/types/rhizome'

export function getLatestWeather(): Promise<WeatherSnapshotView | null> {
  return apiFetch('/api/v1/weather/latest')
}

// Throws ApiError(400) if the garden profile has no location set.
export function refreshWeather(): Promise<WeatherSnapshotView> {
  return apiFetch('/api/v1/weather/refresh', { method: 'POST' })
}

export function listWeatherImpactedTasks(params?: { project_id?: string }): Promise<WeatherImpactedTaskView[]> {
  return apiFetch(`/api/v1/weather/tasks/impacted${toQueryString(params)}`)
}

// Throws ApiError(404) if not found, ApiError(400) if already approved.
export function approveWeatherChangeset(changesetId: string): Promise<WeatherTaskChangeSetView> {
  return apiFetch(`/api/v1/weather/changesets/${changesetId}/approve`, { method: 'PATCH' })
}

// AI trigger — calls the agent, which calls the configured LLM provider.
export function draftWeatherTasks(threadId: string): Promise<ChatResponse> {
  return apiFetch('/api/v1/weather/tasks/draft', { method: 'POST', body: JSON.stringify({ thread_id: threadId }) })
}
