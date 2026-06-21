import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as tasks from './tasks'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('tasks API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('listTasksDaily builds a query string from params', async () => {
    await tasks.listTasksDaily({ project_id: 'proj-1', limit: 5 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/daily?project_id=proj-1&limit=5')
  })

  it('listTasksDue builds a query string from params', async () => {
    await tasks.listTasksDue({ days_ahead: 3 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/due?days_ahead=3')
  })

  it('listTasks omits the query string when no params are given', async () => {
    await tasks.listTasks()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks')
  })

  it('listTasks builds a query string from params', async () => {
    await tasks.listTasks({ status: 'pending', type: 'maintenance' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks?status=pending&type=maintenance')
  })

  it('getTask fetches a single task by id', async () => {
    await tasks.getTask('task-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1')
  })

  it('createTask posts the task payload', async () => {
    const data = { project_id: 'proj-1', title: 'Water tomatoes', type: 'maintenance' }
    await tasks.createTask(data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks', { method: 'POST', body: JSON.stringify(data) })
  })

  it('deleteTask issues a DELETE', async () => {
    await tasks.deleteTask('task-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1', { method: 'DELETE' })
  })

  it('updateTask patches the task', async () => {
    await tasks.updateTask('task-1', { status: 'in_progress' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'in_progress' }),
    })
  })

  it('startTask posts optional notes', async () => {
    await tasks.startTask('task-1', 'starting now')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1/start', {
      method: 'POST',
      body: JSON.stringify({ notes: 'starting now' }),
    })
  })

  it('completeTask posts the completion payload', async () => {
    await tasks.completeTask('task-1', { actual_minutes: 15 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1/complete', {
      method: 'POST',
      body: JSON.stringify({ actual_minutes: 15 }),
    })
  })

  it('completeTask defaults the body to an empty object', async () => {
    await tasks.completeTask('task-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1/complete', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  })

  it('deferTask translates deferred_until/reason to defer_until/notes', async () => {
    await tasks.deferTask('task-1', { deferred_until: '2026-07-01', reason: 'rain' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1/defer', {
      method: 'POST',
      body: JSON.stringify({ defer_until: '2026-07-01', notes: 'rain' }),
    })
  })

  it('skipTask posts the reason as notes', async () => {
    await tasks.skipTask('task-1', 'not needed')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1/skip', {
      method: 'POST',
      body: JSON.stringify({ notes: 'not needed' }),
    })
  })

  it('getTaskBlockers unwraps the {result} envelope to a plain string', async () => {
    vi.mocked(client.apiFetch).mockResolvedValueOnce({ result: 'Blocked by task-2.' })
    const result = await tasks.getTaskBlockers('task-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1/blockers')
    expect(result).toBe('Blocked by task-2.')
  })

  it('getTaskActivity builds a query string from params', async () => {
    await tasks.getTaskActivity('task-1', { limit: 5 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1/activity?limit=5')
  })

  it('bulkUpdateTaskDates PATCHes the project tasks/bulk endpoint', async () => {
    const updates = [{ task_id: 'task-1', scheduled_date: '2026-07-01' }]
    await tasks.bulkUpdateTaskDates('proj-1', updates)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/projects/proj-1/tasks/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    })
  })

  it('createTaskDependency posts the blocking task id', async () => {
    await tasks.createTaskDependency('task-1', 'task-2')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1/dependencies', {
      method: 'POST',
      body: JSON.stringify({ blocking_task_id: 'task-2' }),
    })
  })

  it('deleteTaskDependency issues a DELETE', async () => {
    await tasks.deleteTaskDependency('task-1', 'task-2')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/task-1/dependencies/task-2', { method: 'DELETE' })
  })

  it('createTaskSeries posts the series payload', async () => {
    const data = { project_id: 'proj-1', title_template: 'Water', type: 'maintenance', cadence: 'weekly' }
    await tasks.createTaskSeries(data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/series', { method: 'POST', body: JSON.stringify(data) })
  })

  it('updateTaskSeries patches the series', async () => {
    await tasks.updateTaskSeries('series-1', { cadence: 'biweekly' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/series/series-1', {
      method: 'PATCH',
      body: JSON.stringify({ cadence: 'biweekly' }),
    })
  })

  it('deleteTaskSeries issues a DELETE with optional params', async () => {
    await tasks.deleteTaskSeries('series-1', { delete_pending_tasks: true })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/series/series-1?delete_pending_tasks=true', {
      method: 'DELETE',
    })
  })

  it('materializeSeries posts optional params', async () => {
    await tasks.materializeSeries({ project_id: 'proj-1', days_ahead: 14 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/tasks/materialize?project_id=proj-1&days_ahead=14', {
      method: 'POST',
    })
  })
})
