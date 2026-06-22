import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Plus, Search, Send, Sprout } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/primitives/Button/Button'
import Textarea from '@/components/primitives/Textarea/Textarea'
import { getThread, listThreads } from '@/lib/api/chat'
import { useAuth } from '@/lib/auth/context'
import type { ThreadView } from '@/lib/types/rhizome'
import s from './RhizomePage.module.css'

const THREAD_LIMIT = 20
const EMPTY_THREADS: ThreadView[] = []

function formatDate(value?: string): string {
  if (!value) return 'No activity yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No activity yet'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
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

export default function RhizomePage() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [draft, setDraft] = useState('')

  const threadsQuery = useQuery({
    queryKey: ['threads', { limit: THREAD_LIMIT }],
    queryFn: () => listThreads({ limit: THREAD_LIMIT }),
  })
  const threads = threadsQuery.data ?? EMPTY_THREADS
  const activeThreadFromList = useMemo(() => threads.find((thread) => thread.thread_id === threadId), [threadId, threads])

  const activeThreadQuery = useQuery({
    queryKey: ['threads', threadId],
    queryFn: () => getThread(threadId ?? ''),
    enabled: Boolean(threadId && !threadsQuery.isLoading && !activeThreadFromList),
  })

  const activeThread = activeThreadFromList ?? activeThreadQuery.data
  const hasThreads = threads.length > 0
  const isNewThread = !threadId

  return (
    <main className={s.page}>
      <section className={s.workbench} aria-label="Rhizome workbench">
        <aside className={s.threadRail} aria-label="Rhizome threads">
          <div className={s.railHeader}>
            <div>
              <p className={s.eyebrow}>Rhizome</p>
              <h1 className={s.title}>Ask Rhizome</h1>
            </div>
            <Button size="sm" type="button" onClick={() => navigate('/app/rhizome')}>
              <Plus size={14} />
              New
            </Button>
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
              <Link className={[s.threadRow, isNewThread ? s.activeThread : ''].filter(Boolean).join(' ')} to="/app/rhizome">
                <span className={s.threadIcon}><Plus size={15} /></span>
                <span>
                  <strong>New thread</strong>
                  <small>Start with a blank composer</small>
                </span>
              </Link>
              {threads.map((thread) => (
                <Link
                  className={[s.threadRow, thread.thread_id === threadId ? s.activeThread : ''].filter(Boolean).join(' ')}
                  key={thread.thread_id}
                  to={`/app/rhizome/${encodeURIComponent(thread.thread_id)}`}
                >
                  <span className={s.threadIcon}><MessageSquare size={15} /></span>
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
              <span>Start with a question, a plan, or a garden object you want Rhizome to reason about.</span>
            </div>
          )}
        </aside>

        <section className={s.chatPane} aria-label="Conversation with Rhizome">
          <header className={s.topbar}>
            <div>
              <p className={s.eyebrow}>{isNewThread ? 'New conversation' : 'Active thread'}</p>
              <h2>{isNewThread ? 'Blank thread' : threadTitle(activeThread)}</h2>
            </div>
            <div className={s.modelPill}>{modelLabel(user?.preferred_provider, user?.preferred_model)}</div>
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
              </div>
            ) : (
              <div className={s.emptyChat}>
                <MessageSquare size={26} />
                <strong>Conversation selected.</strong>
                <span>Messages will appear here as the thread loads.</span>
              </div>
            )}
          </div>

          <form className={s.composer} onSubmit={(event) => event.preventDefault()}>
            <Textarea
              aria-label="Message Rhizome"
              placeholder="Ask Rhizome about tasks, plants, projects, weather, or incidents..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button type="submit" disabled>
              <Send size={15} />
              Send
            </Button>
          </form>
        </section>

        <aside className={s.reviewPanel} aria-label="Pending Rhizome reviews">
          <p className={s.eyebrow}>Reviews</p>
          <div className={s.reviewEmpty}>
            <strong>No pending approvals</strong>
            <span>Rhizome decisions that need review will appear here.</span>
          </div>
        </aside>
      </section>
    </main>
  )
}
