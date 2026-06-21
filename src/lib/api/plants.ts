import { apiFetch, toQueryString } from './client'
import type { CareRecordResult, CareStateView, PlantSummaryView, RecordCareRequest } from '@/lib/types/rhizome'

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

// getPlant returns PlantDetailView but is omitted as a typed function here on
// purpose: there is no createPlant/updatePlant to pair it with yet (both still
// return {"result": "<string>"} on the backend — see deferred-work.md), so a
// detail view alone isn't useful until the write side lands too.

export function getPlantCareState(id: string): Promise<CareStateView> {
  return apiFetch(`/api/v1/garden/plants/${id}/care/state`)
}

export function recordPlantCare(id: string, data: RecordCareRequest): Promise<CareRecordResult> {
  return apiFetch(`/api/v1/garden/plants/${id}/care`, { method: 'POST', body: JSON.stringify(data) })
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

// getPlant, createPlant, createPlantBatch, updatePlant, getPlantActivity are
// intentionally not implemented yet — see deferred-work.md.
