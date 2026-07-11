import type { ThreadView } from '@/lib/types/rhizome'
import { threadTitle } from '../lib/presentation'
import s from '../WorkbenchHeader.module.css'

interface WorkbenchHeaderProps {
  activeThread?: ThreadView
  collapsed: boolean
  isNewThread: boolean
  pendingReviewCount: number
  onOpenReviews: () => void
  onOpenThreads: () => void
}

export default function WorkbenchHeader({
  activeThread,
  collapsed,
  isNewThread,
  pendingReviewCount,
  onOpenReviews,
  onOpenThreads,
}: WorkbenchHeaderProps) {
  return (
    <header className={[s.topbar, collapsed ? s.topbarCollapsed : ''].join(' ')}>
      <div className={s.workspaceHeaderRow}>
        <div className={s.workspaceIdentity}>
          <p className={s.eyebrow}>Agent workbench</p>
          <h1 className={s.title}>
            Ask <span>Rhizome</span>
          </h1>
          <p className={s.workspaceSubtitle}>
            Garden planning, triage, approvals, and day-to-day care decisions.
          </p>
        </div>
      </div>
      <div className={s.threadHeaderRow}>
        <div className={s.threadHeaderText}>
          <p className={s.eyebrow}>{isNewThread ? 'New conversation' : 'Active thread'}</p>
          {isNewThread ? (
            <h2>Blank thread</h2>
          ) : (
            <button className={s.threadTitleButton} type="button" onClick={onOpenThreads}>
              {threadTitle(activeThread)}
            </button>
          )}
        </div>
        {pendingReviewCount > 0 ? (
          <button
            aria-label="Open pending reviews"
            className={s.compactReviewButton}
            type="button"
            onClick={onOpenReviews}
          >
            <span>Review</span>
            <strong>{pendingReviewCount}</strong>
          </button>
        ) : null}
      </div>
    </header>
  )
}
