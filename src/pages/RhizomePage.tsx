import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  MessageSquare,
  PanelLeftClose,
  PanelRightClose,
  Pin,
  Plus,
  Search,
  Send,
  Sun,
  Sprout,
  Thermometer,
  Wind,
  X,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FilterSelect } from '@/components/activity/FilterControls'
import Button from '@/components/primitives/Button/Button'
import MarkdownMessage from '@/components/primitives/MarkdownMessage/MarkdownMessage'
import Textarea from '@/components/primitives/Textarea/Textarea'
import ContextAutocomplete from '@/components/rhizome/ContextAutocomplete'
import {
  addThreadContext,
  createThread,
  getThread,
  getThreadMessages,
  getThreadSessionContext,
  listThreads,
  removeThreadContext,
  streamChat,
  streamResume,
  updateThreadSessionContext,
} from '@/lib/api/chat'
import { getPendingInteraction } from '@/lib/api/interactions'
import { search } from '@/lib/api/search'
import { listTasksDaily } from '@/lib/api/tasks'
import { getLatestTriage } from '@/lib/api/triage'
import { getLatestWeather } from '@/lib/api/weather'
import { useAuth } from '@/lib/auth/context'
import type {
  ContextObject,
  InteractionActionView,
  InteractionEnvelopeView,
  SearchResultItemView,
  SessionContextView,
  TaskSummaryView,
  ThreadMessageView,
  ThreadView,
  UpdateSessionContextRequest,
} from '@/lib/types/rhizome'
import s from './RhizomePage.module.css'

const THREAD_LIMIT = 20
const RECENT_THREAD_LIMIT = 3
const EMPTY_THREADS: ThreadView[] = []
const EMPTY_CONTEXT: ContextObject[] = []
const EMPTY_SEARCH_RESULTS: SearchResultItemView[] = []
const CONTEXT_TYPE_ALIASES = new Map([
  ['plant', 'plant'],
  ['plants', 'plant'],
  ['batch', 'batch'],
  ['batches', 'batch'],
  ['bed', 'bed'],
  ['beds', 'bed'],
  ['container', 'container'],
  ['containers', 'container'],
  ['task', 'task'],
  ['tasks', 'task'],
  ['project', 'project'],
  ['projects', 'project'],
  ['incident', 'incident'],
  ['incidents', 'incident'],
])

type EnergyLevel = NonNullable<SessionContextView['energy_level']>
type LocationType = NonNullable<SessionContextView['preferred_location_type']>

interface SessionDraft {
  available_minutes: string
  energy_level: EnergyLevel | ''
  preferred_location_type: LocationType | ''
  open_to_outdoor_work: boolean
  wants_quick_wins: boolean
}

interface StartThreadDraft {
  time_today: string
  energy: string
}

type FocusContext = ContextObject | null

interface ComposerContextTrigger {
  start: number
  end: number
  q: string
  types: string
}

interface ComposerAutocompletePosition {
  left: number
  top: number
}

const EMPTY_SESSION_DRAFT: SessionDraft = {
  available_minutes: '',
  energy_level: '',
  preferred_location_type: '',
  open_to_outdoor_work: false,
  wants_quick_wins: false,
}

const EMPTY_START_THREAD_DRAFT: StartThreadDraft = {
  time_today: '',
  energy: '',
}

function formatDate(value?: string): string {
  if (!value) return 'No activity yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No activity yet'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function threadTitle(thread?: ThreadView): string {
  return thread?.title?.trim() || 'Untitled thread'
}

function threadPreview(thread: ThreadView): string {
  return thread.last_message_preview?.trim() || 'No messages yet'
}

function modelLabel(provider?: string | null, model?: string | null): string {
  if (!provider && !model) return 'Model not set'
  if (!provider) return model ?? 'Model not set'
  if (!model) return provider
  return `${provider} · ${model}`
}

function titleCase(value?: string | null): string {
  if (!value) return 'Not set'
  return value.slice(0, 1).toUpperCase() + value.slice(1)
}

function sessionDraftFromContext(context?: SessionContextView): SessionDraft {
  if (!context) return EMPTY_SESSION_DRAFT
  return {
    available_minutes: context.available_minutes ? String(context.available_minutes) : '',
    energy_level: context.energy_level ?? '',
    preferred_location_type: context.preferred_location_type ?? '',
    open_to_outdoor_work: Boolean(context.open_to_outdoor_work),
    wants_quick_wins: Boolean(context.wants_quick_wins),
  }
}

function sessionSourceLabel(context?: SessionContextView): string | null {
  if (!context || context.source === 'unset') return null
  return context.source === 'user' ? 'User set' : 'Inferred'
}

function sessionTimeLabel(context?: SessionContextView): string {
  if (!context?.available_minutes) return 'Not set'
  return `${context.available_minutes} minutes`
}

function sessionFocusLabel(context?: SessionContextView): string {
  return context?.focus_label?.trim() || 'Not set'
}

function weatherObservedLabel(value?: string): string {
  if (!value) return 'Latest weather'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Latest weather'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function firstWeatherMetric(summary: string | undefined, pattern: RegExp): string | null {
  const match = summary?.match(pattern)
  return match?.[1] ?? null
}

function weatherTemperatureLabel(summary?: string): string {
  const high = firstWeatherMetric(summary, /high\s+([0-9.]+)F-equivalent/i)
  if (high) return `${Math.round(Number(high))}`
  return '--'
}

function weatherIconKind(
  summary?: string,
  alerts?: string,
): 'rain' | 'heat' | 'smoke' | 'wind' | 'cloud' | 'alert' | 'clear' {
  const text = `${summary ?? ''} ${alerts ?? ''}`.toLowerCase()
  if (text.includes('smoke') || text.includes('air quality')) return 'smoke'
  if (text.includes('heat')) return 'heat'
  if (text.includes('rain')) return 'rain'
  if (text.includes('wind') || text.includes('breezy')) return 'wind'
  if (text.includes('cloud') || text.includes('overcast')) return 'cloud'
  if (text.includes('storm') || text.includes('alert') || text.includes('warning')) return 'alert'
  return 'clear'
}

function WeatherIcon({ kind }: { kind: ReturnType<typeof weatherIconKind> }) {
  const className = [s.weatherIcon, s[`weatherIcon${titleCase(kind)}`]].join(' ')

  switch (kind) {
    case 'rain':
      return <CloudRain className={className} aria-hidden="true" />
    case 'heat':
    case 'smoke':
    case 'alert':
      return <AlertTriangle className={className} aria-hidden="true" />
    case 'wind':
      return <Wind className={className} aria-hidden="true" />
    case 'cloud':
      return <Cloud className={className} aria-hidden="true" />
    case 'clear':
      return <Sun className={className} aria-hidden="true" />
    default:
      return <CloudSun className={className} aria-hidden="true" />
  }
}

function contextLabel(context: ContextObject): string {
  if (context.label?.trim()) return context.label
  return `${titleCase(context.subject_type)} ${context.subject_id}`
}

function contextKey(context: Pick<ContextObject, 'subject_type' | 'subject_id'>): string {
  return `${context.subject_type}:${context.subject_id}`
}

function contextTypeClass(type: string): string {
  switch (type) {
    case 'plant':
      return s.contextTypePlant
    case 'batch':
      return s.contextTypeBatch
    case 'bed':
      return s.contextTypeBed
    case 'container':
      return s.contextTypeContainer
    case 'task':
      return s.contextTypeTask
    case 'project':
      return s.contextTypeProject
    case 'incident':
      return s.contextTypeIncident
    default:
      return ''
  }
}

function parseContextSearchTerm(term: string): { q: string; types?: string } {
  const trimmed = term.trim()
  const typedMatch = trimmed.match(/^([a-z_]+):(.*)$/i)
  if (!typedMatch) return { q: trimmed }
  const type = CONTEXT_TYPE_ALIASES.get(typedMatch[1].toLowerCase())
  if (!type) return { q: trimmed }
  return { q: typedMatch[2].trim() || type, types: type }
}

function parseComposerContextTrigger(text: string, cursor: number): ComposerContextTrigger | null {
  const beforeCursor = text.slice(0, cursor)
  const match = beforeCursor.match(/(?:^|\s)([a-z_]+):([^\s:]*)$/i)
  if (!match) return null
  const type = CONTEXT_TYPE_ALIASES.get(match[1].toLowerCase())
  if (!type) return null
  const token = `${match[1]}:${match[2]}`
  return {
    start: beforeCursor.length - token.length,
    end: cursor,
    q: match[2].trim() || type,
    types: type,
  }
}

function measureTextareaIndex(textarea: HTMLTextAreaElement, index: number): ComposerAutocompletePosition {
  const style = window.getComputedStyle(textarea)
  const mirror = document.createElement('div')
  const marker = document.createElement('span')
  const properties = [
    'borderBottomWidth',
    'borderLeftWidth',
    'borderRightWidth',
    'borderTopWidth',
    'boxSizing',
    'fontFamily',
    'fontSize',
    'fontStyle',
    'fontWeight',
    'letterSpacing',
    'lineHeight',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'textIndent',
    'textTransform',
    'width',
  ] as const

  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.whiteSpace = 'pre-wrap'
  mirror.style.overflowWrap = 'break-word'
  mirror.style.top = '0'
  mirror.style.left = '-9999px'
  for (const property of properties) {
    mirror.style[property] = style[property]
  }

  marker.textContent = '\u200b'
  mirror.textContent = textarea.value.slice(0, index) || '\u200b'
  mirror.append(marker)
  document.body.append(mirror)

  const mirrorRect = mirror.getBoundingClientRect()
  const markerRect = marker.getBoundingClientRect()
  const position = {
    left: markerRect.left - mirrorRect.left + textarea.offsetLeft - textarea.scrollLeft,
    top: markerRect.top - mirrorRect.top + textarea.offsetTop - textarea.scrollTop,
  }

  mirror.remove()
  return position
}

function interactionTypeLabel(type: string): string {
  return type.replaceAll('_', ' ')
}

function actionButtonLabel(action: InteractionActionView): string {
  return action.label || titleCase(action.id.replaceAll('_', ' '))
}

function actionButtonClass(action: InteractionActionView): string {
  if (action.style_hint === 'primary' || action.kind === 'confirm' || action.id === 'confirm') return s.primaryAction
  if (action.style_hint === 'danger' || action.kind === 'reject' || action.id === 'reject') return s.dangerAction
  return s.secondaryAction
}

function groupContextResults(results: SearchResultItemView[]): Array<[string, SearchResultItemView[]]> {
  const groups = new Map<string, SearchResultItemView[]>()
  for (const result of results) {
    const items = groups.get(result.subject_type) ?? []
    items.push(result)
    groups.set(result.subject_type, items)
  }
  return Array.from(groups.entries())
}

function messageLabel(message: ThreadMessageView): string {
  return message.role === 'user' ? 'You' : 'Rhizome'
}

function messageClass(message: ThreadMessageView): string {
  return message.role === 'user' ? s.userMessage : s.rhizomeMessage
}

function messageKey(message: ThreadMessageView): string {
  return `${message.role}:${message.content}`
}

function dateLabel(value?: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function taskMeta(task: TaskSummaryView): string {
  return [task.urgency ?? task.priority, task.status, task.estimated_minutes ? `${task.estimated_minutes} min` : null]
    .filter(Boolean)
    .join(' · ')
}

function shortlistFromTriage(tasks?: {
  urgent_tasks: TaskSummaryView[]
  routine_tasks: TaskSummaryView[]
  project_tasks: TaskSummaryView[]
} | null): TaskSummaryView[] {
  if (!tasks) return []
  const seen = new Set<string>()
  const shortlist: TaskSummaryView[] = []
  for (const task of [...tasks.urgent_tasks, ...tasks.routine_tasks, ...tasks.project_tasks]) {
    if (seen.has(task.id)) continue
    seen.add(task.id)
    shortlist.push(task)
    if (shortlist.length === 3) break
  }
  return shortlist
}

export default function RhizomePage() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isNewThread = !threadId
  const [draft, setDraft] = useState('')
  const [threadsPanelOpen, setThreadsPanelOpen] = useState(false)
  const [reviewsPanelOpen, setReviewsPanelOpen] = useState(false)
  const [streamThreadId, setStreamThreadId] = useState<string | null>(null)
  const [pendingMessages, setPendingMessages] = useState<ThreadMessageView[]>([])
  const [streamInteraction, setStreamInteraction] = useState<InteractionEnvelopeView | null>(null)
  const [streamingText, setStreamingText] = useState('')
  const [streamError, setStreamError] = useState<string | null>(null)
  const [retryMessage, setRetryMessage] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [sessionEditing, setSessionEditing] = useState(false)
  const [sessionDraft, setSessionDraft] = useState<SessionDraft>(EMPTY_SESSION_DRAFT)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [interactionNotes, setInteractionNotes] = useState('')
  const [messageContextOpen, setMessageContextOpen] = useState(false)
  const [pinnedContextOpen, setPinnedContextOpen] = useState(false)
  const [activeContextTarget, setActiveContextTarget] = useState<'message' | 'thread' | null>(null)
  const [contextSearchTerm, setContextSearchTerm] = useState('')
  const [messageContext, setMessageContext] = useState<ContextObject[]>([])
  const [composerCursor, setComposerCursor] = useState(0)
  const [startThreadDraft, setStartThreadDraft] = useState<StartThreadDraft>(EMPTY_START_THREAD_DRAFT)
  const [startFocusTerm, setStartFocusTerm] = useState('')
  const [startFocusContext, setStartFocusContext] = useState<FocusContext>(null)
  const [sessionFocusTerm, setSessionFocusTerm] = useState('')
  const [sessionFocusContext, setSessionFocusContext] = useState<FocusContext>(null)
  const [dismissedContextQuery, setDismissedContextQuery] = useState('')
  const [dismissedStartFocusQuery, setDismissedStartFocusQuery] = useState('')
  const [dismissedSessionFocusQuery, setDismissedSessionFocusQuery] = useState('')
  const [dismissedComposerContextQuery, setDismissedComposerContextQuery] = useState('')
  const [composerAutocompletePosition, setComposerAutocompletePosition] =
    useState<ComposerAutocompletePosition | null>(null)
  const streamControllerRef = useRef<AbortController | null>(null)
  const composerTextAreaWrapRef = useRef<HTMLDivElement | null>(null)

  const threadsQuery = useQuery({
    queryKey: ['threads', { limit: THREAD_LIMIT }],
    queryFn: () => listThreads({ limit: THREAD_LIMIT }),
  })
  const threads = threadsQuery.data ?? EMPTY_THREADS
  const activeThreadFromList = useMemo(
    () => threads.find((thread) => thread.thread_id === threadId),
    [threadId, threads],
  )

  const activeThreadQuery = useQuery({
    queryKey: ['threads', threadId],
    queryFn: () => getThread(threadId ?? ''),
    enabled: Boolean(threadId && !threadsQuery.isLoading && !activeThreadFromList),
  })
  const messagesQuery = useQuery({
    queryKey: ['threads', threadId, 'messages'],
    queryFn: () => getThreadMessages(threadId ?? ''),
    enabled: Boolean(threadId),
  })
  const sessionContextQuery = useQuery({
    queryKey: ['threads', threadId, 'session-context'],
    queryFn: () => getThreadSessionContext(threadId ?? ''),
    enabled: Boolean(threadId),
  })
  const pendingInteractionQuery = useQuery({
    queryKey: ['interactions', 'pending'],
    queryFn: getPendingInteraction,
  })
  const blankWeatherQuery = useQuery({
    queryKey: ['weather', 'latest', 'rhizome-start'],
    queryFn: getLatestWeather,
    enabled: isNewThread,
  })
  const latestTriageQuery = useQuery({
    queryKey: ['triage', 'latest', 'rhizome-start'],
    queryFn: getLatestTriage,
    enabled: isNewThread,
  })
  const dailyTasksQuery = useQuery({
    queryKey: ['tasks', 'daily', 'rhizome-start', { limit: 3 }],
    queryFn: () => listTasksDaily({ limit: 3 }),
    enabled: isNewThread,
  })
  const parsedContextSearch = parseContextSearchTerm(contextSearchTerm)
  const contextSearchQuery = useQuery({
    queryKey: ['search', 'context', parsedContextSearch.types ?? 'all', parsedContextSearch.q],
    queryFn: () => search({ ...parsedContextSearch, limit: 8 }),
    enabled: Boolean(activeContextTarget) && parsedContextSearch.q.length >= 2,
  })
  const startFocusQuery = useQuery({
    queryKey: ['search', 'start-focus', startFocusTerm.trim()],
    queryFn: () => search({ q: startFocusTerm.trim(), limit: 6 }),
    enabled: isNewThread && !startFocusContext && startFocusTerm.trim().length >= 2,
  })
  const sessionFocusQuery = useQuery({
    queryKey: ['search', 'session-focus', sessionFocusTerm.trim()],
    queryFn: () => search({ q: sessionFocusTerm.trim(), types: 'project', limit: 6 }),
    enabled: sessionEditing && !sessionFocusContext && sessionFocusTerm.trim().length >= 2,
  })
  const composerContextTrigger = useMemo(
    () => parseComposerContextTrigger(draft, composerCursor),
    [composerCursor, draft],
  )
  const composerContextQueryKey = composerContextTrigger
    ? `${composerContextTrigger.types}:${composerContextTrigger.q}:${composerContextTrigger.start}:${composerContextTrigger.end}`
    : ''
  const composerContextQuery = useQuery({
    queryKey: [
      'search',
      'composer-context',
      composerContextTrigger?.types ?? '',
      composerContextTrigger?.q ?? '',
    ],
    queryFn: () =>
      search({
        q: composerContextTrigger?.q ?? '',
        types: composerContextTrigger?.types,
        limit: 8,
      }),
    enabled: Boolean(composerContextTrigger),
  })
  const updateSessionMutation = useMutation({
    mutationFn: (data: UpdateSessionContextRequest) =>
      updateThreadSessionContext(threadId ?? '', data),
    onSuccess: (context) => {
      queryClient.setQueryData(['threads', threadId, 'session-context'], context)
      setSessionDraft(sessionDraftFromContext(context))
      setSessionFocusContext(null)
      setSessionFocusTerm('')
      setSessionEditing(false)
      setSessionError(null)
    },
    onError: () => {
      setSessionError('Session context could not be saved.')
    },
  })
  const addContextMutation = useMutation({
    mutationFn: (context: ContextObject) => addThreadContext(threadId ?? '', context),
    onSuccess: (_data, context) => {
      updateThreadContextCache(context, 'add')
    },
  })
  const removeContextMutation = useMutation({
    mutationFn: (context: ContextObject) =>
      removeThreadContext(threadId ?? '', context.subject_type, context.subject_id),
    onSuccess: (_data, context) => {
      updateThreadContextCache(context, 'remove')
    },
  })

  const activeThread = activeThreadFromList ?? activeThreadQuery.data
  const sessionContext = sessionContextQuery.data
  const pinnedContext = activeThread?.pinned_context ?? EMPTY_CONTEXT
  const pendingInteraction = streamInteraction ?? pendingInteractionQuery.data ?? null
  const messages = (messagesQuery.data?.messages ?? []).filter((message) => {
    const type = message.type ?? message.role
    return ['human', 'ai', 'user', 'assistant'].includes(type) && message.content.trim()
  })
  const persistedMessageKeys = new Set(messages.map(messageKey))
  const visiblePendingMessages =
    threadId && threadId === streamThreadId
      ? pendingMessages.filter((message) => !persistedMessageKeys.has(messageKey(message)))
      : []
  const visibleMessages = [...messages, ...visiblePendingMessages]
  const visibleStreamingText = threadId && threadId === streamThreadId ? streamingText : ''
  const hasThreads = threads.length > 0
  const recentThreads = threads.slice(0, RECENT_THREAD_LIMIT)
  const pendingReviewCount = pendingInteraction ? 1 : 0
  const hasPendingReviews = pendingReviewCount > 0
  const canSend = draft.trim().length > 0 && !isStreaming
  const currentModelLabel = modelLabel(user?.preferred_provider, user?.preferred_model)
  const currentModelValue = currentModelLabel === 'Model not set' ? '' : 'current'
  const currentModelOptions =
    currentModelValue === 'current' ? [{ value: currentModelValue, label: currentModelLabel }] : []
  const blankWeather = blankWeatherQuery.data
  const triageShortlist = shortlistFromTriage(latestTriageQuery.data)
  const todayShortlist = triageShortlist.length > 0 ? triageShortlist : (dailyTasksQuery.data ?? []).slice(0, 3)
  const weatherKind = weatherIconKind(blankWeather?.conditions_summary, blankWeather?.alerts_summary)
  const weatherRain = firstWeatherMetric(blankWeather?.conditions_summary, /rain\s+([0-9]+(?:\.[0-9]+)?mm)/i)
  const weatherWind = firstWeatherMetric(blankWeather?.conditions_summary, /wind\s+([0-9]+(?:\.[0-9]+)?)/i)
  const activeContextSearchItems = activeContextTarget === 'thread' ? pinnedContext : messageContext
  const groupedContextResults = useMemo(() => {
    const existingContext = new Set(activeContextSearchItems.map(contextKey))
    const groups = new Map<string, SearchResultItemView[]>()
    for (const result of contextSearchQuery.data?.results ?? EMPTY_SEARCH_RESULTS) {
      if (existingContext.has(contextKey(result))) continue
      const items = groups.get(result.subject_type) ?? []
      items.push(result)
      groups.set(result.subject_type, items)
    }
    return Array.from(groups.entries())
  }, [activeContextSearchItems, contextSearchQuery.data?.results])
  const groupedComposerContextResults = useMemo(() => {
    const existingContext = new Set([...pinnedContext, ...messageContext].map(contextKey))
    const groups = new Map<string, SearchResultItemView[]>()
    for (const result of composerContextQuery.data?.results ?? EMPTY_SEARCH_RESULTS) {
      if (existingContext.has(contextKey(result))) continue
      const items = groups.get(result.subject_type) ?? []
      items.push(result)
      groups.set(result.subject_type, items)
    }
    return Array.from(groups.entries())
  }, [composerContextQuery.data?.results, messageContext, pinnedContext])

  useEffect(() => {
    return () => streamControllerRef.current?.abort()
  }, [])

  useLayoutEffect(() => {
    if (!composerContextTrigger) {
      setComposerAutocompletePosition(null)
      return
    }
    const textarea = composerTextAreaWrapRef.current?.querySelector('textarea')
    if (!textarea) return
    setComposerAutocompletePosition(measureTextareaIndex(textarea, composerContextTrigger.start))
  }, [composerContextTrigger, draft])

  function startSessionEdit() {
    setSessionDraft(sessionDraftFromContext(sessionContext))
    setSessionFocusContext(
      sessionContext?.focus_project_id
        ? {
            subject_type: 'project',
            subject_id: sessionContext.focus_project_id,
            label: sessionContext.focus_label ?? 'Project focus',
          }
        : null,
    )
    setSessionFocusTerm(sessionFocusLabel(sessionContext) === 'Not set' ? '' : sessionFocusLabel(sessionContext))
    setSessionError(null)
    setSessionEditing(true)
  }

  function cancelSessionEdit() {
    setSessionDraft(sessionDraftFromContext(sessionContext))
    setSessionFocusContext(null)
    setSessionFocusTerm('')
    setSessionError(null)
    setSessionEditing(false)
  }

  function saveSessionContext() {
    if (!threadId) return
    const minutesText = sessionDraft.available_minutes.trim()
    const minutes = minutesText ? Number(minutesText) : null
    if (minutes !== null && (!Number.isInteger(minutes) || minutes < 0)) {
      setSessionError('Time must be a whole number of minutes.')
      return
    }

    const payload: UpdateSessionContextRequest = {
      available_minutes: minutes,
      energy_level: sessionDraft.energy_level || null,
      preferred_location_type: sessionDraft.preferred_location_type || null,
      open_to_outdoor_work: sessionDraft.open_to_outdoor_work,
      wants_quick_wins: sessionDraft.wants_quick_wins,
      focus_project_id: sessionFocusContext?.subject_type === 'project' ? sessionFocusContext.subject_id : null,
    }
    updateSessionMutation.mutate(payload)
  }

  function setStarterDraft(kind: 'plan' | 'diagnose' | 'prioritize') {
    const prompts = {
      plan: 'Help me plan the next useful step for my garden today.',
      diagnose: 'Help me diagnose an issue in my garden. Ask me what you need to know first.',
      prioritize: 'Look at my garden context and help me prioritize what to do next.',
    }
    setDraft(prompts[kind])
    setComposerCursor(prompts[kind].length)
  }

  function setTaskStarterDraft(task: TaskSummaryView) {
    const prompt = `Can you help me handle this task today: ${task.title}?`
    setDraft(prompt)
    setComposerCursor(prompt.length)
  }

  function startThreadContextText(): string | null {
    const details = [
      startThreadDraft.time_today.trim()
        ? `I have ${startThreadDraft.time_today.trim()}`
        : null,
      startThreadDraft.energy.trim() ? `my energy is ${startThreadDraft.energy.trim()}` : null,
      startFocusContext
        ? `my focus is ${contextLabel(startFocusContext)} (${startFocusContext.subject_type})`
        : startFocusTerm.trim()
          ? `my focus is ${startFocusTerm.trim()}`
          : null,
    ].filter(Boolean)
    return details.length > 0 ? `For this thread, ${details.join(', ')}.` : null
  }

  function messageWithStartContext(message: string): string {
    const contextText = isNewThread ? startThreadContextText() : null
    return contextText ? `${contextText}\n\n${message}` : message
  }

  function updateThreadContextCache(context: ContextObject, mode: 'add' | 'remove') {
    function updateThread(thread: ThreadView): ThreadView {
      const exists = thread.pinned_context.some(
        (item) => item.subject_type === context.subject_type && item.subject_id === context.subject_id,
      )
      const pinned_context =
        mode === 'add'
          ? exists
            ? thread.pinned_context
            : [...thread.pinned_context, context]
          : thread.pinned_context.filter(
              (item) => item.subject_type !== context.subject_type || item.subject_id !== context.subject_id,
            )
      return { ...thread, pinned_context }
    }

    queryClient.setQueryData<ThreadView[]>(['threads', { limit: THREAD_LIMIT }], (threads) =>
      threads?.map((thread) => (thread.thread_id === threadId ? updateThread(thread) : thread)),
    )
    queryClient.setQueryData<ThreadView>(['threads', threadId], (thread) => (thread ? updateThread(thread) : thread))
  }

  function contextFromSearchResult(result: SearchResultItemView): ContextObject {
    return {
      subject_type: result.subject_type,
      subject_id: result.subject_id,
      label: result.label,
    }
  }

  function addMessageContext(context: ContextObject) {
    setMessageContext((current) => {
      const exists = current.some(
        (item) => item.subject_type === context.subject_type && item.subject_id === context.subject_id,
      )
      return exists ? current : [...current, context]
    })
    setMessageContextOpen(true)
  }

  function addContextFromSearchResult(result: SearchResultItemView) {
    const context = contextFromSearchResult(result)
    if (activeContextTarget === 'message') {
      addMessageContext(context)
      setContextSearchTerm('')
      setDismissedContextQuery('')
      return
    }
    if (!threadId) return
    addContextMutation.mutate(context, {
      onSuccess: () => {
        setContextSearchTerm('')
        setDismissedContextQuery('')
      },
    })
  }

  function addComposerContextFromSearchResult(result: SearchResultItemView) {
    if (!composerContextTrigger) return
    addMessageContext(contextFromSearchResult(result))
    setDismissedComposerContextQuery('')
    setDraft((current) => {
      const before = current.slice(0, composerContextTrigger.start).trimEnd()
      const after = current.slice(composerContextTrigger.end).replace(/^\s+/, '')
      const next = [before, after].filter(Boolean).join(before && after ? ' ' : '')
      setComposerCursor(before.length)
      return next
    })
  }

  function removeMessageContext(context: ContextObject) {
    setMessageContext((current) =>
      current.filter(
        (item) => item.subject_type !== context.subject_type || item.subject_id !== context.subject_id,
      ),
    )
  }

  function removePinnedContext(context: ContextObject) {
    if (!threadId) return
    removeContextMutation.mutate(context)
  }

  function openContextTarget(target: 'message' | 'thread') {
    setActiveContextTarget((current) => {
      const nextTarget = current === target ? null : target
      setContextSearchTerm('')
      setDismissedContextQuery('')
      setMessageContextOpen(nextTarget === 'message')
      setPinnedContextOpen(nextTarget === 'thread')
      return nextTarget
    })
  }

  function closeContextTarget(target: 'message' | 'thread') {
    setContextSearchTerm('')
    setDismissedContextQuery('')
    setActiveContextTarget((current) => (current === target ? null : current))
    if (target === 'message') setMessageContextOpen(false)
    else setPinnedContextOpen(false)
  }

  function renderContextInlineInput({
    target,
    label,
    contexts,
    onRemove,
  }: {
    target: 'message' | 'thread'
    label: string
    contexts: ContextObject[]
    onRemove: (context: ContextObject) => void
  }) {
    const isActive = activeContextTarget === target
    const contextQueryKey = `${target}:${contextSearchTerm.trim()}`
    const shouldShowAutocomplete =
      isActive && contextSearchTerm.trim().length > 0 && dismissedContextQuery !== contextQueryKey
    return (
      <div className={s.contextInlineBox} aria-label={label}>
        <div className={s.contextInlineTitle}>
          <span>{label}</span>
          <button
            aria-label={`Close ${label}`}
            type="button"
            onClick={() => closeContextTarget(target)}
          >
            <X size={13} />
          </button>
        </div>
        <div className={s.contextInlineInput}>
          <Search size={14} />
          <span className={s.contextInlineChips}>
            {contexts.map((context) => (
              <span
                className={`${s.contextChip} ${contextTypeClass(context.subject_type)}`}
                key={`${target}-${context.subject_type}-${context.subject_id}`}
              >
                <em>{context.subject_type}</em>
                <span>{contextLabel(context)}</span>
                <button
                  type="button"
                  aria-label={`Remove ${contextLabel(context)} context`}
                  disabled={target === 'thread' && removeContextMutation.isPending}
                  onClick={(event) => {
                    event.stopPropagation()
                    onRemove(context)
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <span className={s.contextSearchAnchor}>
              <input
                aria-label={`Search ${label}`}
                placeholder={contexts.length > 0 ? 'Add another...' : 'Search context...'}
                value={isActive ? contextSearchTerm : ''}
                onFocus={() => {
                  if (!isActive) {
                    setActiveContextTarget(target)
                    setContextSearchTerm('')
                  }
                }}
                onChange={(event) => {
                  if (!isActive) setActiveContextTarget(target)
                  setDismissedContextQuery('')
                  setContextSearchTerm(event.target.value)
                }}
              />
              {shouldShowAutocomplete ? (
                <ContextAutocomplete
                  anchorMode="inline-below-input"
                  selectionMode="multi"
                  groups={groupedContextResults}
                  isTooShort={contextSearchTerm.trim().length > 0 && parsedContextSearch.q.length < 2}
                  isLoading={contextSearchQuery.isLoading}
                  isError={contextSearchQuery.isError}
                  shortLabel="Type at least two characters after the prefix."
                  disabled={target === 'thread' && addContextMutation.isPending}
                  onDismiss={() => setDismissedContextQuery(contextQueryKey)}
                  onSelect={addContextFromSearchResult}
                />
              ) : null}
            </span>
          </span>
        </div>
      </div>
    )
  }

  function renderFocusPicker(mode: 'start' | 'session') {
    const selected = mode === 'start' ? startFocusContext : sessionFocusContext
    const term = mode === 'start' ? startFocusTerm : sessionFocusTerm
    const query = mode === 'start' ? startFocusQuery : sessionFocusQuery
    const label = mode === 'start' ? 'Thread focus' : 'Project focus'
    const placeholder =
      mode === 'start' ? 'Project, task, plant, or open question...' : 'Search projects...'
    const results = query.data?.results ?? EMPTY_SEARCH_RESULTS
    const dismissedFocusQuery =
      mode === 'start' ? dismissedStartFocusQuery : dismissedSessionFocusQuery
    const focusQueryKey = `${mode}:${term.trim()}`
    const shouldShowAutocomplete =
      !selected && term.trim().length > 0 && dismissedFocusQuery !== focusQueryKey

    function setSelected(context: FocusContext) {
      if (mode === 'start') {
        setStartFocusContext(context)
        setStartFocusTerm(context ? contextLabel(context) : '')
        setDismissedStartFocusQuery('')
      } else {
        setSessionFocusContext(context)
        setSessionFocusTerm(context ? contextLabel(context) : '')
        setDismissedSessionFocusQuery('')
      }
    }

    function setTerm(value: string) {
      if (mode === 'start') {
        setStartFocusContext(null)
        setDismissedStartFocusQuery('')
        setStartFocusTerm(value)
      } else {
        setSessionFocusContext(null)
        setDismissedSessionFocusQuery('')
        setSessionFocusTerm(value)
      }
    }

    function dismissFocusAutocomplete() {
      if (mode === 'start') setDismissedStartFocusQuery(focusQueryKey)
      else setDismissedSessionFocusQuery(focusQueryKey)
    }

    return (
      <div className={[s.focusPicker, mode === 'start' ? s.startFocusPicker : s.sessionFocusPicker].join(' ')}>
        <label>
          <span>{label}</span>
          <div className={s.focusInputWrap}>
            <span className={s.focusSearchAnchor}>
              <Pin className={s.focusInputIcon} size={15} aria-hidden="true" />
              {selected ? (
                <span className={`${s.contextChip} ${contextTypeClass(selected.subject_type)}`}>
                  <em>{selected.subject_type}</em>
                  <span>{contextLabel(selected)}</span>
                  <button
                    aria-label={`Clear ${label}`}
                    type="button"
                    onClick={() => setSelected(null)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null}
              <input
                aria-label={label}
                placeholder={selected ? 'Selected' : placeholder}
                type="text"
                value={selected ? '' : term}
                onChange={(event) => setTerm(event.target.value)}
              />
              {shouldShowAutocomplete ? (
                <ContextAutocomplete
                  anchorMode="inline-below-input"
                  selectionMode="single"
                  groups={groupContextResults(results)}
                  isTooShort={term.trim().length < 2}
                  isLoading={query.isLoading}
                  isError={query.isError}
                  loadingLabel="Searching focus"
                  errorLabel="Focus search is unavailable."
                  emptyLabel={mode === 'start' ? 'Use this as free-text focus.' : 'No projects found.'}
                  onDismiss={dismissFocusAutocomplete}
                  onSelect={(result) => setSelected(contextFromSearchResult(result))}
                />
              ) : null}
            </span>
          </div>
        </label>
      </div>
    )
  }

  async function resumeInteraction(action: InteractionActionView) {
    if (!threadId || isStreaming) return
    const controller = new AbortController()
    streamControllerRef.current?.abort()
    streamControllerRef.current = controller
    setIsStreaming(true)
    setStreamError(null)
    setStreamingText('')
    setStreamThreadId(threadId)

    try {
      let responseText = ''
      let sawDone = false
      const resolution = interactionNotes.trim()
        ? `${action.id}\n\nNotes: ${interactionNotes.trim()}`
        : action.id
      for await (const event of streamResume(threadId, resolution, controller.signal)) {
        if (event.type === 'token') {
          responseText += event.content
          setStreamingText(responseText)
        } else if (event.type === 'interaction') {
          setStreamInteraction(event.payload)
          setReviewsPanelOpen(true)
          queryClient.setQueryData(['interactions', 'pending'], event.payload)
        } else if (event.type === 'done') {
          sawDone = true
          break
        }
      }

      if (!sawDone) {
        setStreamingText(`${responseText}\n\nResponse may be incomplete.`)
        setStreamError('Connection dropped before Rhizome finished.')
        return
      }

      if (responseText.trim()) {
        setPendingMessages((current) => [
          ...current,
          { role: 'assistant', content: responseText, type: 'ai' },
        ])
      }
      setStreamingText('')
      setStreamInteraction(null)
      setInteractionNotes('')
      queryClient.setQueryData(['interactions', 'pending'], null)
      void queryClient.invalidateQueries({ queryKey: ['interactions', 'pending'] })
      void queryClient.invalidateQueries({ queryKey: ['threads', threadId, 'messages'] })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStreamError('Connection failed - try again.')
    } finally {
      if (streamControllerRef.current === controller) streamControllerRef.current = null
      setIsStreaming(false)
    }
  }

  async function submitMessage(messageOverride?: string) {
    const message = (messageOverride ?? draft).trim()
    if (!message || isStreaming) return

    let targetThreadId = threadId
    const outboundMessage = messageWithStartContext(message)
    const controller = new AbortController()
    streamControllerRef.current?.abort()
    streamControllerRef.current = controller
    setIsStreaming(true)
    setStreamError(null)
    setRetryMessage(message)
    setStreamingText('')

    try {
      if (!targetThreadId) {
        const createdThread = await createThread({})
        targetThreadId = createdThread.thread_id
        navigate(`/app/rhizome/${encodeURIComponent(targetThreadId)}`)
      }

      const userMessage: ThreadMessageView = { role: 'user', content: message, type: 'human' }
      setDraft('')
      setStreamThreadId(targetThreadId)
      setPendingMessages((current) =>
        targetThreadId === streamThreadId ? [...current, userMessage] : [userMessage],
      )

      let responseText = ''
      let sawDone = false
      let sawInteraction = false
      for await (const event of streamChat(targetThreadId, outboundMessage, controller.signal)) {
        if (event.type === 'token') {
          responseText += event.content
          setStreamingText(responseText)
        } else if (event.type === 'interaction') {
          sawInteraction = true
          setStreamInteraction(event.payload)
          setReviewsPanelOpen(true)
          queryClient.setQueryData(['interactions', 'pending'], event.payload)
        } else if (event.type === 'done') {
          sawDone = true
          break
        }
      }

      if (!sawDone) {
        if (sawInteraction) {
          if (responseText.trim()) {
            setPendingMessages((current) => [
              ...current,
              { role: 'assistant', content: responseText, type: 'ai' },
            ])
          }
          setStreamingText('')
          setStreamError(null)
          setRetryMessage(null)
          return
        }
        const incompleteText = `${responseText}\n\nResponse may be incomplete.`
        setStreamingText(incompleteText)
        setStreamError('Connection dropped before Rhizome finished.')
        return
      }

      const assistantMessage: ThreadMessageView = {
        role: 'assistant',
        content: responseText,
        type: 'ai',
      }
      setPendingMessages((current) => [...current, assistantMessage])
      setStreamingText('')
      setStreamError(null)
      setRetryMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['threads', { limit: THREAD_LIMIT }] })
      void queryClient.invalidateQueries({ queryKey: ['threads', targetThreadId, 'session-context'] })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStreamError('Connection failed - try again.')
    } finally {
      if (streamControllerRef.current === controller) streamControllerRef.current = null
      setIsStreaming(false)
    }
  }

  return (
    <main className={s.page}>
      <header className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>Agent workbench</p>
          <h1 className={s.title}>
            Ask <span>Rhizome</span>
          </h1>
        </div>
        <Button size="sm" type="button" onClick={() => navigate('/app/rhizome')}>
          <Plus size={14} />
          New
        </Button>
      </header>

      <section
        className={[
          s.workbench,
          threadsPanelOpen ? s.withThreads : '',
          hasPendingReviews && reviewsPanelOpen ? s.withReviews : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Rhizome workbench"
      >
        {threadsPanelOpen ? (
          <aside className={s.threadRail} aria-label="Rhizome threads">
            <div className={s.railContent}>
              <div className={s.railHeader}>
                <div>
                  <p className={s.eyebrow}>Navigator</p>
                  <h2>Threads</h2>
                </div>
                <div className={s.railActions}>
                  <button
                    aria-label="Collapse threads panel"
                    className={s.iconButton}
                    type="button"
                    onClick={() => setThreadsPanelOpen(false)}
                  >
                    <PanelLeftClose size={16} />
                  </button>
                </div>
              </div>

              <div className={s.searchBox} aria-hidden="true">
                <Search size={14} />
                <span>Search threads</span>
              </div>

              {threadsQuery.isLoading ? (
                <div className={s.railState}>Loading threads</div>
              ) : threadsQuery.isError ? (
                <div className={s.railState}>Threads are unavailable right now.</div>
              ) : hasThreads ? (
                <nav className={s.threadList} aria-label="Recent threads">
                  <Link
                    className={[s.threadRow, isNewThread ? s.activeThread : '']
                      .filter(Boolean)
                      .join(' ')}
                    to="/app/rhizome"
                  >
                    <span>
                      <strong>New thread</strong>
                      <small>Start with a blank composer</small>
                    </span>
                  </Link>
                  {threads.map((thread) => (
                    <Link
                      className={[s.threadRow, thread.thread_id === threadId ? s.activeThread : '']
                        .filter(Boolean)
                        .join(' ')}
                      key={thread.thread_id}
                      to={`/app/rhizome/${encodeURIComponent(thread.thread_id)}`}
                    >
                      <span>
                        <strong>{threadTitle(thread)}</strong>
                        <small>{threadPreview(thread)}</small>
                      </span>
                      <time>{formatDate(thread.last_active_at)}</time>
                    </Link>
                  ))}
                </nav>
              ) : (
                <div className={s.noThreads}>
                  <Sprout size={22} />
                  <strong>No threads yet</strong>
                  <span>
                    Start with a question, a plan, or a garden object you want Rhizome to reason
                    about.
                  </span>
                </div>
              )}
            </div>
          </aside>
        ) : null}

        <section className={s.chatPane} aria-label="Conversation with Rhizome">
          <header className={s.topbar}>
            <div>
              <p className={s.eyebrow}>{isNewThread ? 'New conversation' : 'Active thread'}</p>
              {isNewThread ? (
                <h2>Blank thread</h2>
              ) : (
                <button
                  className={s.threadTitleButton}
                  type="button"
                  onClick={() => setThreadsPanelOpen(true)}
                >
                  {threadTitle(activeThread)}
                </button>
              )}
            </div>
          </header>

          {streamError ? (
            <div className={s.streamError} role="alert">
              <span>{streamError}</span>
              {retryMessage ? (
                <button type="button" onClick={() => void submitMessage(retryMessage)}>
                  Retry
                </button>
              ) : null}
            </div>
          ) : null}

          {!isNewThread && sessionEditing ? (
            <form
              className={[s.sessionStrip, s.sessionEditing].join(' ')}
              aria-label="Session context"
              onSubmit={(event) => {
                event.preventDefault()
                saveSessionContext()
              }}
            >
              <label className={s.sessionCard}>
                <span>Time today</span>
                <input
                  aria-label="Time today"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  type="number"
                  value={sessionDraft.available_minutes}
                  onChange={(event) =>
                    setSessionDraft((current) => ({
                      ...current,
                      available_minutes: event.target.value,
                    }))
                  }
                />
              </label>
              <label className={s.sessionCard}>
                <span>Energy</span>
                <select
                  aria-label="Energy"
                  value={sessionDraft.energy_level}
                  onChange={(event) =>
                    setSessionDraft((current) => ({
                      ...current,
                      energy_level: event.target.value as SessionDraft['energy_level'],
                    }))
                  }
                >
                  <option value="">Not set</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <div className={s.sessionCard}>{renderFocusPicker('session')}</div>
              <label className={s.sessionCard}>
                <span>Location</span>
                <select
                  aria-label="Preferred location"
                  value={sessionDraft.preferred_location_type}
                  onChange={(event) =>
                    setSessionDraft((current) => ({
                      ...current,
                      preferred_location_type: event.target.value as SessionDraft['preferred_location_type'],
                    }))
                  }
                >
                  <option value="">Not set</option>
                  <option value="bed">Bed</option>
                  <option value="container">Container</option>
                </select>
              </label>
              <label className={[s.sessionCard, s.sessionCheck].join(' ')}>
                <input
                  type="checkbox"
                  checked={sessionDraft.open_to_outdoor_work}
                  onChange={(event) =>
                    setSessionDraft((current) => ({
                      ...current,
                      open_to_outdoor_work: event.target.checked,
                    }))
                  }
                />
                <span>Outdoor work</span>
              </label>
              <label className={[s.sessionCard, s.sessionCheck].join(' ')}>
                <input
                  type="checkbox"
                  checked={sessionDraft.wants_quick_wins}
                  onChange={(event) =>
                    setSessionDraft((current) => ({
                      ...current,
                      wants_quick_wins: event.target.checked,
                    }))
                  }
                />
                <span>Quick wins</span>
              </label>
              <div className={s.sessionActions}>
                {sessionError ? <span role="alert">{sessionError}</span> : null}
                <button
                  type="submit"
                  disabled={updateSessionMutation.isPending}
                >
                  {updateSessionMutation.isPending ? 'Saving' : 'Save'}
                </button>
                <button type="button" onClick={cancelSessionEdit}>
                  Cancel
                </button>
              </div>
            </form>
          ) : !isNewThread ? (
            <div className={s.sessionStrip} aria-label="Session context">
              <button
                aria-label="Edit time today"
                className={s.sessionCard}
                type="button"
                disabled={sessionContextQuery.isLoading || sessionContextQuery.isError}
                onClick={startSessionEdit}
              >
                <span>Time</span>
                <strong>
                  {sessionContextQuery.isLoading ? 'Loading' : sessionTimeLabel(sessionContext)}
                </strong>
                {sessionSourceLabel(sessionContext) ? <small>{sessionSourceLabel(sessionContext)}</small> : null}
              </button>
              <button
                aria-label="Edit energy"
                className={s.sessionCard}
                type="button"
                disabled={sessionContextQuery.isLoading || sessionContextQuery.isError}
                onClick={startSessionEdit}
              >
                <span>Energy</span>
                <strong>
                  {sessionContextQuery.isLoading ? 'Loading' : titleCase(sessionContext?.energy_level)}
                </strong>
              </button>
              <button
                aria-label="Edit focus"
                className={s.sessionCard}
                type="button"
                disabled={sessionContextQuery.isLoading || sessionContextQuery.isError}
                onClick={startSessionEdit}
              >
                <span>Focus</span>
                <strong>
                  {sessionContextQuery.isLoading ? 'Loading' : sessionFocusLabel(sessionContext)}
                </strong>
              </button>
              {hasPendingReviews ? (
                <button
                  aria-label="Open pending reviews"
                  className={s.reviewButton}
                  type="button"
                  onClick={() => setReviewsPanelOpen(true)}
                >
                  <span>Review</span>
                  <strong>{pendingReviewCount}</strong>
                </button>
              ) : null}
            </div>
          ) : null}

          {threadId && (pinnedContextOpen || pinnedContext.length > 0) ? (
            <div className={s.pinnedContextSection}>
              {renderContextInlineInput({
                target: 'thread',
                label: 'Pinned context for this thread',
                contexts: pinnedContext,
                onRemove: removePinnedContext,
              })}
            </div>
          ) : null}

          <div className={s.threadBody}>
            {threadId && activeThreadQuery.isLoading ? (
              <div className={s.emptyChat}>Loading thread</div>
            ) : threadId && activeThreadQuery.isError ? (
              <div className={s.emptyChat}>This thread could not load.</div>
            ) : isNewThread ? (
              <div className={[s.emptyChat, s.startThreadState].join(' ')}>
                <section className={s.startPanel} aria-label="Start a Rhizome thread">
                  <div className={s.startCardGrid}>
                    <article className={s.startContextCard}>
                      <p className={s.eyebrow}>Before we start</p>
                      <label>
                        <span>Time today</span>
                        <input
                          aria-label="Start time today"
                          placeholder="45 minutes, all afternoon..."
                          type="text"
                          value={startThreadDraft.time_today}
                          onChange={(event) =>
                            setStartThreadDraft((current) => ({
                              ...current,
                              time_today: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label>
                        <span>Energy</span>
                        <input
                          aria-label="Start energy"
                          placeholder="low, focused, tired but can water..."
                          type="text"
                          value={startThreadDraft.energy}
                          onChange={(event) =>
                            setStartThreadDraft((current) => ({
                              ...current,
                              energy: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </article>

                    <article className={s.weatherStartCard}>
                      <div className={s.weatherCardTop}>
                        <p className={s.eyebrow}>Weather</p>
                        <span>{weatherObservedLabel(blankWeather?.created_at)}</span>
                      </div>
                      <div className={s.weatherHero}>
                        <WeatherIcon kind={weatherKind} />
                        <span
                          className={s.weatherTemp}
                          aria-label={
                            blankWeatherQuery.isLoading
                              ? 'Weather loading'
                              : `${weatherTemperatureLabel(blankWeather?.conditions_summary)} degrees Fahrenheit`
                          }
                        >
                          <strong>
                            {blankWeatherQuery.isLoading
                              ? 'Loading'
                              : weatherTemperatureLabel(blankWeather?.conditions_summary)}
                          </strong>
                          {!blankWeatherQuery.isLoading && <span>°F</span>}
                        </span>
                      </div>
                      <div className={s.weatherMetrics} aria-label="Weather details">
                        <span>
                          <Droplets size={12} />
                          {weatherRain ?? '--'}
                        </span>
                        <span>
                          <Wind size={12} />
                          {weatherWind ? `${weatherWind} mph` : '--'}
                        </span>
                        <span>
                          <Thermometer size={12} />
                          {blankWeather?.location_label ?? '--'}
                        </span>
                      </div>
                    </article>

                    <article className={s.startFocusCard}>
                      <p className={s.eyebrow}>Focus</p>
                      {renderFocusPicker('start')}
                    </article>
                  </div>
                </section>

                <div className={s.startThreadIntro}>
                  <Sprout size={26} />
                  <strong>Start a thread when you are ready.</strong>
                  <span>Rhizome will wait until you send the first message.</span>
                  <div className={s.startChips}>
                    <button type="button" onClick={() => setStarterDraft('plan')}>
                      Plan
                    </button>
                    <button type="button" onClick={() => setStarterDraft('diagnose')}>
                      Diagnose
                    </button>
                    <button type="button" onClick={() => setStarterDraft('prioritize')}>
                      Prioritize
                    </button>
                  </div>
                </div>
                {todayShortlist.length > 0 ? (
                  <section className={s.todayShortlist} aria-label="Today's task shortlist">
                    <div className={s.shortlistHeader}>
                      <span>Today shortlist</span>
                      <small>
                        {triageShortlist.length > 0 ? 'From latest triage' : 'From daily tasks'}
                      </small>
                    </div>
                    <div className={s.shortlistRows}>
                      {todayShortlist.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => setTaskStarterDraft(task)}
                        >
                          <strong>{task.title}</strong>
                          <small>{taskMeta(task)}</small>
                        </button>
                      ))}
                    </div>
                  </section>
                ) : latestTriageQuery.isLoading || dailyTasksQuery.isLoading ? (
                  <section className={s.todayShortlist} aria-label="Today's task shortlist">
                    <div className={s.shortlistHeader}>
                      <span>Today shortlist</span>
                      <small>Loading</small>
                    </div>
                  </section>
                ) : null}
                {recentThreads.length > 0 ? (
                  <div className={s.recentThreads} aria-label="Recent thread shortcuts">
                    {recentThreads.map((thread) => (
                      <Link
                        key={thread.thread_id}
                        to={`/app/rhizome/${encodeURIComponent(thread.thread_id)}`}
                      >
                        <strong>{threadTitle(thread)}</strong>
                        <small>{threadPreview(thread)}</small>
                      </Link>
                    ))}
                    {threads.length > RECENT_THREAD_LIMIT ? (
                      <button type="button" onClick={() => setThreadsPanelOpen(true)}>
                        Look through more threads
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className={s.recentThreads} aria-label="Thread navigator shortcut">
                    <button type="button" onClick={() => setThreadsPanelOpen(true)}>
                      Browse threads
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {messagesQuery.isLoading ? (
                  <div className={s.emptyChat}>Loading messages</div>
                ) : messagesQuery.isError ? (
                  <div className={s.emptyChat}>
                    <MessageSquare size={26} />
                    <strong>Message history could not load.</strong>
                    <span>Try again or choose another thread.</span>
                    <button type="button" onClick={() => void messagesQuery.refetch()}>
                      Retry
                    </button>
                  </div>
                ) : visibleMessages.length === 0 && !visibleStreamingText ? (
                  <div className={s.emptyChat}>
                    <MessageSquare size={26} />
                    <strong>No messages in this thread yet.</strong>
                    <span>Use the composer below to send the first message.</span>
                  </div>
                ) : (
                  <ol className={s.messageList} aria-label="Thread messages">
                    {visibleMessages.map((message, index) => {
                      const label = dateLabel(message.created_at)
                      const previousLabel = dateLabel(visibleMessages[index - 1]?.created_at)
                      const showDaySeparator = label && label !== previousLabel
                      return (
                        <li key={`${message.role}-${message.type ?? 'message'}-${index}`}>
                          {showDaySeparator ? <div className={s.daySeparator}>{label}</div> : null}
                          <article className={[s.messageBubble, messageClass(message)].join(' ')}>
                            <div className={s.messageMeta}>{messageLabel(message)}</div>
                            <MarkdownMessage content={message.content} />
                          </article>
                        </li>
                      )
                    })}
                    {visibleStreamingText || isStreaming ? (
                      <li>
                        <article className={[s.messageBubble, s.rhizomeMessage, s.streamingMessage].join(' ')}>
                          <div className={s.messageMeta}>Rhizome</div>
                          <MarkdownMessage content={visibleStreamingText || 'Rhizome is thinking...'} />
                        </article>
                      </li>
                    ) : null}
                  </ol>
                )}
              </>
            )}
          </div>

          <form
            className={s.composer}
            onSubmit={(event) => {
              event.preventDefault()
              void submitMessage()
            }}
          >
            <div className={s.composerBox}>
              {messageContextOpen ? (
                <div className={s.messageContextSection}>
                  {renderContextInlineInput({
                    target: 'message',
                    label: 'Message context',
                    contexts: messageContext,
                    onRemove: removeMessageContext,
                  })}
                </div>
              ) : null}

              <div className={s.composerTextAreaWrap} ref={composerTextAreaWrapRef}>
                <Textarea
                  aria-label="Message Rhizome"
                  placeholder="Ask Rhizome about tasks, plants, projects, weather, or incidents..."
                  value={draft}
                  onChange={(event) => {
                    setDismissedComposerContextQuery('')
                    setDraft(event.target.value)
                    setComposerCursor(event.target.selectionStart ?? event.target.value.length)
                  }}
                  onClick={(event) => setComposerCursor(event.currentTarget.selectionStart ?? draft.length)}
                  onKeyUp={(event) => setComposerCursor(event.currentTarget.selectionStart ?? draft.length)}
                  onSelect={(event) => setComposerCursor(event.currentTarget.selectionStart ?? draft.length)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void submitMessage()
                    }
                  }}
                />
                {composerContextTrigger && dismissedComposerContextQuery !== composerContextQueryKey ? (
                  <ContextAutocomplete
                    anchorMode="textarea-token"
                    selectionMode="multi"
                    groups={groupedComposerContextResults}
                    isLoading={composerContextQuery.isLoading}
                    isError={composerContextQuery.isError}
                    style={
                      composerAutocompletePosition
                        ? {
                            left: `${Math.max(0, composerAutocompletePosition.left - 4)}px`,
                            top: `${composerAutocompletePosition.top}px`,
                          }
                        : undefined
                    }
                    onDismiss={() => setDismissedComposerContextQuery(composerContextQueryKey)}
                    onSelect={addComposerContextFromSearchResult}
                  />
                ) : null}
              </div>
              <div className={s.composerControlRow}>
                <div className={s.composerContextButtons}>
                  <button
                    aria-expanded={messageContextOpen}
                    aria-label={messageContextOpen ? 'Close message context' : 'Add message context'}
                    className={s.composerAddContext}
                    type="button"
                    onClick={() => openContextTarget('message')}
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    aria-expanded={pinnedContextOpen}
                    aria-label={pinnedContextOpen ? 'Close pinned context' : 'Add pinned context'}
                    className={s.composerPinContext}
                    type="button"
                    disabled={!threadId}
                    onClick={() => openContextTarget('thread')}
                  >
                    <Pin size={13} />
                  </button>
                </div>
                <div className={s.composerRightControls}>
                  <div
                    className={s.composerModelSelector}
                    title="Model switching will be editable after Cambium supports profile updates."
                  >
                    <FilterSelect
                      label="Model"
                      value={currentModelValue}
                      placeholder="Model not set"
                      options={currentModelOptions}
                      disabled
                      onChange={() => {}}
                    />
                  </div>
                  <Button className={s.composerSend} size="sm" type="submit" disabled={!canSend}>
                    <Send size={15} />
                    {isStreaming ? 'Sending' : 'Send'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </section>

        {hasPendingReviews && reviewsPanelOpen ? (
          <aside className={s.reviewPanel} aria-label="Pending Rhizome reviews">
            <div className={s.railContent}>
              <div className={s.railHeader}>
                <div>
                  <p className={s.eyebrow}>Current interaction</p>
                  <h2>{pendingInteraction?.title ?? 'Pending review'}</h2>
                </div>
                <button
                  aria-label="Collapse reviews panel"
                  className={s.iconButton}
                  type="button"
                  onClick={() => setReviewsPanelOpen(false)}
                >
                  <PanelRightClose size={16} />
                </button>
              </div>
              {pendingInteraction ? (
                <div className={s.interactionCard}>
                  <div className={s.interactionType}>
                    {interactionTypeLabel(pendingInteraction.interaction_type)}
                  </div>
                  <p>{pendingInteraction.summary}</p>
                  {pendingInteraction.body ? <MarkdownMessage content={pendingInteraction.body} /> : null}
                  {pendingInteraction.sections.length > 0 ? (
                    <dl className={s.interactionSections}>
                      {pendingInteraction.sections.map((section, index) => (
                        <div key={index}>
                          <dt>{String(section.title ?? section.label ?? `Detail ${index + 1}`)}</dt>
                          <dd>
                            {String(
                              section.summary ??
                                section.body ??
                                section.value ??
                                JSON.stringify(section),
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  <label className={s.notesField}>
                    <span>Decision notes</span>
                    <textarea
                      value={interactionNotes}
                      placeholder="Add a note for Rhizome..."
                      onChange={(event) => setInteractionNotes(event.target.value)}
                    />
                  </label>
                  <div className={s.interactionActions}>
                    {pendingInteraction.actions.map((action) => (
                      <button
                        key={action.id}
                        className={actionButtonClass(action)}
                        type="button"
                        disabled={isStreaming || !threadId}
                        onClick={() => void resumeInteraction(action)}
                      >
                        {actionButtonLabel(action)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}
      </section>

    </main>
  )
}
