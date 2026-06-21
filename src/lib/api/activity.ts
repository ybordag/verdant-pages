import { apiFetch, toQueryString } from './client'
import type { ActivityEventView, ActivityListParams, ActivityStatsParams, ActivityStatsView } from '@/lib/types/rhizome'

export function listActivity(params?: ActivityListParams): Promise<ActivityEventView[]> {
  return apiFetch(`/api/v1/activity${toQueryString(params)}`)
}

export function getActivityStats(params: ActivityStatsParams): Promise<ActivityStatsView> {
  return apiFetch(`/api/v1/activity/stats${toQueryString(params)}`)
}
