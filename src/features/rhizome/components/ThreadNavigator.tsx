import { PanelLeftClose, Search, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ThreadView } from '@/lib/types/rhizome'
import { formatDate, threadPreview, threadTitle } from '../lib/presentation'
import s from '../WorkbenchRails.module.css'

interface ThreadNavigatorProps {
  activeThreadId?: string
  isError: boolean
  isLoading: boolean
  isNewThread: boolean
  threads: ThreadView[]
  onClose: () => void
}

export default function ThreadNavigator({
  activeThreadId,
  isError,
  isLoading,
  isNewThread,
  threads,
  onClose,
}: ThreadNavigatorProps) {
  return (
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
              onClick={onClose}
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        </div>

        <div className={s.searchBox} aria-hidden="true">
          <Search size={14} />
          <span>Search threads</span>
        </div>

        {isLoading ? (
          <div className={s.railState}>Loading threads</div>
        ) : isError ? (
          <div className={s.railState}>Threads are unavailable right now.</div>
        ) : threads.length > 0 ? (
          <nav className={s.threadList} aria-label="Recent threads">
            <Link
              className={[s.threadRow, isNewThread ? s.activeThread : ''].filter(Boolean).join(' ')}
              to="/app/rhizome"
            >
              <span>
                <strong>New thread</strong>
                <small>Start with a blank composer</small>
              </span>
            </Link>
            {threads.map((thread) => (
              <Link
                className={[
                  s.threadRow,
                  thread.thread_id === activeThreadId ? s.activeThread : '',
                ]
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
              Start with a question, a plan, or a garden object you want Rhizome to reason about.
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}
