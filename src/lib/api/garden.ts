import { apiFetch, toQueryString } from './client'
import type {
  ActivityEventView,
  BedView,
  CareRecordResult,
  CareStateView,
  ContainerView,
  CreateBedRequest,
  CreateContainerRequest,
  GardenProfileView,
  LocationResultsView,
  RecordCareRequest,
  UpdateBedRequest,
  UpdateContainerRequest,
  UpdateGardenProfileRequest,
} from '@/lib/types/rhizome'

export function getGardenProfile(): Promise<GardenProfileView> {
  return apiFetch('/api/v1/garden/profile')
}

export function updateGardenProfile(data: UpdateGardenProfileRequest): Promise<GardenProfileView> {
  return apiFetch('/api/v1/garden/profile', { method: 'PATCH', body: JSON.stringify(data) })
}

export function listBeds(params?: { available?: boolean }): Promise<BedView[]> {
  return apiFetch(`/api/v1/garden/beds${toQueryString(params)}`)
}

export function getBed(id: string): Promise<BedView> {
  return apiFetch(`/api/v1/garden/beds/${id}`)
}

export function createBed(data: CreateBedRequest): Promise<BedView> {
  return apiFetch('/api/v1/garden/beds', { method: 'POST', body: JSON.stringify(data) })
}

export function updateBed(id: string, data: UpdateBedRequest): Promise<BedView> {
  return apiFetch(`/api/v1/garden/beds/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteBed(id: string): Promise<void> {
  return apiFetch(`/api/v1/garden/beds/${id}`, { method: 'DELETE' })
}

export function getBedCareState(id: string): Promise<CareStateView> {
  return apiFetch(`/api/v1/garden/beds/${id}/care/state`)
}

export function recordBedCare(id: string, data: RecordCareRequest): Promise<CareRecordResult> {
  return apiFetch(`/api/v1/garden/beds/${id}/care`, { method: 'POST', body: JSON.stringify(data) })
}

export function getBedActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]> {
  return apiFetch(`/api/v1/garden/beds/${id}/activity${toQueryString(params)}`)
}

export function listContainers(params?: { available?: boolean }): Promise<ContainerView[]> {
  return apiFetch(`/api/v1/garden/containers${toQueryString(params)}`)
}

export function getContainer(id: string): Promise<ContainerView> {
  return apiFetch(`/api/v1/garden/containers/${id}`)
}

export function createContainer(data: CreateContainerRequest): Promise<ContainerView> {
  return apiFetch('/api/v1/garden/containers', { method: 'POST', body: JSON.stringify(data) })
}

export function updateContainer(id: string, data: UpdateContainerRequest): Promise<ContainerView> {
  return apiFetch(`/api/v1/garden/containers/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteContainer(id: string): Promise<void> {
  return apiFetch(`/api/v1/garden/containers/${id}`, { method: 'DELETE' })
}

export function getContainerCareState(id: string): Promise<CareStateView> {
  return apiFetch(`/api/v1/garden/containers/${id}/care/state`)
}

export function recordContainerCare(id: string, data: RecordCareRequest): Promise<CareRecordResult> {
  return apiFetch(`/api/v1/garden/containers/${id}/care`, { method: 'POST', body: JSON.stringify(data) })
}

export function getContainerActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]> {
  return apiFetch(`/api/v1/garden/containers/${id}/activity${toQueryString(params)}`)
}

export function getLocations(location: string): Promise<LocationResultsView> {
  return apiFetch(`/api/v1/garden/locations/${encodeURIComponent(location)}`)
}
