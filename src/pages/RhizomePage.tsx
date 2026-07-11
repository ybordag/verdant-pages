import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import {
  addThreadContext,
  getThread,
  getThreadMessages,
  getThreadSessionContext,
  listThreads,
  removeThreadContext,
  updateThreadSessionContext,
} from '@/lib/api/chat'
import { getPendingInteraction } from '@/lib/api/interactions'
import { search } from '@/lib/api/search'
import { listTasksDaily } from '@/lib/api/tasks'
import { getLatestTriage } from '@/lib/api/triage'
import { getLatestWeather } from '@/lib/api/weather'
import { useAuth } from '@/lib/auth/context'
import ConversationTimeline from '@/features/rhizome/components/ConversationTimeline'
import ContextInlineInput from '@/features/rhizome/components/ContextInlineInput'
import FocusPicker from '@/features/rhizome/components/FocusPicker'
import NewThreadDashboard from '@/features/rhizome/components/NewThreadDashboard'
import ReviewPanel from '@/features/rhizome/components/ReviewPanel'
import RhizomeComposer from '@/features/rhizome/components/RhizomeComposer'
import SessionContextStrip from '@/features/rhizome/components/SessionContextStrip'
import ThreadNavigator from '@/features/rhizome/components/ThreadNavigator'
import WorkbenchHeader from '@/features/rhizome/components/WorkbenchHeader'
import useChatTurn from '@/features/rhizome/hooks/useChatTurn'
import {
  contextFromSearchResult,
  contextKey,
  contextLabel,
  groupContextResults,
  parseComposerContextTrigger,
  parseContextSearchTerm,
  sessionFocusContextRefs,
} from '@/features/rhizome/lib/context'
import { messageKey } from '@/features/rhizome/lib/messages'
import {
  modelLabel,
  sessionDraftFromContext,
  sessionFocusLabel,
  sessionTimeLabel,
  shortlistFromTriage,
} from '@/features/rhizome/lib/presentation'
import { measureTextareaIndex } from '@/features/rhizome/lib/textarea'
import {
  EMPTY_SESSION_DRAFT,
  EMPTY_START_THREAD_DRAFT,
  type ComposerAutocompletePosition,
  type FocusContext,
  type OptimisticSessionContext,
  type SessionDraft,
  type StartThreadDraft,
} from '@/features/rhizome/types'
import type {
  ContextObject,
  SearchResultItemView,
  TaskSummaryView,
  ThreadView,
  UpdateSessionContextRequest,
} from '@/lib/types/rhizome'
import s from '@/features/rhizome/RhizomeWorkbench.module.css'

const THREAD_LIMIT = 20
const RECENT_THREAD_LIMIT = 3
const EMPTY_THREADS: ThreadView[] = []
const EMPTY_CONTEXT: ContextObject[] = []
const EMPTY_SEARCH_RESULTS: SearchResultItemView[] = []

export default function RhizomePage() {
  const { threadId } = useParams()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isNewThread = !threadId
  const [draft, setDraft] = useState('')
  const [threadsPanelOpen, setThreadsPanelOpen] = useState(false)
  const [reviewsPanelOpen, setReviewsPanelOpen] = useState(false)
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
  const [workspaceHeaderState, setWorkspaceHeaderState] = useState({
    threadId,
    collapsed: false,
  })
  const {
    isStreaming,
    optimisticSessionContext,
    pendingMessages,
    retryMessage,
    streamError,
    streamInteraction,
    streamThreadId,
    streamingText,
    resumeInteraction,
    submitMessage,
  } = useChatTurn({
    threadId,
    interactionNotes,
    getStartupLabels: startThreadSessionLabels,
    getStartupPayload: startThreadSessionPayload,
    onInteraction: () => setReviewsPanelOpen(true),
    onInteractionComplete: () => setInteractionNotes(''),
    onMessageAccepted: () => {
      setDraft('')
      setComposerAutocompletePosition(null)
    },
  })

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
  const activeOptimisticSession =
    optimisticSessionContext?.threadId === threadId ? optimisticSessionContext : null
  const sessionTimeDisplay =
    sessionContext?.time_text?.trim()
      ? sessionTimeLabel(sessionContext)
      : activeOptimisticSession?.timeLabel ?? sessionTimeLabel(sessionContext)
  const sessionEnergyDisplay =
    sessionContext?.energy_text?.trim()
      ? sessionContext.energy_text
      : activeOptimisticSession?.energyLabel ?? 'Not set'
  const sessionFocusDisplay =
    sessionContext?.focus_text?.trim() || (sessionContext?.focus_context.length ?? 0) > 0
      ? sessionFocusLabel(sessionContext)
      : activeOptimisticSession?.focusLabel ?? sessionFocusLabel(sessionContext)
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
  const workspaceHeaderCollapsed =
    workspaceHeaderState.threadId === threadId ? workspaceHeaderState.collapsed : false
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

  function updateWorkspaceHeaderCollapse(scrollTop: number) {
    setWorkspaceHeaderState((current) => {
      const isCollapsed = current.threadId === threadId ? current.collapsed : false
      const nextCollapsed = isCollapsed ? scrollTop > 8 : scrollTop > 72
      if (nextCollapsed === isCollapsed && current.threadId === threadId) return current
      return { threadId, collapsed: nextCollapsed }
    })
  }

  function updateComposerSelection(textarea: HTMLTextAreaElement) {
    const cursor = textarea.selectionStart ?? textarea.value.length
    const trigger = parseComposerContextTrigger(textarea.value, cursor)
    setComposerCursor(cursor)
    setComposerAutocompletePosition(trigger ? measureTextareaIndex(textarea, trigger.start) : null)
  }

  function startSessionEdit() {
    setSessionDraft(sessionDraftFromContext(sessionContext))
    setSessionFocusContext(sessionContext?.focus_context[0] ?? null)
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
    const payload: UpdateSessionContextRequest = {
      time_text: sessionDraft.time_text.trim() || null,
      energy_text: sessionDraft.energy_text.trim() || null,
      focus_text: sessionFocusTerm.trim() || null,
      focus_context: sessionFocusContextRefs(sessionFocusContext),
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
    setComposerAutocompletePosition(null)
  }

  function setTaskStarterDraft(task: TaskSummaryView) {
    const prompt = `Can you help me handle this task today: ${task.title}?`
    setDraft(prompt)
    setComposerCursor(prompt.length)
    setComposerAutocompletePosition(null)
  }

  function startThreadSessionLabels(): Omit<OptimisticSessionContext, 'threadId'> {
    return {
      timeLabel: startThreadDraft.time_today.trim() || 'Not set',
      energyLabel: startThreadDraft.energy.trim() || 'Not set',
      focusLabel: startFocusContext
        ? contextLabel(startFocusContext)
        : startFocusTerm.trim() || 'Not set',
    }
  }

  function startThreadSessionPayload(): UpdateSessionContextRequest | null {
    const timeText = startThreadDraft.time_today.trim()
    const energyText = startThreadDraft.energy.trim()
    const focusText = startFocusTerm.trim()
    const focusContext = sessionFocusContextRefs(startFocusContext) ?? []
    if (!timeText && !energyText && !focusText && focusContext.length === 0) return null
    return {
      time_text: timeText || null,
      energy_text: energyText || null,
      focus_text: focusText || null,
      focus_context: focusContext,
    }
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
    setComposerAutocompletePosition(null)
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
    const showAutocomplete =
      isActive && contextSearchTerm.trim().length > 0 && dismissedContextQuery !== contextQueryKey
    return (
      <ContextInlineInput
        contexts={contexts}
        disabled={
          target === 'thread' &&
          (addContextMutation.isPending || removeContextMutation.isPending)
        }
        groups={groupedContextResults}
        isActive={isActive}
        isError={contextSearchQuery.isError}
        isLoading={contextSearchQuery.isLoading}
        isTooShort={contextSearchTerm.trim().length > 0 && parsedContextSearch.q.length < 2}
        label={label}
        searchTerm={contextSearchTerm}
        showAutocomplete={showAutocomplete}
        onActivate={() => {
          if (!isActive) {
            setActiveContextTarget(target)
            setContextSearchTerm('')
          }
        }}
        onClose={() => closeContextTarget(target)}
        onDismiss={() => setDismissedContextQuery(contextQueryKey)}
        onRemove={onRemove}
        onSearchTermChange={(term) => {
          if (!isActive) setActiveContextTarget(target)
          setDismissedContextQuery('')
          setContextSearchTerm(term)
        }}
        onSelect={addContextFromSearchResult}
      />
    )
  }

  function renderFocusPicker(mode: 'start' | 'session') {
    const selected = mode === 'start' ? startFocusContext : sessionFocusContext
    const term = mode === 'start' ? startFocusTerm : sessionFocusTerm
    const query = mode === 'start' ? startFocusQuery : sessionFocusQuery
    const label = mode === 'start' ? 'Thread focus' : 'Project focus'
    const placeholder =
      mode === 'start' ? 'Project, task, plant, or open question...' : 'Search projects...'
    const inputId = mode === 'start' ? 'rhizome-start-focus' : 'rhizome-session-focus'
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
      <FocusPicker
        emptyLabel={mode === 'start' ? 'Use this as free-text focus.' : 'No projects found.'}
        errorLabel="Focus search is unavailable."
        groups={groupContextResults(results)}
        inputId={inputId}
        isError={query.isError}
        isLoading={query.isLoading}
        label={label}
        mode={mode}
        placeholder={placeholder}
        selected={selected}
        showAutocomplete={shouldShowAutocomplete}
        term={term}
        onDismiss={dismissFocusAutocomplete}
        onSelect={(result) => setSelected(contextFromSearchResult(result))}
        onSelectedClear={() => setSelected(null)}
        onTermChange={setTerm}
      />
    )
  }

  return (
    <main className={s.page}>
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
          <ThreadNavigator
            activeThreadId={threadId}
            isError={threadsQuery.isError}
            isLoading={threadsQuery.isLoading}
            isNewThread={isNewThread}
            threads={threads}
            onClose={() => setThreadsPanelOpen(false)}
          />
        ) : null}

        <section className={s.conversationWorkspace} aria-label="Conversation with Rhizome">
          <WorkbenchHeader
            activeThread={activeThread}
            collapsed={workspaceHeaderCollapsed}
            isNewThread={isNewThread}
            pendingReviewCount={pendingReviewCount}
            onOpenReviews={() => setReviewsPanelOpen(true)}
            onOpenThreads={() => setThreadsPanelOpen(true)}
          />

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

          {!isNewThread ? (
            <SessionContextStrip
              context={sessionContext}
              draft={sessionDraft}
              energyDisplay={sessionEnergyDisplay}
              error={sessionError}
              focusDisplay={sessionFocusDisplay}
              focusPicker={renderFocusPicker('session')}
              hasOptimisticContext={Boolean(activeOptimisticSession)}
              isEditing={sessionEditing}
              isError={sessionContextQuery.isError}
              isLoading={sessionContextQuery.isLoading}
              isSaving={updateSessionMutation.isPending}
              timeDisplay={sessionTimeDisplay}
              onCancel={cancelSessionEdit}
              onDraftChange={setSessionDraft}
              onEdit={startSessionEdit}
              onSave={saveSessionContext}
            />
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

          <div
            className={s.threadBody}
            onScroll={(event) => updateWorkspaceHeaderCollapse(event.currentTarget.scrollTop)}
          >
            {threadId && activeThreadQuery.isLoading ? (
              <div className={s.emptyChat}>Loading thread</div>
            ) : threadId && activeThreadQuery.isError ? (
              <div className={s.emptyChat}>This thread could not load.</div>
            ) : isNewThread ? (
              <NewThreadDashboard
                draft={startThreadDraft}
                focusPicker={renderFocusPicker("start")}
                recentThreads={recentThreads}
                shortlistSource={triageShortlist.length > 0 ? "triage" : "daily"}
                tasksAreLoading={latestTriageQuery.isLoading || dailyTasksQuery.isLoading}
                threadsCount={threads.length}
                todayShortlist={todayShortlist}
                weather={blankWeather}
                weatherIsLoading={blankWeatherQuery.isLoading}
                onBrowseThreads={() => setThreadsPanelOpen(true)}
                onDraftChange={setStartThreadDraft}
                onSelectStarter={setStarterDraft}
                onSelectTask={setTaskStarterDraft}
              />
            ) : (
              <ConversationTimeline
                isError={messagesQuery.isError}
                isLoading={messagesQuery.isLoading}
                isStreaming={isStreaming}
                messages={visibleMessages}
                streamingText={visibleStreamingText}
                onRetry={() => void messagesQuery.refetch()}
              />
            )}
          </div>

          <RhizomeComposer
            autocompleteGroups={groupedComposerContextResults}
            autocompleteIsError={composerContextQuery.isError}
            autocompleteIsLoading={composerContextQuery.isLoading}
            autocompleteStyle={
              composerAutocompletePosition
                ? {
                    left: `${Math.max(0, composerAutocompletePosition.left - 4)}px`,
                    top: `${composerAutocompletePosition.top}px`,
                  }
                : undefined
            }
            canPin={Boolean(threadId)}
            canSend={canSend}
            draft={draft}
            isStreaming={isStreaming}
            messageContextEditor={
              messageContextOpen
                ? renderContextInlineInput({
                    target: "message",
                    label: "Message context",
                    contexts: messageContext,
                    onRemove: removeMessageContext,
                  })
                : undefined
            }
            messageContextOpen={messageContextOpen}
            modelOptions={currentModelOptions}
            modelValue={currentModelValue}
            pinnedContextOpen={pinnedContextOpen}
            showAutocomplete={Boolean(
              composerContextTrigger && dismissedComposerContextQuery !== composerContextQueryKey,
            )}
            onDismissAutocomplete={() => setDismissedComposerContextQuery(composerContextQueryKey)}
            onDraftChange={(value, textarea) => {
              setDismissedComposerContextQuery("")
              setDraft(value)
              updateComposerSelection(textarea)
            }}
            onSelectionChange={updateComposerSelection}
            onSelectAutocomplete={addComposerContextFromSearchResult}
            onSubmit={() => void submitMessage(draft)}
            onToggleMessageContext={() => openContextTarget("message")}
            onTogglePinnedContext={() => openContextTarget("thread")}
          />
        </section>

        {pendingInteraction && reviewsPanelOpen ? (
          <ReviewPanel
            interaction={pendingInteraction}
            isStreaming={isStreaming}
            notes={interactionNotes}
            threadId={threadId}
            onAction={(action) => void resumeInteraction(action)}
            onClose={() => setReviewsPanelOpen(false)}
            onNotesChange={setInteractionNotes}
          />
        ) : null}
      </section>

    </main>
  )
}
