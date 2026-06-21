// Hand-written to match Rhizome's agent/api/views.py (response shapes) and
// agent/api/models.py (request bodies). Only types for endpoints that are
// confirmed returning structured JSON are included here — see
// docs/development/deferred-work.md for what's still blocked.

// ---------------------------------------------------------------------------
// Garden — profile, beds, containers, plants, care state
// ---------------------------------------------------------------------------

export interface GardenProfileView {
  id: string
  climate_zone: string
  frost_date_last_spring?: string
  frost_date_first_fall?: string
  soil_type?: string
  tray_capacity?: number
  tray_indoor_capacity?: number
  location_label?: string
  latitude?: number
  longitude?: number
  hard_constraints?: string[]
  soft_preferences?: string[]
  notes?: string
  created_at: string
  updated_at?: string
}

export interface BedView {
  id: string
  name: string
  location?: string
  sunlight?: string
  soil_type?: string
  dimensions_sqft?: number
  last_watered_at?: string
  last_fertilized_at?: string
  last_amended_at?: string
  last_inspected_at?: string
  care_state_notes?: string
  notes?: string
  created_at: string
  updated_at?: string
  available?: boolean
}

export interface ContainerView {
  id: string
  name: string
  container_type?: string
  size_gallons?: number
  location?: string
  is_mobile: boolean
  last_watered_at?: string
  last_fertilized_at?: string
  last_amended_at?: string
  last_inspected_at?: string
  care_state_notes?: string
  notes?: string
  created_at: string
  updated_at?: string
  available?: boolean
}

export interface PlantSummaryView {
  id: string
  name: string
  variety?: string
  quantity: number
  status: string
  source?: string
  bed_id?: string
  container_id?: string
  batch_id?: string
  location_name?: string
  is_flowering: boolean
  is_fruiting: boolean
  sow_date?: string
  transplant_date?: string
  created_at: string
}

export interface PlantDetailView extends PlantSummaryView {
  propagated_from?: string
  red_cup_date?: string
  fertilizing_schedule?: string
  special_instructions?: string
  last_watered_at?: string
  last_fertilized_at?: string
  last_inspected_at?: string
  last_treated_at?: string
  last_pruned_at?: string
  care_state_notes?: string
  notes?: string
  updated_at?: string
}

export interface CareStateView {
  subject_type: string
  subject_id: string
  last_watered_at?: string
  last_fertilized_at?: string
  last_amended_at?: string
  last_inspected_at?: string
  last_treated_at?: string
  last_pruned_at?: string
  care_state_notes?: string
}

export interface LocationResultsView {
  beds: BedView[]
  containers: ContainerView[]
  plants: PlantSummaryView[]
}

export interface CreateBedRequest {
  name: string
  location?: string
  size?: string
  sunlight?: string
  soil_type?: string
  notes?: string
}

export interface CreateContainerRequest {
  name: string
  container_type: string
  size_gallons: number
  location: string
  is_mobile?: boolean
  notes?: string
}

export interface UpdateGardenProfileRequest {
  climate_zone?: string
  frost_date_last_spring?: string
  frost_date_first_fall?: string
  soil_type?: string
  tray_capacity?: number
  tray_indoor_capacity?: number
  location_label?: string
  latitude?: number
  longitude?: number
  hard_constraints?: Record<string, unknown>
  soft_preferences?: Record<string, unknown>
  remove_hard_constraints?: string[]
  remove_soft_preferences?: string[]
  notes?: string
}

export interface UpdateBedRequest {
  soil_type?: string
  sunlight?: string
  dimensions_sqft?: number
  location?: string
  notes?: string
}

export interface UpdateContainerRequest {
  location?: string
  notes?: string
}

export interface CreatePlantRequest {
  name: string
  variety?: string
  quantity?: number
  bed_id?: string
  container_id?: string
  source?: string
  sow_date?: string
  notes?: string
}

export interface BatchCreatePlantRequest extends CreatePlantRequest {
  quantity: number
}

export interface UpdatePlantRequest {
  status?: string
  is_flowering?: boolean
  is_fruiting?: boolean
  last_fertilized_at?: string
  fertilizing_schedule?: string
  special_instructions?: string
  notes?: string
}

export interface BatchUpdatePlantsRequest {
  name: string
  project_id?: string
  variety?: string
  current_status?: string
  quantity?: number
  new_status?: string
  is_flowering?: boolean
  is_fruiting?: boolean
  red_cup_date?: string
  transplant_date?: string
  last_fertilized_at?: string
  fertilizing_schedule?: string
  special_instructions?: string
  update_reason?: string
  notes?: string
}

export interface RecordCareRequest {
  care_type: 'watered' | 'fertilized' | 'amended' | 'inspected' | 'treated' | 'pruned'
  notes?: string
  recorded_at?: string
}

export interface CareRecordResult {
  task: TaskSummaryView | null
  care_state: CareStateView
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export interface TaskSummaryView {
  id: string
  project_id: string
  title: string
  type: string
  status: string
  priority?: string
  scheduled_date?: string
  earliest_start?: string
  window_start?: string
  window_end?: string
  deadline?: string
  estimated_minutes: number
  is_user_modified: boolean
  created_at: string
  urgency?: string
  blocked?: boolean
  due_date?: string
  score?: number
}

export interface TaskDetailView extends TaskSummaryView {
  description?: string
  series_id?: string
  source_type: string
  generator_key: string
  completed_at?: string
  deferred_until?: string
  actual_minutes?: number
  reversible: boolean
  what_happens_if_skipped?: string
  what_happens_if_delayed?: string
  linked_subjects: unknown[]
  notes?: string
  updated_at?: string
}

export interface TaskSeriesView {
  id: string
  project_id: string
  title: string
  description?: string
  type: string
  cadence: string
  cadence_days?: number
  linked_subjects: unknown[]
  default_estimated_minutes: number
  next_generation_date?: string
  active: boolean
  source_type: string
  created_at: string
  updated_at?: string
}

export interface CreateTaskRequest {
  project_id: string
  title: string
  type: string
  priority?: string
  scheduled_date?: string
  earliest_start?: string
  window_start?: string
  window_end?: string
  deadline?: string
  estimated_minutes?: number
  notes?: string
  linked_subjects?: unknown[]
  reversible?: boolean
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  scheduled_date?: string
  earliest_start?: string
  window_start?: string
  window_end?: string
  deadline?: string
  estimated_minutes?: number
  notes?: string
  status?: string
  reversible?: boolean
  what_happens_if_skipped?: string
  what_happens_if_delayed?: string
  priority?: string
}

export interface TaskDateUpdate {
  task_id: string
  scheduled_date?: string
  window_start?: string
  window_end?: string
  deadline?: string
}

export interface CreateTaskSeriesRequest {
  project_id: string
  title_template: string
  type: string
  priority?: string
  estimated_minutes?: number
  cadence: string
  window_days?: number
  linked_subjects?: unknown[]
  start_date?: string
  end_date?: string
  reversible?: boolean
}

export interface UpdateTaskSeriesRequest {
  title?: string
  description?: string
  cadence?: string
  cadence_days?: number
  next_generation_date?: string
  default_estimated_minutes?: number
  active?: boolean
}

// ---------------------------------------------------------------------------
// Calendar annotations
// ---------------------------------------------------------------------------

export interface CalendarAnnotationView {
  id: string
  user_id: string
  date: string
  content: string
  category?: string
  color?: string
  created_at: string
  updated_at?: string
}

export interface CreateAnnotationRequest {
  date: string
  content: string
  category?: string
  color?: string
}

export interface UpdateAnnotationRequest {
  content?: string
  category?: string
  color?: string
}

// ---------------------------------------------------------------------------
// Shopping list
// ---------------------------------------------------------------------------

export interface ShoppingItemView {
  id: string
  project_id?: string
  name: string
  category: string
  quantity?: number
  unit?: string
  estimated_cost?: number
  supplier?: string
  notes?: string
  status: string
  priority: string
  expense_id?: string
  created_at: string
  updated_at?: string
}

export interface CreateShoppingRequest {
  name: string
  category: string
  project_id?: string
  quantity?: number
  unit?: string
  estimated_cost?: number
  supplier?: string
  notes?: string
  priority?: string
}

export interface UpdateShoppingRequest {
  name?: string
  category?: string
  project_id?: string
  quantity?: number
  unit?: string
  estimated_cost?: number
  supplier?: string
  notes?: string
  status?: string
  priority?: string
}

// ---------------------------------------------------------------------------
// Unified search
// ---------------------------------------------------------------------------

export interface SearchResultItemView {
  subject_type: string
  subject_id: string
  label: string
  secondary_label?: string
  summary?: string
}

export interface SearchResultsView {
  results: SearchResultItemView[]
  by_type: Record<string, number>
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export interface MonitorAlertView {
  id: string
  alert_type: string
  severity: string
  title: string
  body: string
  created_at: string
  expires_at: string
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface PendingInteractionSummary {
  id: string
  title: string
  interaction_type: string
}

export interface ActiveJobView {
  job_id: string
  title: string
  status: string
  step?: string
}

export interface NotificationsSnapshot {
  alerts: MonitorAlertView[]
  pending_interactions: PendingInteractionSummary[]
  active_jobs: ActiveJobView[]
}

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------

export interface InteractionActionView {
  id: string
  label: string
  kind: string
  style_hint: string
  input_schema?: Record<string, unknown>[]
}

export interface InteractionEnvelopeView {
  id: string
  interaction_type: string
  status: string
  title: string
  summary: string
  body?: string
  sections: Record<string, unknown>[]
  actions: InteractionActionView[]
  context: Record<string, unknown>
  created_at: string
  resolved_at?: string
  resolution_action?: string
  resolution_summary?: string
}

export interface ResolveInteractionRequest {
  action: string
  notes?: string
}

// ---------------------------------------------------------------------------
// Threads
// ---------------------------------------------------------------------------

export interface ThreadView {
  id: string
  title?: string
  project_id?: string
  last_message_preview?: string
  last_active_at?: string
  message_count: number
  pinned_context: ContextObject[]
  created_at: string
}

export interface ThreadMessagesResponse {
  messages: Record<string, unknown>[]
}

export interface ContextObject {
  subject_type: string
  subject_id: string
}

export interface CreateThreadRequest {
  thread_id: string
  title?: string
  project_id?: string
  initial_context?: ContextObject[]
}

// ---------------------------------------------------------------------------
// Triage
// ---------------------------------------------------------------------------

export interface TriageSnapshotView {
  id: string
  created_at: string
  reasoning_summary: string
  user_focus_summary?: string
  weather_snapshot_id?: string
  urgent_tasks: TaskSummaryView[]
  routine_tasks: TaskSummaryView[]
  project_tasks: TaskSummaryView[]
}

// ---------------------------------------------------------------------------
// Weather
// ---------------------------------------------------------------------------

export interface WeatherDayImpactView {
  date: string
  impact_type: string
  severity: string
  summary: string
  reason?: string
  timing_advice?: string
}

export interface WeatherRecommendedActionView {
  date: string
  action: string
}

export interface WeatherSnapshotView {
  id: string
  created_at: string
  location_label: string
  timezone: string
  forecast_start_date: string
  forecast_end_date: string
  conditions_summary: string
  alerts_summary?: string
  derived_impacts: WeatherDayImpactView[]
  recommended_actions: WeatherRecommendedActionView[]
}

export interface WeatherImpactedTaskView {
  task_id: string
  task_title: string
  project_id?: string
  impact_type: string
  impact_kind: string
  impact_date?: string
  summary: string
}

export interface WeatherTaskChangeSetView {
  id: string
  status: string
  summary: string
  weather_snapshot_id: string
  created_at: string
  approved_at?: string
  affected_tasks: TaskSummaryView[]
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export interface ActivitySubjectView {
  subject_type: string
  subject_id: string
  role?: string
}

export interface ActivityEventView {
  id: string
  created_at: string
  actor_type: string
  actor_label?: string
  event_type: string
  category: string
  summary: string
  notes?: string
  project_id?: string
  subjects: ActivitySubjectView[]
}

// ---------------------------------------------------------------------------
// Plant batches
// ---------------------------------------------------------------------------

export interface PlantBatchResultView {
  batch_id: string
  batch_name: string
  plant_name: string
  variety?: string
  quantity_sown: number
  project_id?: string
  created_at: string
  plants: PlantSummaryView[]
}
