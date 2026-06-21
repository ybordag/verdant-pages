import { apiFetch, toQueryString } from './client'
import type {
  BedView,
  CareRecordResult,
  CareStateView,
  ContainerView,
  CreateBedRequest,
  GardenProfileView,
  LocationResultsView,
  RecordCareRequest,
} from '@/lib/types/rhizome'

export function getGardenProfile(): Promise<GardenProfileView> {
  return apiFetch('/api/v1/garden/profile')
}

// updateGardenProfile is intentionally not implemented yet — PATCH /garden/profile
// still returns {"result": "<string>"} on the backend. See deferred-work.md.

export function listBeds(params?: { available?: boolean }): Promise<BedView[]> {
  return apiFetch(`/api/v1/garden/beds${toQueryString(params)}`)
}

export function getBed(id: string): Promise<BedView> {
  return apiFetch(`/api/v1/garden/beds/${id}`)
}

export function createBed(data: CreateBedRequest): Promise<BedView> {
  return apiFetch('/api/v1/garden/beds', { method: 'POST', body: JSON.stringify(data) })
}

// updateBed is intentionally not implemented yet — PATCH /garden/beds/{id}
// still returns {"result": "<string>"}. See deferred-work.md.

export function deleteBed(id: string): Promise<void> {
  return apiFetch(`/api/v1/garden/beds/${id}`, { method: 'DELETE' })
}

export function getBedCareState(id: string): Promise<CareStateView> {
  return apiFetch(`/api/v1/garden/beds/${id}/care/state`)
}

export function recordBedCare(id: string, data: RecordCareRequest): Promise<CareRecordResult> {
  return apiFetch(`/api/v1/garden/beds/${id}/care`, { method: 'POST', body: JSON.stringify(data) })
}

export function listContainers(params?: { available?: boolean }): Promise<ContainerView[]> {
  return apiFetch(`/api/v1/garden/containers${toQueryString(params)}`)
}

export function getContainer(id: string): Promise<ContainerView> {
  return apiFetch(`/api/v1/garden/containers/${id}`)
}

// createContainer/updateContainer are intentionally not implemented yet —
// POST/PATCH /garden/containers still return {"result": "<string>"}. See deferred-work.md.

export function deleteContainer(id: string): Promise<void> {
  return apiFetch(`/api/v1/garden/containers/${id}`, { method: 'DELETE' })
}

export function getContainerCareState(id: string): Promise<CareStateView> {
  return apiFetch(`/api/v1/garden/containers/${id}/care/state`)
}

export function recordContainerCare(id: string, data: RecordCareRequest): Promise<CareRecordResult> {
  return apiFetch(`/api/v1/garden/containers/${id}/care`, { method: 'POST', body: JSON.stringify(data) })
}

export function getLocations(location: string): Promise<LocationResultsView> {
  return apiFetch(`/api/v1/garden/locations/${encodeURIComponent(location)}`)
}
