import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as projects from './projects'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('projects API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('listProjects fetches projects with optional status', async () => {
    await projects.listProjects({ status: 'active' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/projects?status=active')
  })

  it('getProject fetches one project', async () => {
    await projects.getProject('proj-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/projects/proj-1')
  })

  it('createProject posts the project payload', async () => {
    const data = { name: 'Summer beds', goal: 'Grow tomatoes' }
    await projects.createProject(data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/projects', { method: 'POST', body: JSON.stringify(data) })
  })

  it('updateProject patches a project', async () => {
    await projects.updateProject('proj-1', { status: 'active' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/projects/proj-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    })
  })

  it('deleteProject issues a DELETE', async () => {
    await projects.deleteProject('proj-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/projects/proj-1', { method: 'DELETE' })
  })

  it('fetches progress and brief', async () => {
    await projects.getProjectProgress('proj-1')
    await projects.getProjectBrief('proj-1')
    expect(client.apiFetch).toHaveBeenNthCalledWith(1, '/api/v1/projects/proj-1/progress')
    expect(client.apiFetch).toHaveBeenNthCalledWith(2, '/api/v1/projects/proj-1/brief')
  })

  it('updateProjectBrief patches the brief', async () => {
    await projects.updateProjectBrief('proj-1', { budget_cap: 120 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/projects/proj-1/brief', {
      method: 'PATCH',
      body: JSON.stringify({ budget_cap: 120 }),
    })
  })

  it('handles proposal endpoints', async () => {
    await projects.listProjectProposals('proj-1')
    await projects.getProjectProposal('proj-1', 'proposal-1')
    await projects.acceptProjectProposal('proj-1', 'proposal-1')
    expect(client.apiFetch).toHaveBeenNthCalledWith(1, '/api/v1/projects/proj-1/proposals')
    expect(client.apiFetch).toHaveBeenNthCalledWith(2, '/api/v1/projects/proj-1/proposals/proposal-1')
    expect(client.apiFetch).toHaveBeenNthCalledWith(3, '/api/v1/projects/proj-1/proposals/proposal-1/accept', {
      method: 'POST',
    })
  })

  it('listProjectTasks supports dependency graph params', async () => {
    await projects.listProjectTasks('proj-1', { status: 'pending', include_dependencies: true })
    expect(client.apiFetch).toHaveBeenCalledWith(
      '/api/v1/projects/proj-1/tasks?status=pending&include_dependencies=true',
    )
  })

  it('bulkUpdateProjectTasks patches task dates', async () => {
    const updates = [{ task_id: 'task-1', scheduled_date: '2026-07-01' }]
    await projects.bulkUpdateProjectTasks('proj-1', updates)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/projects/proj-1/tasks/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    })
  })

  it('generateProjectTasks posts thread id to the trigger endpoint', async () => {
    await projects.generateProjectTasks('proj-1', 'thread-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/projects/proj-1/tasks/generate', {
      method: 'POST',
      body: JSON.stringify({ thread_id: 'thread-1' }),
    })
  })

  it('handles project series and location assignments', async () => {
    await projects.listProjectSeries('proj-1')
    await projects.listProjectBeds('proj-1')
    await projects.assignBedToProject('proj-1', 'bed-1')
    await projects.removeBedFromProject('proj-1', 'bed-1')
    await projects.assignBedsToProject('proj-1', ['bed-1', 'bed-2'])
    await projects.listProjectContainers('proj-1')
    await projects.assignContainerToProject('proj-1', 'container-1')
    await projects.removeContainerFromProject('proj-1', 'container-1')
    await projects.assignContainersToProject('proj-1', ['container-1'])

    expect(client.apiFetch).toHaveBeenNthCalledWith(1, '/api/v1/projects/proj-1/series')
    expect(client.apiFetch).toHaveBeenNthCalledWith(2, '/api/v1/projects/proj-1/beds')
    expect(client.apiFetch).toHaveBeenNthCalledWith(3, '/api/v1/projects/proj-1/beds/bed-1', { method: 'POST' })
    expect(client.apiFetch).toHaveBeenNthCalledWith(4, '/api/v1/projects/proj-1/beds/bed-1', { method: 'DELETE' })
    expect(client.apiFetch).toHaveBeenNthCalledWith(5, '/api/v1/projects/proj-1/beds/batch', {
      method: 'POST',
      body: JSON.stringify({ bed_ids: ['bed-1', 'bed-2'] }),
    })
    expect(client.apiFetch).toHaveBeenNthCalledWith(6, '/api/v1/projects/proj-1/containers')
    expect(client.apiFetch).toHaveBeenNthCalledWith(7, '/api/v1/projects/proj-1/containers/container-1', {
      method: 'POST',
    })
    expect(client.apiFetch).toHaveBeenNthCalledWith(8, '/api/v1/projects/proj-1/containers/container-1', {
      method: 'DELETE',
    })
    expect(client.apiFetch).toHaveBeenNthCalledWith(9, '/api/v1/projects/proj-1/containers/batch', {
      method: 'POST',
      body: JSON.stringify({ container_ids: ['container-1'] }),
    })
  })

  it('handles plant links and activity', async () => {
    await projects.addPlantToProject('proj-1', 'plant-1')
    await projects.removePlantFromProject('proj-1', 'plant-1')
    await projects.getProjectActivity('proj-1', { category: 'task', limit: 5 })
    expect(client.apiFetch).toHaveBeenNthCalledWith(1, '/api/v1/projects/proj-1/plants/plant-1', { method: 'POST' })
    expect(client.apiFetch).toHaveBeenNthCalledWith(2, '/api/v1/projects/proj-1/plants/plant-1', {
      method: 'DELETE',
    })
    expect(client.apiFetch).toHaveBeenNthCalledWith(3, '/api/v1/projects/proj-1/activity?category=task&limit=5')
  })

  it('handles project expenses and shopping', async () => {
    const expense = { name: 'Compost', category: 'soil', estimated_cost: 20 }
    await projects.listProjectExpenses('proj-1')
    await projects.createProjectExpense('proj-1', expense)
    await projects.updateProjectExpense('proj-1', 'expense-1', { status: 'purchased' })
    await projects.deleteProjectExpense('proj-1', 'expense-1')
    await projects.getProjectExpenseSummary('proj-1')
    await projects.listProjectShopping('proj-1', { status: 'needed' })

    expect(client.apiFetch).toHaveBeenNthCalledWith(1, '/api/v1/projects/proj-1/expenses')
    expect(client.apiFetch).toHaveBeenNthCalledWith(2, '/api/v1/projects/proj-1/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    })
    expect(client.apiFetch).toHaveBeenNthCalledWith(3, '/api/v1/projects/proj-1/expenses/expense-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'purchased' }),
    })
    expect(client.apiFetch).toHaveBeenNthCalledWith(4, '/api/v1/projects/proj-1/expenses/expense-1', {
      method: 'DELETE',
    })
    expect(client.apiFetch).toHaveBeenNthCalledWith(5, '/api/v1/projects/proj-1/expenses/summary')
    expect(client.apiFetch).toHaveBeenNthCalledWith(6, '/api/v1/projects/proj-1/shopping?status=needed')
  })
})
