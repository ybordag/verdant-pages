import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  MessageSquare,
  PanelLeftClose,
  PanelRightClose,
  Plus,
  Search,
  Send,
  Sprout,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/primitives/Button/Button'
import Textarea from '@/components/primitives/Textarea/Textarea'
import { createThread, getThread, getThreadMessages, listThreads, streamChat } from '@/lib/api/chat'
import { useAuth } from '@/lib/auth/context'
import type { ThreadMessageView, ThreadView } from '@/lib/types/rhizome'
import s from './RhizomePage.module.css'

const THREAD_LIMIT = 20
const RECENT_THREAD_LIMIT = 3
const EMPTY_THREADS: ThreadView[] = []

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

function messageLabel(message: ThreadMessageView): string {
  return message.role === 'user' ? 'You' : 'Rhizome'
}

function messageClass(message: ThreadMessageView): string {
  return message.role === 'user' ? s.userMessage : s.rhizomeMessage
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

function createLocalThreadId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `thread-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function RhizomePage() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [draft, setDraft] = useState('')
  const [threadsPanelOpen, setThreadsPanelOpen] = useState(false)
  const [reviewsPanelOpen, setReviewsPanelOpen] = useState(false)
  const [streamThreadId, setStreamThreadId] = useState<string | null>(null)
  const [pendingMessages, setPendingMessages] = useState<ThreadMessageView[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [streamError, setStreamError] = useState<string | null>(null)
  const [retryMessage, setRetryMessage] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const streamControllerRef = useRef<AbortController | null>(null)

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

  const activeThread = activeThreadFromList ?? activeThreadQuery.data
  const messages = messagesQuery.data?.messages ?? []
  const visiblePendingMessages = threadId && threadId === streamThreadId ? pendingMessages : []
  const visibleMessages = [...messages, ...visiblePendingMessages]
  const visibleStreamingText = threadId && threadId === streamThreadId ? streamingText : ''
  const hasThreads = threads.length > 0
  const recentThreads = threads.slice(0, RECENT_THREAD_LIMIT)
  const isNewThread = !threadId
  const pendingReviewCount = 0
  const hasPendingReviews = pendingReviewCount > 0
  const canSend = draft.trim().length > 0 && !isStreaming

  useEffect(() => {
    return () => streamControllerRef.current?.abort()
  }, [])

  async function submitMessage(messageOverride?: string) {
    const message = (messageOverride ?? draft).trim()
    if (!message || isStreaming) return

    const targetThreadId = threadId ?? createLocalThreadId()
    const controller = new AbortController()
    streamControllerRef.current?.abort()
    streamControllerRef.current = controller
    setIsStreaming(true)
    setStreamError(null)
    setRetryMessage(message)
    setStreamingText('')

    try {
      if (!threadId) {
        await createThread({ thread_id: targetThreadId })
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
      for await (const event of streamChat(targetThreadId, message, controller.signal)) {
        if (event.type === 'token') {
          responseText += event.content
          setStreamingText(responseText)
        } else if (event.type === 'done') {
          sawDone = true
          break
        }
      }

      if (!sawDone) {
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
                  <Button size="sm" type="button" onClick={() => navigate('/app/rhizome')}>
                    <Plus size={14} />
                    New
                  </Button>
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
                    <span className={s.threadIcon}>
                      <Plus size={15} />
                    </span>
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
                      <span className={s.threadIcon}>
                        <MessageSquare size={15} />
                      </span>
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
            <div className={s.modelPill}>
              {modelLabel(user?.preferred_provider, user?.preferred_model)}
            </div>
          </header>

          <div className={s.sessionStrip} aria-label="Session context">
            <div>
              <span>Time</span>
              <strong>Not set</strong>
            </div>
            <div>
              <span>Energy</span>
              <strong>Not set</strong>
            </div>
            <div>
              <span>Focus</span>
              <strong>Not set</strong>
            </div>
            {hasPendingReviews ? (
              <button
                aria-label="Open pending reviews"
                className={s.reviewButton}
                type="button"
                onClick={() => setReviewsPanelOpen(true)}
              >
                {pendingReviewCount}
              </button>
            ) : null}
          </div>

          <div className={s.threadBody}>
            {threadId && activeThreadQuery.isLoading ? (
              <div className={s.emptyChat}>Loading thread</div>
            ) : threadId && activeThreadQuery.isError ? (
              <div className={s.emptyChat}>This thread could not load.</div>
            ) : isNewThread ? (
              <div className={s.emptyChat}>
                <Sprout size={26} />
                <strong>Start a thread when you are ready.</strong>
                <span>Rhizome will wait until you send the first message.</span>
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
                            <p>{message.content}</p>
                          </article>
                        </li>
                      )
                    })}
                    {visibleStreamingText || isStreaming ? (
                      <li>
                        <article className={[s.messageBubble, s.rhizomeMessage, s.streamingMessage].join(' ')}>
                          <div className={s.messageMeta}>Rhizome</div>
                          <p>{visibleStreamingText || 'Rhizome is thinking...'}</p>
                        </article>
                      </li>
                    ) : null}
                  </ol>
                )}
              </>
            )}
          </div>

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

          <form
            className={s.composer}
            onSubmit={(event) => {
              event.preventDefault()
              void submitMessage()
            }}
          >
            <Textarea
              aria-label="Message Rhizome"
              placeholder="Ask Rhizome about tasks, plants, projects, weather, or incidents..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void submitMessage()
                }
              }}
            />
            <Button type="submit" disabled={!canSend}>
              <Send size={15} />
              {isStreaming ? 'Sending' : 'Send'}
            </Button>
          </form>
        </section>

        {hasPendingReviews && reviewsPanelOpen ? (
          <aside className={s.reviewPanel} aria-label="Pending Rhizome reviews">
            <div className={s.railContent}>
              <div className={s.railHeader}>
                <p className={s.eyebrow}>Reviews</p>
                <button
                  aria-label="Collapse reviews panel"
                  className={s.iconButton}
                  type="button"
                  onClick={() => setReviewsPanelOpen(false)}
                >
                  <PanelRightClose size={16} />
                </button>
              </div>
              <div className={s.reviewEmpty}>
                <strong>No pending approvals</strong>
                <span>Rhizome decisions that need review will appear here.</span>
              </div>
            </div>
          </aside>
        ) : null}
      </section>
    </main>
  )
}
