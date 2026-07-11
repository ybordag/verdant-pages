import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getThread, getThreadMessages, listThreads } from '@/lib/api/chat'
import { getPendingInteraction } from '@/lib/api/interactions'
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
import useContextSearch from '@/features/rhizome/hooks/useContextSearch'
import useSessionContext from '@/features/rhizome/hooks/useSessionContext'
import { contextLabel, sessionFocusContextRefs } from '@/features/rhizome/lib/context'
import { messageKey } from '@/features/rhizome/lib/messages'
import {
  modelLabel,
  shortlistFromTriage,
} from '@/features/rhizome/lib/presentation'
import {
  EMPTY_START_THREAD_DRAFT,
  type OptimisticSessionContext,
  type StartThreadDraft,
} from '@/features/rhizome/types'
import type {
  ContextObject,
  TaskSummaryView,
  ThreadView,
  UpdateSessionContextRequest,
} from '@/lib/types/rhizome'
import s from '@/features/rhizome/RhizomeLayout.module.css'

const THREAD_LIMIT = 20
const RECENT_THREAD_LIMIT = 3
const EMPTY_THREADS: ThreadView[] = []
const EMPTY_CONTEXT: ContextObject[] = []

export default function RhizomePage() {
  const { threadId } = useParams()
  const { user } = useAuth()
  const isNewThread = !threadId
  const [draft, setDraft] = useState('')
  const [threadsPanelOpen, setThreadsPanelOpen] = useState(false)
  const [reviewsPanelOpen, setReviewsPanelOpen] = useState(false)
  const [interactionNotes, setInteractionNotes] = useState('')
  const [startThreadDraft, setStartThreadDraft] = useState<StartThreadDraft>(EMPTY_START_THREAD_DRAFT)
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
    },
  })
  const {
    context: sessionContext,
    draft: sessionDraft,
    energyDisplay: sessionEnergyDisplay,
    error: sessionError,
    focus: sessionFocus,
    focusDisplay: sessionFocusDisplay,
    hasOptimisticContext: hasOptimisticSession,
    isEditing: sessionEditing,
    isError: sessionContextIsError,
    isLoading: sessionContextIsLoading,
    isSaving: sessionContextIsSaving,
    timeDisplay: sessionTimeDisplay,
    cancelEditing: cancelSessionEdit,
    save: saveSessionContext,
    setDraft: setSessionDraft,
    startEditing: startSessionEdit,
  } = useSessionContext(threadId, optimisticSessionContext)

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

  const activeThread = activeThreadFromList ?? activeThreadQuery.data
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
  const contextSearch = useContextSearch({
    draft,
    isNewThread,
    pinnedContext,
    threadId,
    setDraft,
  })

  function updateWorkspaceHeaderCollapse(scrollTop: number) {
    setWorkspaceHeaderState((current) => {
      const isCollapsed = current.threadId === threadId ? current.collapsed : false
      const nextCollapsed = isCollapsed ? scrollTop > 8 : scrollTop > 72
      if (nextCollapsed === isCollapsed && current.threadId === threadId) return current
      return { threadId, collapsed: nextCollapsed }
    })
  }

  function setStarterDraft(kind: 'plan' | 'diagnose' | 'prioritize') {
    const prompts = {
      plan: 'Help me plan the next useful step for my garden today.',
      diagnose: 'Help me diagnose an issue in my garden. Ask me what you need to know first.',
      prioritize: 'Look at my garden context and help me prioritize what to do next.',
    }
    setDraft(prompts[kind])
    contextSearch.composer.setCursor(prompts[kind].length)
  }

  function setTaskStarterDraft(task: TaskSummaryView) {
    const prompt = `Can you help me handle this task today: ${task.title}?`
    setDraft(prompt)
    contextSearch.composer.setCursor(prompt.length)
  }

  function startThreadSessionLabels(): Omit<OptimisticSessionContext, 'threadId'> {
    return {
      timeLabel: startThreadDraft.time_today.trim() || 'Not set',
      energyLabel: startThreadDraft.energy.trim() || 'Not set',
      focusLabel: contextSearch.startFocus.context
        ? contextLabel(contextSearch.startFocus.context)
        : contextSearch.startFocus.term.trim() || 'Not set',
    }
  }

  function startThreadSessionPayload(): UpdateSessionContextRequest | null {
    const timeText = startThreadDraft.time_today.trim()
    const energyText = startThreadDraft.energy.trim()
    const focusText = contextSearch.startFocus.term.trim()
    const focusContext = sessionFocusContextRefs(contextSearch.startFocus.context) ?? []
    if (!timeText && !energyText && !focusText && focusContext.length === 0) return null
    return {
      time_text: timeText || null,
      energy_text: energyText || null,
      focus_text: focusText || null,
      focus_context: focusContext,
    }
  }

  function renderContextInlineInput({
    target,
    label,
    contexts,
  }: {
    target: 'message' | 'thread'
    label: string
    contexts: ContextObject[]
  }) {
    return <ContextInlineInput {...contextSearch.inlineProps(target, contexts)} label={label} />
  }

  function renderFocusPicker(mode: 'start' | 'session') {
    if (mode === 'session') {
      return (
        <FocusPicker
          emptyLabel="No projects found."
          errorLabel="Focus search is unavailable."
          groups={sessionFocus.groups}
          inputId="rhizome-session-focus"
          isError={sessionFocus.isError}
          isLoading={sessionFocus.isLoading}
          label="Project focus"
          mode="session"
          placeholder="Search projects..."
          selected={sessionFocus.selected}
          showAutocomplete={sessionFocus.showAutocomplete}
          term={sessionFocus.term}
          onDismiss={sessionFocus.dismiss}
          onSelect={sessionFocus.select}
          onSelectedClear={sessionFocus.clear}
          onTermChange={sessionFocus.changeTerm}
        />
      )
    }

    return (
      <FocusPicker
        emptyLabel="Use this as free-text focus."
        errorLabel="Focus search is unavailable."
        groups={contextSearch.startFocus.groups}
        inputId="rhizome-start-focus"
        isError={contextSearch.startFocus.isError}
        isLoading={contextSearch.startFocus.isLoading}
        label="Thread focus"
        mode="start"
        placeholder="Project, task, plant, or open question..."
        selected={contextSearch.startFocus.context}
        showAutocomplete={contextSearch.startFocus.showAutocomplete}
        term={contextSearch.startFocus.term}
        onDismiss={contextSearch.startFocus.dismiss}
        onSelect={contextSearch.startFocus.select}
        onSelectedClear={contextSearch.startFocus.clear}
        onTermChange={contextSearch.startFocus.changeTerm}
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
              hasOptimisticContext={hasOptimisticSession}
              isEditing={sessionEditing}
              isError={sessionContextIsError}
              isLoading={sessionContextIsLoading}
              isSaving={sessionContextIsSaving}
              timeDisplay={sessionTimeDisplay}
              onCancel={cancelSessionEdit}
              onDraftChange={setSessionDraft}
              onEdit={startSessionEdit}
              onSave={saveSessionContext}
            />
          ) : null}

          {threadId && (contextSearch.pinnedContextOpen || pinnedContext.length > 0) ? (
            <div className={s.pinnedContextSection}>
              {renderContextInlineInput({
                target: 'thread',
                label: 'Pinned context for this thread',
                contexts: pinnedContext,
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
            autocompleteGroups={contextSearch.composer.groups}
            autocompleteIsError={contextSearch.composer.isError}
            autocompleteIsLoading={contextSearch.composer.isLoading}
            autocompleteStyle={
              contextSearch.composer.position
                ? {
                    left: `${Math.max(0, contextSearch.composer.position.left - 4)}px`,
                    top: `${contextSearch.composer.position.top}px`,
                  }
                : undefined
            }
            canPin={Boolean(threadId)}
            canSend={canSend}
            draft={draft}
            isStreaming={isStreaming}
            messageContextEditor={
              contextSearch.messageContextOpen
                ? renderContextInlineInput({
                    target: "message",
                    label: "Message context",
                    contexts: contextSearch.messageContext,
                  })
                : undefined
            }
            messageContextOpen={contextSearch.messageContextOpen}
            modelOptions={currentModelOptions}
            modelValue={currentModelValue}
            pinnedContextOpen={contextSearch.pinnedContextOpen}
            showAutocomplete={contextSearch.composer.showAutocomplete}
            onDismissAutocomplete={contextSearch.composer.dismiss}
            onDraftChange={(value, textarea) => {
              contextSearch.composer.resetDismissal()
              setDraft(value)
              contextSearch.composer.updateSelection(textarea)
            }}
            onSelectionChange={contextSearch.composer.updateSelection}
            onSelectAutocomplete={contextSearch.composer.select}
            onSubmit={() => void submitMessage(draft)}
            onToggleMessageContext={() => contextSearch.openTarget("message")}
            onTogglePinnedContext={() => contextSearch.openTarget("thread")}
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
