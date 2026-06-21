import { apiFetch, toQueryString } from './client'
import type { ChatResponse } from '@/lib/types/cambium'
import type {
  ActivityEventView,
  BedView,
  ContainerView,
  CreateProjectExpenseRequest,
  CreateProjectRequest,
  ExpenseSummaryView,
  ProjectBriefView,
  ProjectDetailView,
  ProjectExpenseView,
  ProjectProgressView,
  ProjectSummaryView,
  ProjectTaskGraphView,
  ProposalDetailView,
  ProposalSummaryView,
  ResultResponse,
  ShoppingItemView,
  TaskSeriesView,
  TaskSummaryView,
  UpdateBriefRequest,
  UpdateProjectExpenseRequest,
  UpdateProjectRequest,
} from '@/lib/types/rhizome'

export function listProjects(params?: { status?: string }): Promise<ProjectSummaryView[]> {
  return apiFetch(`/api/v1/projects${toQueryString(params)}`)
}

export function getProject(id: string): Promise<ProjectDetailView> {
  return apiFetch(`/api/v1/projects/${id}`)
}

export function createProject(data: CreateProjectRequest): Promise<ProjectDetailView> {
  return apiFetch('/api/v1/projects', { method: 'POST', body: JSON.stringify(data) })
}

export function updateProject(id: string, data: UpdateProjectRequest): Promise<ProjectDetailView> {
  return apiFetch(`/api/v1/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteProject(id: string): Promise<ProjectDetailView> {
  return apiFetch(`/api/v1/projects/${id}`, { method: 'DELETE' })
}

export function getProjectProgress(id: string): Promise<ProjectProgressView> {
  return apiFetch(`/api/v1/projects/${id}/progress`)
}

export function getProjectBrief(id: string): Promise<ProjectBriefView> {
  return apiFetch(`/api/v1/projects/${id}/brief`)
}

export function updateProjectBrief(id: string, data: UpdateBriefRequest): Promise<ProjectBriefView> {
  return apiFetch(`/api/v1/projects/${id}/brief`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function listProjectProposals(id: string): Promise<ProposalSummaryView[]> {
  return apiFetch(`/api/v1/projects/${id}/proposals`)
}

export function getProjectProposal(id: string, proposalId: string): Promise<ProposalDetailView> {
  return apiFetch(`/api/v1/projects/${id}/proposals/${proposalId}`)
}

export function acceptProjectProposal(id: string, proposalId: string): Promise<ProposalDetailView> {
  return apiFetch(`/api/v1/projects/${id}/proposals/${proposalId}/accept`, { method: 'POST' })
}

export function listProjectTasks(
  id: string,
  params?: { status?: string; include_dependencies?: boolean },
): Promise<TaskSummaryView[] | ProjectTaskGraphView> {
  return apiFetch(`/api/v1/projects/${id}/tasks${toQueryString(params)}`)
}

export function bulkUpdateProjectTasks(
  id: string,
  updates: { task_id: string; scheduled_date?: string; window_start?: string; window_end?: string; deadline?: string }[],
): Promise<TaskSummaryView[]> {
  return apiFetch(`/api/v1/projects/${id}/tasks/bulk`, {
    method: 'PATCH',
    body: JSON.stringify({ updates }),
  })
}

export function generateProjectTasks(id: string, threadId: string): Promise<ChatResponse> {
  return apiFetch(`/api/v1/projects/${id}/tasks/generate`, {
    method: 'POST',
    body: JSON.stringify({ thread_id: threadId }),
  })
}

export function listProjectSeries(id: string): Promise<TaskSeriesView[]> {
  return apiFetch(`/api/v1/projects/${id}/series`)
}

export function listProjectBeds(id: string): Promise<BedView[]> {
  return apiFetch(`/api/v1/projects/${id}/beds`)
}

export function assignBedToProject(id: string, bedId: string): Promise<ResultResponse> {
  return apiFetch(`/api/v1/projects/${id}/beds/${bedId}`, { method: 'POST' })
}

export function removeBedFromProject(id: string, bedId: string): Promise<ResultResponse> {
  return apiFetch(`/api/v1/projects/${id}/beds/${bedId}`, { method: 'DELETE' })
}

export function assignBedsToProject(id: string, bedIds: string[]): Promise<ResultResponse> {
  return apiFetch(`/api/v1/projects/${id}/beds/batch`, {
    method: 'POST',
    body: JSON.stringify({ bed_ids: bedIds }),
  })
}

export function listProjectContainers(id: string): Promise<ContainerView[]> {
  return apiFetch(`/api/v1/projects/${id}/containers`)
}

export function assignContainerToProject(id: string, containerId: string): Promise<ResultResponse> {
  return apiFetch(`/api/v1/projects/${id}/containers/${containerId}`, { method: 'POST' })
}

export function removeContainerFromProject(id: string, containerId: string): Promise<ResultResponse> {
  return apiFetch(`/api/v1/projects/${id}/containers/${containerId}`, { method: 'DELETE' })
}

export function assignContainersToProject(id: string, containerIds: string[]): Promise<ResultResponse> {
  return apiFetch(`/api/v1/projects/${id}/containers/batch`, {
    method: 'POST',
    body: JSON.stringify({ container_ids: containerIds }),
  })
}

export function addPlantToProject(id: string, plantId: string): Promise<ResultResponse> {
  return apiFetch(`/api/v1/projects/${id}/plants/${plantId}`, { method: 'POST' })
}

export function removePlantFromProject(id: string, plantId: string): Promise<ResultResponse> {
  return apiFetch(`/api/v1/projects/${id}/plants/${plantId}`, { method: 'DELETE' })
}

export function getProjectActivity(
  id: string,
  params?: { category?: string; event_type?: string; since?: string; before_timestamp?: string; limit?: number },
): Promise<ActivityEventView[]> {
  return apiFetch(`/api/v1/projects/${id}/activity${toQueryString(params)}`)
}

export function listProjectExpenses(id: string): Promise<ProjectExpenseView[]> {
  return apiFetch(`/api/v1/projects/${id}/expenses`)
}

export function createProjectExpense(id: string, data: CreateProjectExpenseRequest): Promise<ProjectExpenseView> {
  return apiFetch(`/api/v1/projects/${id}/expenses`, { method: 'POST', body: JSON.stringify(data) })
}

export function updateProjectExpense(
  id: string,
  expenseId: string,
  data: UpdateProjectExpenseRequest,
): Promise<ProjectExpenseView> {
  return apiFetch(`/api/v1/projects/${id}/expenses/${expenseId}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteProjectExpense(id: string, expenseId: string): Promise<void> {
  return apiFetch(`/api/v1/projects/${id}/expenses/${expenseId}`, { method: 'DELETE' })
}

export function getProjectExpenseSummary(id: string): Promise<ExpenseSummaryView> {
  return apiFetch(`/api/v1/projects/${id}/expenses/summary`)
}

export function listProjectShopping(id: string, params?: { status?: string }): Promise<ShoppingItemView[]> {
  return apiFetch(`/api/v1/projects/${id}/shopping${toQueryString(params)}`)
}
