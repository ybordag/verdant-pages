import { apiFetch, toQueryString } from './client'
import type {
  ActivityEventView,
  BatchCreatePlantRequest,
  BatchUpdatePlantsRequest,
  CareRecordResult,
  CareStateView,
  CreatePlantRequest,
  PlantBatchResultView,
  PlantDetailView,
  PlantSummaryView,
  RecordCareRequest,
  UpdatePlantRequest,
} from '@/lib/types/rhizome'

export interface PlantListParams {
  status?: string
  project_id?: string
  batch_id?: string
  bed_id?: string
  container_id?: string
  location?: string
}

export function listPlants(params?: PlantListParams): Promise<PlantSummaryView[]> {
  return apiFetch(`/api/v1/garden/plants${toQueryString(params)}`)
}

export function getPlant(id: string): Promise<PlantDetailView> {
  return apiFetch(`/api/v1/garden/plants/${id}`)
}

export function createPlant(data: CreatePlantRequest): Promise<PlantDetailView> {
  return apiFetch('/api/v1/garden/plants', { method: 'POST', body: JSON.stringify(data) })
}

export function updatePlant(id: string, data: UpdatePlantRequest): Promise<PlantDetailView> {
  return apiFetch(`/api/v1/garden/plants/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function createPlantBatch(data: BatchCreatePlantRequest): Promise<PlantBatchResultView> {
  return apiFetch('/api/v1/garden/plants/batch', { method: 'POST', body: JSON.stringify(data) })
}

export function batchUpdatePlants(data: BatchUpdatePlantsRequest): Promise<PlantSummaryView[]> {
  return apiFetch('/api/v1/garden/plants/batch', { method: 'PATCH', body: JSON.stringify(data) })
}

export function getPlantCareState(id: string): Promise<CareStateView> {
  return apiFetch(`/api/v1/garden/plants/${id}/care/state`)
}

export function recordPlantCare(id: string, data: RecordCareRequest): Promise<CareRecordResult> {
  return apiFetch(`/api/v1/garden/plants/${id}/care`, { method: 'POST', body: JSON.stringify(data) })
}

export function getPlantActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]> {
  return apiFetch(`/api/v1/garden/plants/${id}/activity${toQueryString(params)}`)
}

// removePlant (soft delete) and deletePlant (hard delete) both return
// {"result": "<string>"} today, but their frontend contract is Promise<void>
// per api-client.md, so the broken body shape doesn't block them.

export function removePlant(id: string, reason: string): Promise<void> {
  return apiFetch(`/api/v1/garden/plants/${id}/remove${toQueryString({ reason })}`, { method: 'PATCH' })
}

export function deletePlant(id: string): Promise<void> {
  return apiFetch(`/api/v1/garden/plants/${id}`, { method: 'DELETE' })
}

export function getBatchActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]> {
  return apiFetch(`/api/v1/garden/batches/${id}/activity${toQueryString(params)}`)
}

// batchRemovePlants (soft delete for multiple plants) is intentionally not
// implemented yet — PATCH /garden/plants/batch/remove still returns
// {"result": "<string>"}. See deferred-work.md.
