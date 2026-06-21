# API Client

**Last updated:** 2026-06-21

All API communication goes through a single typed client layer in `src/lib/api/`. Page components never call `fetch()` directly — they use TanStack Query hooks that call these client functions.

---

## Token store

The access token lives in a module-scoped variable. Never written to `localStorage`, `sessionStorage`, or any cookie.

```typescript
// src/lib/api/client.ts

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => { accessToken = token; };
export const getAccessToken = () => accessToken;
```

See [auth.md](auth.md) for the full token lifecycle (in-memory + httpOnly refresh cookie).

---

## Base fetch wrapper

```typescript
// src/lib/api/client.ts

const BASE = import.meta.env.VITE_CAMBIUM_URL ?? '';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API ${status}`);
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = accessToken;

  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) return apiFetch(path, options);  // retry once
    setAccessToken(null);
    window.location.replace('/login');
    throw new ApiError(401, null);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}
```

**Rules:**
- 401 → attempt `POST /auth/refresh` once → retry original request → if refresh fails, redirect to `/login`
- All other non-2xx → throw `ApiError` with status + body
- Never call `fetch()` directly in components — always go through `apiFetch`

---

## Error handling

```typescript
try {
  const data = await apiFetch<Plant>('/api/v1/garden/plants/abc');
} catch (err) {
  if (err instanceof ApiError) {
    if (err.status === 404) { /* not found */ }
    if (err.status === 400) { /* validation error — check err.body */ }
  }
}
```

In TanStack Query, `ApiError` surfaces in the `error` property of `useQuery`/`useMutation`. Components check `error instanceof ApiError` to render appropriate feedback.

---

## Auth module

```typescript
// src/lib/api/auth.ts

export async function login(email: string, password: string): Promise<void>
export async function register(email: string, password: string): Promise<void>
export async function logout(): Promise<void>
export async function tryRefreshToken(): Promise<boolean>   // called by apiFetch on 401
export async function getSession(): Promise<SessionResponse>
export async function updateProfile(data: { preferred_provider?: string; preferred_model?: string }): Promise<SessionResponse>
export async function changePassword(current: string, next: string): Promise<void>
```

`login` and `register` call `setAccessToken(response.access_token)` and start the proactive refresh timer. `logout` calls `setAccessToken(null)` and clears the timer.

---

## SSE stream

```typescript
// src/lib/api/stream.ts

export async function* consumeSSEStream(
  url: string,
  body: unknown,
): AsyncGenerator<SSEEvent> {
  const res = await fetch(BASE + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) throw new ApiError(res.status, null);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6)) as SSEEvent;
          yield event;
          if (event.type === 'done') return;
        } catch { /* malformed — skip */ }
      }
    }
  }
}
```

Also used for the notification stream (GET, no body):

```typescript
export async function* consumeNotificationStream(): AsyncGenerator<NotificationEvent> {
  const res = await fetch(BASE + '/api/v1/notifications/stream', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  // same reader loop, yields NotificationEvent
}
```

See [sse-streaming.md](sse-streaming.md) for full context.

---

## Domain modules

Each module exports typed async functions. TanStack Query hooks wrap these — the modules themselves have no React dependency.

### `garden.ts`

```typescript
getGardenProfile(): Promise<GardenProfileView>
updateGardenProfile(data: UpdateGardenProfileRequest): Promise<GardenProfileView>  // rhizome#140 ✅
getGardenLayout(): Promise<GardenLayoutView | null>           // rhizome#118

listBeds(params?: { available?: boolean }): Promise<BedView[]>
getBed(id: string): Promise<BedView>
createBed(data: CreateBedRequest): Promise<BedView>
updateBed(id: string, data: UpdateBedRequest): Promise<BedView>  // rhizome#140 ✅
deleteBed(id: string): Promise<void>
getBedCareState(id: string): Promise<CareStateView>
recordBedCare(id: string, data: RecordCareRequest): Promise<CareRecordResult>  // rhizome#128 ✅
getBedActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>  // rhizome#140 ✅

listContainers(params?: { available?: boolean }): Promise<ContainerView[]>
getContainer(id: string): Promise<ContainerView>
createContainer(data: CreateContainerRequest): Promise<ContainerView>  // rhizome#140 ✅
updateContainer(id: string, data: UpdateContainerRequest): Promise<ContainerView>  // rhizome#140 ✅
deleteContainer(id: string): Promise<void>
getContainerCareState(id: string): Promise<CareStateView>
recordContainerCare(id: string, data: RecordCareRequest): Promise<CareRecordResult>  // rhizome#128 ✅
getContainerActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>  // rhizome#140 ✅
```

### `plants.ts`

```typescript
listPlants(params?: PlantListParams): Promise<PlantSummaryView[]>
  // params: status, project_id, batch_id, bed_id, container_id, location
getPlant(id: string): Promise<PlantDetailView>
createPlant(data: CreatePlantRequest): Promise<PlantDetailView>  // rhizome#140 ✅
createPlantBatch(data: BatchCreatePlantRequest): Promise<PlantBatchResultView>  // rhizome#140 ✅
batchUpdatePlants(data: BatchUpdatePlantsRequest): Promise<PlantSummaryView[]>  // rhizome#140 ✅
batchRemovePlants(data: BatchRemovePlantsRequest): Promise<PlantSummaryView[]>  // structured removed plants
updatePlant(id: string, data: UpdatePlantRequest): Promise<PlantDetailView>  // rhizome#140 ✅
removePlant(id: string, reason: string): Promise<void>    // soft delete
deletePlant(id: string): Promise<void>                    // hard delete
getPlantCareState(id: string): Promise<CareStateView>
recordPlantCare(id: string, data: RecordCareRequest): Promise<CareRecordResult>  // rhizome#128 ✅
getPlantActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>  // rhizome#140 ✅
getBatchActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>  // rhizome#140 ✅

```

### `tasks.ts`

```typescript
listTasksDaily(params?: { project_id?: string; limit?: number }): Promise<TaskSummaryView[]>
listTasksDue(params?: { project_id?: string; days_ahead?: number }): Promise<TaskSummaryView[]>
listTasksBlocked(params?: { project_id?: string }): Promise<TaskSummaryView[]>  // structured TaskSummaryView[] with blocked=true
listTasks(params: TaskListParams): Promise<TaskSummaryView[]>
  // params: project_id?, type?, subject_type?, subject_id?, status?
getTask(id: string): Promise<TaskDetailView>
createTask(data: CreateTaskRequest): Promise<TaskDetailView>          // rhizome#112 ✅
deleteTask(id: string): Promise<void>                                  // rhizome#112 ✅
updateTask(id: string, data: UpdateTaskRequest): Promise<TaskDetailView>  // rhizome#140 ✅
startTask(id: string, notes?: string): Promise<void>
completeTask(id: string, data?: { actual_minutes?: number; notes?: string }): Promise<void>
deferTask(id: string, data: { deferred_until: string; reason?: string }): Promise<void>
skipTask(id: string, reason: string): Promise<void>
getTaskBlockers(id: string): Promise<string>
getTaskActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>  // rhizome#140 ✅
bulkUpdateTaskDates(projectId: string, updates: TaskDateUpdate[]): Promise<TaskSummaryView[]>  // rhizome#122
createTaskDependency(taskId: string, blockingTaskId: string): Promise<void>                    // rhizome#121
deleteTaskDependency(taskId: string, blockingTaskId: string): Promise<void>                    // rhizome#121
createTaskSeries(data: CreateTaskSeriesRequest): Promise<TaskSeriesView>                       // rhizome#113
updateTaskSeries(id: string, data: UpdateTaskSeriesRequest): Promise<TaskSeriesView>  // rhizome#140 ✅
deleteTaskSeries(id: string, params?: { delete_pending_tasks?: boolean }): Promise<void>       // rhizome#113
materializeSeries(params?: { project_id?: string; days_ahead?: number }): Promise<void>
```

### `projects.ts`

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
generateProjectTasks(id: string, threadId: string): Promise<ChatResponse>  // AI trigger
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
// Project-scoped plants use plants.listPlants({ project_id }) — Rhizome has no GET /projects/{id}/plants route.
listProjectExpenses(id: string): Promise<ProjectExpenseView[]>
createProjectExpense(id: string, data: CreateProjectExpenseRequest): Promise<ProjectExpenseView>
updateProjectExpense(id: string, expenseId: string, data: UpdateProjectExpenseRequest): Promise<ProjectExpenseView>
deleteProjectExpense(id: string, expenseId: string): Promise<void>
getProjectExpenseSummary(id: string): Promise<ExpenseSummaryView>
listProjectShopping(id: string, params?: { status?: string }): Promise<ShoppingItemView[]>
```

### `chat.ts`

```typescript
createThread(data: CreateThreadRequest): Promise<ThreadIDResponse>
  // CreateThreadRequest: { thread_id, title?, project_id?, initial_context?: ContextObject[] }
listThreads(params?: { limit?: number }): Promise<ThreadView[]>
getThread(id: string): Promise<ThreadView>
getThreadMessages(id: string): Promise<ThreadMessagesResponse>
deleteThread(id: string): Promise<void>
addThreadContext(threadId: string, data: ContextObject): Promise<void>      // rhizome#127
removeThreadContext(threadId: string, subjectType: string, subjectId: string): Promise<void>  // rhizome#127

// Streaming (returns async generators — used directly in components, not via TanStack Query)
streamChat(threadId: string, message: string): AsyncGenerator<SSEEvent>
streamResume(threadId: string, resolution: string): AsyncGenerator<SSEEvent>
```

### `triage.ts`

```typescript
runTriage(threadId: string): Promise<ChatResponse>       // AI trigger
getLatestTriage(): Promise<TriageSnapshotView | null>    // null if no snapshot exists yet
// No getTriageRecommendations(): the old proxy route was removed.
// Use getLatestTriage(), which returns grouped TaskSummaryView objects.
```

### `weather.ts`

```typescript
getLatestWeather(): Promise<WeatherSnapshotView | null>
refreshWeather(): Promise<WeatherSnapshotView>             // 400 if garden profile has no location set
listWeatherImpactedTasks(params?: { project_id?: string }): Promise<WeatherImpactedTaskView[]>
approveWeatherChangeset(changesetId: string): Promise<WeatherTaskChangeSetView>  // 404 not found, 400 already approved
draftWeatherTasks(threadId: string): Promise<ChatResponse>  // AI trigger
```

### `incidents.ts`

Built 2026-06-21 (unblocked by rhizome#135 — incidents/treatment-plan structured JSON):

```typescript
listIncidents(params?: ListIncidentsParams): Promise<IncidentView[]>
  // params: project_id?, status?, severity?, incident_type?, since?, before?, subject_type?, subject_id?
getIncident(id: string): Promise<IncidentDetailView>
createIncident(data: CreateIncidentRequest): Promise<IncidentView>
updateIncident(id: string, data: UpdateIncidentRequest): Promise<IncidentView>
deleteIncident(id: string): Promise<void>
resolveIncident(id: string, data?: ResolveIncidentRequest): Promise<IncidentView>
getIncidentTreatment(id: string): Promise<TreatmentPlanView>
draftTreatmentPlan(id: string, threadId: string): Promise<ChatResponse>   // AI trigger — Cambium's triggerTreatmentDraft, not a plain proxy
createManualTreatmentPlan(id: string, data: CreateManualTreatmentPlanRequest): Promise<TreatmentPlanView>
updateTreatmentPlan(planId: string, data: UpdateTreatmentPlanRequest): Promise<TreatmentPlanView>
deleteTreatmentPlan(planId: string): Promise<void>
approveTreatmentPlan(planId: string): Promise<TreatmentPlanView>
getIncidentActivity(id: string, params?: { limit?: number }): Promise<ActivityEventView[]>
```

### `interactions.ts`

```typescript
getPendingInteraction(): Promise<InteractionEnvelopeView | null>
listRecentInteractions(params?: { limit?: number }): Promise<InteractionEnvelopeView[]>
getInteraction(id: string): Promise<InteractionEnvelopeView>
resolveInteraction(id: string, data: { action: string; notes?: string }): Promise<InteractionEnvelopeView>
  // rhizome#136 made this return the updated envelope, not just 200 OK — use it
  // to update local state directly instead of refetching.
```

### `activity.ts`

```typescript
listActivity(params?: ActivityListParams): Promise<ActivityEventView[]>
  // params: project_id?, subject_type?, event_type?, category?, since?, before_timestamp?, limit?
getActivityStats(params: ActivityStatsParams): Promise<ActivityStatsView>
  // params: since (required), before?, event_types?, project_id?, group_by?
```

### `alerts.ts`

```typescript
listAlerts(): Promise<MonitorAlertView[]>          // already returns structured JSON ✅
dismissAlert(id: string): Promise<void>
```

### `notifications.ts`

```typescript
getNotifications(params?: { since?: string }): Promise<NotificationsSnapshot>  // rhizome#130
// SSE stream (used directly, not via TanStack Query)
streamNotifications(): AsyncGenerator<NotificationEvent>                         // rhizome#130
```

### `shopping.ts`

```typescript
listShopping(params?: ShoppingListParams): Promise<ShoppingItemView[]>  // rhizome#125
  // params: status?, project_id?, category?, priority?
createShoppingItem(data: CreateShoppingRequest): Promise<ShoppingItemView>
updateShoppingItem(id: string, data: Partial<ShoppingItemView>): Promise<ShoppingItemView>
deleteShoppingItem(id: string): Promise<void>
purchaseShoppingItem(id: string): Promise<ShoppingItemView>
```

### `search.ts`

```typescript
search(params: { q: string; types?: string; limit?: number }): Promise<SearchResponse>  // rhizome#126
  // Frontend parses "plant:tomatoes" → { q: "tomatoes", types: "plant" }
```

### `calendar.ts`

```typescript
listAnnotations(params: { since: string; before: string }): Promise<CalendarAnnotationView[]>  // rhizome#114
createAnnotation(data: CreateAnnotationRequest): Promise<CalendarAnnotationView>
updateAnnotation(id: string, data: Partial<CalendarAnnotationView>): Promise<CalendarAnnotationView>
deleteAnnotation(id: string): Promise<void>
```

### `media.ts`

```typescript
// rhizome#117
uploadMedia(file: File, purpose?: string): Promise<MediaView>
deleteMedia(id: string): Promise<void>
// Per-object attachments
listObjectMedia(subjectType: string, subjectId: string): Promise<MediaView[]>
attachMedia(subjectType: string, subjectId: string, mediaId: string): Promise<void>
detachMedia(subjectType: string, subjectId: string, mediaId: string): Promise<void>
```

---

## TypeScript types

Types live in `src/lib/types/`. They are hand-written to match Rhizome's `agent/api/views.py` (the structured JSON layer) and Cambium's swagger.

### From Cambium swagger

```typescript
// src/lib/types/cambium.ts

export interface TokenResponse { access_token: string }
export interface SessionResponse {
  email: string; user_id: string;
  preferred_provider: string; preferred_model: string;
}
export interface ChatRequest { message: string }
export interface ChatResponse {
  response: string; thread_id: string; interaction: Record<string, unknown> | null;
}
export interface ResumeRequest { thread_id: string; resolution: string }
export interface KeysResponse { anthropic: boolean; gemini: boolean; openai: boolean }
export interface ThreadIDResponse { thread_id: string }

export type SSEEvent =
  | { type: 'token'; content: string }
  | { type: 'interaction'; payload: InteractionEnvelopeView }
  | { type: 'done' };

export type NotificationEvent =
  | { type: 'heartbeat' }
  | { type: 'alert'; payload: MonitorAlertView }
  | { type: 'interaction_pending'; payload: { id: string; title: string; interaction_type: string } }
  | { type: 'job_started'; job_id: string; title: string }
  | { type: 'job_step'; job_id: string; step: string; status: 'running' | 'done' }
  | { type: 'job_complete'; job_id: string; title: string; summary: string }
  | { type: 'job_failed'; job_id: string; title: string; error: string };
```

### From Rhizome `agent/api/views.py` (P0 — implemented ✅)

```typescript
// src/lib/types/rhizome.ts

export interface GardenProfileView {
  id: string; climate_zone: string;
  frost_date_last_spring?: string; frost_date_first_fall?: string;
  soil_type?: string; tray_capacity?: number; tray_indoor_capacity?: number;
  latitude?: number; longitude?: number;
  hard_constraints?: string[]; soft_preferences?: string[];
  notes?: string; created_at: string; updated_at?: string;
}

export interface BedView {
  id: string; name: string; location?: string;
  sunlight?: string; soil_type?: string; dimensions_sqft?: number;
  last_watered_at?: string; last_fertilized_at?: string;
  last_amended_at?: string; last_inspected_at?: string;
  care_state_notes?: string; notes?: string;
  created_at: string; updated_at?: string;
  available?: boolean;
}

export interface ContainerView {
  id: string; name: string; container_type?: string;
  size_gallons?: number; location?: string; is_mobile: boolean;
  last_watered_at?: string; last_fertilized_at?: string;
  last_amended_at?: string; last_inspected_at?: string;
  care_state_notes?: string; notes?: string;
  created_at: string; updated_at?: string;
  available?: boolean;
}

export interface PlantSummaryView {
  id: string; name: string; variety?: string; quantity: number;
  status: string; source?: string;
  bed_id?: string; container_id?: string; batch_id?: string;
  location_name?: string;
  is_flowering: boolean; is_fruiting: boolean;
  sow_date?: string; transplant_date?: string; created_at: string;
}

export interface PlantDetailView extends PlantSummaryView {
  propagated_from?: string; red_cup_date?: string;
  fertilizing_schedule?: string; special_instructions?: string;
  last_watered_at?: string; last_fertilized_at?: string;
  last_inspected_at?: string; last_treated_at?: string; last_pruned_at?: string;
  care_state_notes?: string; notes?: string; updated_at?: string;
}

export interface CareStateView {
  subject_type: string; subject_id: string;
  last_watered_at?: string; last_fertilized_at?: string;
  last_amended_at?: string; last_inspected_at?: string;
  last_treated_at?: string; last_pruned_at?: string;
  care_state_notes?: string;
}

export interface TaskSummaryView {
  id: string; project_id: string; title: string;
  type: string; status: string; priority?: string;
  scheduled_date?: string; earliest_start?: string;
  window_start?: string; window_end?: string; deadline?: string;
  estimated_minutes: number; is_user_modified: boolean;
  created_at: string;
  urgency?: string; blocked?: boolean; due_date?: string; score?: number;
}

export interface TaskDetailView extends TaskSummaryView {
  description?: string; series_id?: string;
  source_type: string; generator_key: string;
  completed_at?: string; deferred_until?: string; actual_minutes?: number;
  reversible: boolean;
  what_happens_if_skipped?: string; what_happens_if_delayed?: string;
  linked_subjects: LinkedSubject[];
  notes?: string; updated_at?: string;
}

export interface ProjectSummaryView {
  id: string; name: string; goal: string; status: string;
  tray_slots?: number; budget_ceiling?: number; notes?: string;
  plant_count: number; bed_count: number; container_count: number; batch_count: number;
  created_at: string; updated_at?: string;
}

export interface ProjectDetailView extends ProjectSummaryView {
  approved_plan?: Record<string, unknown>;
}

export interface TriageSnapshotView {
  id: string; created_at: string;
  reasoning_summary: string; user_focus_summary?: string;
  weather_snapshot_id?: string;
  urgent_tasks: TaskSummaryView[]; routine_tasks: TaskSummaryView[]; project_tasks: TaskSummaryView[];
}

export interface WeatherDayImpactView {
  date: string; impact_type: string; severity: string; summary: string;
  reason?: string; timing_advice?: string;
}

export interface WeatherRecommendedActionView { date: string; action: string }

export interface WeatherSnapshotView {
  id: string; created_at: string;
  location_label: string; timezone: string;
  forecast_start_date: string; forecast_end_date: string;
  conditions_summary: string; alerts_summary?: string;
  derived_impacts: WeatherDayImpactView[]; recommended_actions: WeatherRecommendedActionView[];
}

export interface WeatherImpactedTaskView {
  task_id: string; task_title: string; project_id?: string;
  impact_type: string; impact_kind: string; impact_date?: string; summary: string;
}

export interface WeatherTaskChangeSetView {
  id: string; status: string; summary: string; weather_snapshot_id: string;
  created_at: string; approved_at?: string;
  affected_tasks: TaskSummaryView[];
}

export interface InteractionActionView {
  id: string; label: string; kind: string;
  style_hint: string; input_schema?: Record<string, unknown>[];
}

export interface InteractionEnvelopeView {
  id: string; interaction_type: string; status: string;
  title: string; summary: string; body?: string;
  sections: Record<string, unknown>[]; actions: InteractionActionView[];
  context: Record<string, unknown>;
  created_at: string; resolved_at?: string;
  resolution_action?: string; resolution_summary?: string;
}
```

### P1/P2 types (mostly shipped)

`TriageSnapshotView`, weather views, `InteractionEnvelopeView`, incident/treatment views,
activity views, project views, task series, ThreadView, and monitor alert views are now shipped and
defined in `src/lib/types/rhizome.ts`. The remaining typed backend work is media views once
rhizome#117 lands. The original umbrella issue, #132, was closed in favor of per-feature splits —
see #132 for why.

```typescript
// Still needed or pending cleanup:
MediaView
```

---

## TanStack Query patterns

### Queries (data fetching)

```typescript
// Example: plant detail
export function usePlant(id: string) {
  return useQuery({
    queryKey: ['plants', id],
    queryFn: () => getPlant(id),
    enabled: !!id,
  });
}

// Example: task list with filters
export function useTasksDaily(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', 'daily', { projectId }],
    queryFn: () => listTasksDaily({ project_id: projectId }),
    staleTime: 2 * 60 * 1000,   // 2 minutes — task priority changes slowly
  });
}
```

### Mutations (data writes) with optimistic updates

```typescript
// Example: complete a task
export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CompleteTaskData }) =>
      completeTask(id, data),
    onMutate: async ({ id }) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      // Snapshot old state
      const previous = queryClient.getQueryData(['tasks', 'daily']);
      // Optimistically update
      queryClient.setQueryData(['tasks', 'daily'], (old: DailyTaskView[]) =>
        old.map(t => t.task.id === id
          ? { ...t, task: { ...t.task, status: 'done' } }
          : t
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Revert on error
      queryClient.setQueryData(['tasks', 'daily'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

### Query key conventions

```typescript
// Consistent query key structure:
['garden', 'profile']
['beds']
['beds', id]
['beds', id, 'care-state']
['containers']
['containers', id]
['plants', { status, location, project_id }]
['plants', id]
['tasks', 'daily', { projectId }]
['tasks', 'due', { daysAhead }]
['tasks', id]
['projects']
['projects', id]
['projects', id, 'tasks']
['projects', id, 'expenses']
['incidents', { status, severity }]
['incidents', id]
['activity', { category, since }]
['activity', 'stats', { since, eventTypes }]
['triage', 'latest']
['weather', 'latest']
['threads']
['threads', id]
['alerts']
['notifications']
['search', { q, types }]
```

Invalidation strategy: mutations invalidate the relevant keys. E.g., completing a task invalidates `['tasks']` (all task queries), `['activity']` (new event), and `['projects', id]` (progress update).

---

## Vite dev proxy

In development, Vite proxies `/api` and `/auth` to Cambium. No `VITE_CAMBIUM_URL` needed locally.

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/auth': 'http://localhost:8080',
    },
  },
});
```

In production, set `VITE_CAMBIUM_URL` to the full Cambium URL.
