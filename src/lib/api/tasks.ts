import { apiFetch, toQueryString } from './client'
import type {
  ActivityEventView,
  CreateTaskRequest,
  CreateTaskSeriesRequest,
  TaskDetailView,
  TaskSeriesView,
  TaskSummaryView,
  UpdateTaskRequest,
  UpdateTaskSeriesRequest,
} from '@/lib/types/rhizome'

export function listTasksDaily(params?: { project_id?: string; limit?: number }): Promise<TaskSummaryView[]> {
  return apiFetch(`/api/v1/tasks/daily${toQueryString(params)}`)
}

export function listTasksDue(params?: { project_id?: string; days_ahead?: number }): Promise<TaskSummaryView[]> {
  return apiFetch(`/api/v1/tasks/due${toQueryString(params)}`)
}

// listTasksBlocked is intentionally not implemented yet — GET /tasks/blocked
// still returns {"result": "<string>"}. See deferred-work.md.

export interface TaskListParams {
  project_id?: string
  type?: string
  subject_type?: string
  subject_id?: string
  status?: string
}

export function listTasks(params?: TaskListParams): Promise<TaskSummaryView[]> {
  return apiFetch(`/api/v1/tasks${toQueryString(params)}`)
}

export function getTask(id: string): Promise<TaskDetailView> {
  return apiFetch(`/api/v1/tasks/${id}`)
}

export function createTask(data: CreateTaskRequest): Promise<TaskDetailView> {
  return apiFetch('/api/v1/tasks', { method: 'POST', body: JSON.stringify(data) })
}

export function deleteTask(id: string): Promise<void> {
  return apiFetch(`/api/v1/tasks/${id}`, { method: 'DELETE' })
}

export function updateTask(id: string, data: UpdateTaskRequest): Promise<TaskDetailView> {
  return apiFetch(`/api/v1/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function startTask(id: string, notes?: string): Promise<void> {
  return apiFetch(`/api/v1/tasks/${id}/start`, { method: 'POST', body: JSON.stringify({ notes }) })
}

export function completeTask(id: string, data?: { actual_minutes?: number; notes?: string }): Promise<void> {
  return apiFetch(`/api/v1/tasks/${id}/complete`, { method: 'POST', body: JSON.stringify(data ?? {}) })
}

export function deferTask(id: string, data: { deferred_until: string; reason?: string }): Promise<void> {
  return apiFetch(`/api/v1/tasks/${id}/defer`, {
    method: 'POST',
    body: JSON.stringify({ defer_until: data.deferred_until, notes: data.reason }),
  })
}

export function skipTask(id: string, reason: string): Promise<void> {
  return apiFetch(`/api/v1/tasks/${id}/skip`, { method: 'POST', body: JSON.stringify({ notes: reason }) })
}

// The backend wraps this tool's prose explanation as {"result": "<string>"} —
// unlike the other broken endpoints, this one is documented to stay a string
// (an English explanation, not structured data), so we just unwrap it here.
export async function getTaskBlockers(id: string): Promise<string> {
  const res = await apiFetch<{ result: string }>(`/api/v1/tasks/${id}/blockers`)
  return res.result
}

export function getTaskActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]> {
  return apiFetch(`/api/v1/tasks/${id}/activity${toQueryString(params)}`)
}

export function bulkUpdateTaskDates(
  projectId: string,
  updates: { task_id: string; scheduled_date?: string; window_start?: string; window_end?: string; deadline?: string }[],
): Promise<TaskSummaryView[]> {
  return apiFetch(`/api/v1/projects/${projectId}/tasks/bulk`, {
    method: 'PATCH',
    body: JSON.stringify({ updates }),
  })
}

export function createTaskDependency(taskId: string, blockingTaskId: string): Promise<void> {
  return apiFetch(`/api/v1/tasks/${taskId}/dependencies`, {
    method: 'POST',
    body: JSON.stringify({ blocking_task_id: blockingTaskId }),
  })
}

export function deleteTaskDependency(taskId: string, blockingTaskId: string): Promise<void> {
  return apiFetch(`/api/v1/tasks/${taskId}/dependencies/${blockingTaskId}`, { method: 'DELETE' })
}

export function createTaskSeries(data: CreateTaskSeriesRequest): Promise<TaskSeriesView> {
  return apiFetch('/api/v1/tasks/series', { method: 'POST', body: JSON.stringify(data) })
}

export function updateTaskSeries(id: string, data: UpdateTaskSeriesRequest): Promise<TaskSeriesView> {
  return apiFetch(`/api/v1/tasks/series/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteTaskSeries(id: string, params?: { delete_pending_tasks?: boolean }): Promise<void> {
  return apiFetch(`/api/v1/tasks/series/${id}${toQueryString(params)}`, { method: 'DELETE' })
}

export function materializeSeries(params?: { project_id?: string; days_ahead?: number }): Promise<void> {
  return apiFetch(`/api/v1/tasks/materialize${toQueryString(params)}`, { method: 'POST' })
}
