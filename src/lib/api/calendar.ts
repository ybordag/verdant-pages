import { apiFetch, toQueryString } from './client'
import type { CalendarAnnotationView, CreateAnnotationRequest, UpdateAnnotationRequest } from '@/lib/types/rhizome'

export function listAnnotations(params: { since: string; before: string }): Promise<CalendarAnnotationView[]> {
  return apiFetch(`/api/v1/calendar/annotations${toQueryString(params)}`)
}

export function createAnnotation(data: CreateAnnotationRequest): Promise<CalendarAnnotationView> {
  return apiFetch('/api/v1/calendar/annotations', { method: 'POST', body: JSON.stringify(data) })
}

export function updateAnnotation(id: string, data: UpdateAnnotationRequest): Promise<CalendarAnnotationView> {
  return apiFetch(`/api/v1/calendar/annotations/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteAnnotation(id: string): Promise<void> {
  return apiFetch(`/api/v1/calendar/annotations/${id}`, { method: 'DELETE' })
}
