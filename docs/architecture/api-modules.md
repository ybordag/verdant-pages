# API Modules

**Last updated:** 2026-06-21

Reference catalog for `src/lib/api/`. Keep architectural rules in [api-client.md](api-client.md); this file is the exported function index.

Each module exports typed async functions. TanStack Query hooks wrap these in page code; the modules themselves have no React dependency.

---

## Garden

```typescript
getGardenProfile(): Promise<GardenProfileView>
updateGardenProfile(data: UpdateGardenProfileRequest): Promise<GardenProfileView>
getGardenLayout(): Promise<GardenLayoutView | null>  // blocked on rhizome#118

listBeds(params?: { available?: boolean }): Promise<BedView[]>
getBed(id: string): Promise<BedView>
createBed(data: CreateBedRequest): Promise<BedView>
updateBed(id: string, data: UpdateBedRequest): Promise<BedView>
deleteBed(id: string): Promise<void>
getBedCareState(id: string): Promise<CareStateView>
recordBedCare(id: string, data: RecordCareRequest): Promise<CareRecordResult>
getBedActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>

listContainers(params?: { available?: boolean }): Promise<ContainerView[]>
getContainer(id: string): Promise<ContainerView>
createContainer(data: CreateContainerRequest): Promise<ContainerView>
updateContainer(id: string, data: UpdateContainerRequest): Promise<ContainerView>
deleteContainer(id: string): Promise<void>
getContainerCareState(id: string): Promise<CareStateView>
recordContainerCare(id: string, data: RecordCareRequest): Promise<CareRecordResult>
getContainerActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>
```

## Plants

```typescript
listPlants(params?: PlantListParams): Promise<PlantSummaryView[]>
getPlant(id: string): Promise<PlantDetailView>
createPlant(data: CreatePlantRequest): Promise<PlantDetailView>
createPlantBatch(data: BatchCreatePlantRequest): Promise<PlantBatchResultView>
batchUpdatePlants(data: BatchUpdatePlantsRequest): Promise<PlantSummaryView[]>
batchRemovePlants(data: BatchRemovePlantsRequest): Promise<PlantSummaryView[]>
updatePlant(id: string, data: UpdatePlantRequest): Promise<PlantDetailView>
removePlant(id: string, reason: string): Promise<void>
deletePlant(id: string): Promise<void>
getPlantCareState(id: string): Promise<CareStateView>
recordPlantCare(id: string, data: RecordCareRequest): Promise<CareRecordResult>
getPlantActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>
getBatchActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>
```

## Tasks

```typescript
listTasksDaily(params?: { project_id?: string; limit?: number }): Promise<TaskSummaryView[]>
listTasksDue(params?: { project_id?: string; days_ahead?: number }): Promise<TaskSummaryView[]>
listTasksBlocked(params?: { project_id?: string }): Promise<TaskSummaryView[]>
listTasks(params?: TaskListParams): Promise<TaskSummaryView[]>
getTask(id: string): Promise<TaskDetailView>
createTask(data: CreateTaskRequest): Promise<TaskDetailView>
deleteTask(id: string): Promise<void>
updateTask(id: string, data: UpdateTaskRequest): Promise<TaskDetailView>
startTask(id: string, notes?: string): Promise<void>
completeTask(id: string, data?: { actual_minutes?: number; notes?: string }): Promise<void>
deferTask(id: string, data: { deferred_until: string; reason?: string }): Promise<void>
skipTask(id: string, reason: string): Promise<void>
getTaskBlockers(id: string): Promise<string>
getTaskActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>
bulkUpdateTaskDates(projectId: string, updates: TaskDateUpdate[]): Promise<TaskSummaryView[]>
createTaskDependency(taskId: string, blockingTaskId: string): Promise<void>
deleteTaskDependency(taskId: string, blockingTaskId: string): Promise<void>
createTaskSeries(data: CreateTaskSeriesRequest): Promise<TaskSeriesView>
updateTaskSeries(id: string, data: UpdateTaskSeriesRequest): Promise<TaskSeriesView>
deleteTaskSeries(id: string, params?: { delete_pending_tasks?: boolean }): Promise<void>
materializeSeries(params?: { project_id?: string; days_ahead?: number }): Promise<void>
```

## Projects

```typescript
listProjects(params?: { status?: string }): Promise<ProjectSummaryView[]>
getProject(id: string): Promise<ProjectDetailView>
createProject(data: CreateProjectRequest): Promise<ProjectDetailView>
updateProject(id: string, data: UpdateProjectRequest): Promise<ProjectDetailView>
deleteProject(id: string): Promise<ProjectDetailView>
getProjectProgress(id: string): Promise<ProjectProgressView>
getProjectBrief(id: string): Promise<ProjectBriefView>
updateProjectBrief(id: string, data: UpdateBriefRequest): Promise<ProjectBriefView>
listProjectProposals(id: string): Promise<ProposalSummaryView[]>
getProjectProposal(id: string, proposalId: string): Promise<ProposalDetailView>
acceptProjectProposal(id: string, proposalId: string): Promise<ProposalDetailView>
listProjectTasks(id: string, params?: { status?: string; include_dependencies?: boolean }): Promise<TaskSummaryView[] | ProjectTaskGraphView>
bulkUpdateProjectTasks(id: string, updates: TaskDateUpdate[]): Promise<TaskSummaryView[]>
generateProjectTasks(id: string, threadId: string): Promise<ChatResponse>
listProjectSeries(id: string): Promise<TaskSeriesView[]>
getProjectActivity(id: string, params?: { category?: string; event_type?: string; since?: string; before_timestamp?: string; limit?: number }): Promise<ActivityEventView[]>
listProjectBeds(id: string): Promise<BedView[]>
assignBedToProject(id: string, bedId: string): Promise<ResultResponse>
removeBedFromProject(id: string, bedId: string): Promise<ResultResponse>
assignBedsToProject(id: string, bedIds: string[]): Promise<ResultResponse>
listProjectContainers(id: string): Promise<ContainerView[]>
assignContainerToProject(id: string, containerId: string): Promise<ResultResponse>
removeContainerFromProject(id: string, containerId: string): Promise<ResultResponse>
assignContainersToProject(id: string, containerIds: string[]): Promise<ResultResponse>
addPlantToProject(id: string, plantId: string): Promise<ResultResponse>
removePlantFromProject(id: string, plantId: string): Promise<ResultResponse>
listProjectExpenses(id: string): Promise<ProjectExpenseView[]>
createProjectExpense(id: string, data: CreateProjectExpenseRequest): Promise<ProjectExpenseView>
updateProjectExpense(id: string, expenseId: string, data: UpdateProjectExpenseRequest): Promise<ProjectExpenseView>
deleteProjectExpense(id: string, expenseId: string): Promise<void>
getProjectExpenseSummary(id: string): Promise<ExpenseSummaryView>
listProjectShopping(id: string, params?: { status?: string }): Promise<ShoppingItemView[]>
```

## Chat And Agent

```typescript
createThread(data: CreateThreadRequest): Promise<ThreadIDResponse>
listThreads(params?: { limit?: number }): Promise<ThreadView[]>
getThread(id: string): Promise<ThreadView>
getThreadMessages(id: string): Promise<ThreadMessagesResponse>
getThreadSessionContext(id: string): Promise<SessionContextView>
updateThreadSessionContext(id: string, data: UpdateSessionContextRequest): Promise<SessionContextView>
deleteThread(id: string): Promise<void>
addThreadContext(threadId: string, data: ContextObject): Promise<void>
removeThreadContext(threadId: string, subjectType: string, subjectId: string): Promise<void>

streamChat(threadId: string, message: string, signal?: AbortSignal): AsyncGenerator<SSEEvent>
streamResume(threadId: string, resolution: string, signal?: AbortSignal): AsyncGenerator<SSEEvent>
```

## Triage And Weather

```typescript
runTriage(threadId: string): Promise<ChatResponse>
getLatestTriage(): Promise<TriageSnapshotView | null>
// No getTriageRecommendations(): use getLatestTriage().

getLatestWeather(): Promise<WeatherSnapshotView | null>
refreshWeather(): Promise<WeatherSnapshotView>
listWeatherImpactedTasks(params?: { project_id?: string }): Promise<WeatherImpactedTaskView[]>
approveWeatherChangeset(changesetId: string): Promise<WeatherTaskChangeSetView>
draftWeatherTasks(threadId: string): Promise<ChatResponse>
```

## Incidents

```typescript
listIncidents(params?: ListIncidentsParams): Promise<IncidentView[]>
getIncident(id: string): Promise<IncidentDetailView>
createIncident(data: CreateIncidentRequest): Promise<IncidentView>
updateIncident(id: string, data: UpdateIncidentRequest): Promise<IncidentView>
deleteIncident(id: string): Promise<void>
resolveIncident(id: string, data?: ResolveIncidentRequest): Promise<IncidentView>
getIncidentTreatment(id: string): Promise<TreatmentPlanView>
draftTreatmentPlan(id: string, threadId: string): Promise<ChatResponse>
createManualTreatmentPlan(id: string, data: CreateManualTreatmentPlanRequest): Promise<TreatmentPlanView>
updateTreatmentPlan(planId: string, data: UpdateTreatmentPlanRequest): Promise<TreatmentPlanView>
deleteTreatmentPlan(planId: string): Promise<void>
approveTreatmentPlan(planId: string): Promise<TreatmentPlanView>
getIncidentActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>
```

## Interactions, Activity, Alerts, Notifications

```typescript
getPendingInteraction(): Promise<InteractionEnvelopeView | null>
listRecentInteractions(params?: { limit?: number }): Promise<InteractionEnvelopeView[]>
getInteraction(id: string): Promise<InteractionEnvelopeView>
resolveInteraction(id: string, data: { action: string; notes?: string }): Promise<InteractionEnvelopeView>

listActivity(params?: ActivityListParams): Promise<ActivityEventView[]>
getActivityStats(params: ActivityStatsParams): Promise<ActivityStatsView>

listAlerts(): Promise<MonitorAlertView[]>
dismissAlert(id: string): Promise<void>

getNotifications(params?: { since?: string }): Promise<NotificationsSnapshot>
streamNotifications(signal?: AbortSignal): AsyncGenerator<NotificationEvent>
```

## Shopping, Search, Calendar

```typescript
listShopping(params?: ShoppingListParams): Promise<ShoppingItemView[]>
createShoppingItem(data: CreateShoppingRequest): Promise<ShoppingItemView>
updateShoppingItem(id: string, data: Partial<ShoppingItemView>): Promise<ShoppingItemView>
deleteShoppingItem(id: string): Promise<void>
purchaseShoppingItem(id: string): Promise<ShoppingItemView>

search(params: { q: string; types?: string; limit?: number }): Promise<SearchResponse>

listAnnotations(params: { since: string; before: string }): Promise<CalendarAnnotationView[]>
createAnnotation(data: CreateAnnotationRequest): Promise<CalendarAnnotationView>
updateAnnotation(id: string, data: Partial<CalendarAnnotationView>): Promise<CalendarAnnotationView>
deleteAnnotation(id: string): Promise<void>
```

## Media

Not implemented in `src/lib/api/` yet. Add this module once rhizome#117 lands.

```typescript
uploadMedia(file: File, purpose?: string): Promise<MediaView>
deleteMedia(id: string): Promise<void>
listObjectMedia(subjectType: string, subjectId: string): Promise<MediaView[]>
attachMedia(subjectType: string, subjectId: string, mediaId: string): Promise<void>
detachMedia(subjectType: string, subjectId: string, mediaId: string): Promise<void>
```
