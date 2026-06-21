import { apiFetch } from './client'
import type { MonitorAlertView } from '@/lib/types/rhizome'

export function listAlerts(): Promise<MonitorAlertView[]> {
  return apiFetch('/api/v1/alerts')
}

export function dismissAlert(id: string): Promise<void> {
  return apiFetch(`/api/v1/alerts/${id}/dismiss`, { method: 'POST' })
}
