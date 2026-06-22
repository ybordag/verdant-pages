import type { ActivityEventView } from '@/lib/types/rhizome'
import ActivityEventRow from './ActivityEventRow'
import { useInfiniteSentinel } from './useInfiniteSentinel'
import s from './ObjectActivityFeed.module.css'

interface ObjectActivityFeedProps {
  events: ActivityEventView[]
  isLoading?: boolean
  error?: string | null
  hasMore?: boolean
  isFetchingMore?: boolean
  onRetry?: () => void
  onLoadMore?: () => void
}

export default function ObjectActivityFeed({
  events,
  isLoading = false,
  error,
  hasMore = false,
  isFetchingMore = false,
  onRetry,
  onLoadMore,
}: ObjectActivityFeedProps) {
  const sentinelRef = useInfiniteSentinel({
    disabled: !hasMore || isFetchingMore || !onLoadMore,
    onIntersect: () => {
      onLoadMore?.()
    },
  })

  if (isLoading) {
    return (
      <section className={s.state} aria-live="polite">
        <h2 className={s.stateTitle}>Loading activity</h2>
        <p className={s.stateBody}>Recent garden events are being gathered.</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className={s.state} aria-live="polite">
        <h2 className={s.stateTitle}>Activity could not load</h2>
        <p className={s.stateBody}>{error}</p>
        {onRetry && (
          <div>
            <button type="button" className={s.retry} onClick={onRetry}>
              Retry
            </button>
          </div>
        )}
      </section>
    )
  }

  if (events.length === 0) {
    return (
      <section className={s.state}>
        <h2 className={s.stateTitle}>No activity found</h2>
        <p className={s.stateBody}>Try clearing filters or check back after Rhizome records more garden work.</p>
      </section>
    )
  }

  return (
    <section className={s.feed} aria-label="Activity feed">
      <div className={s.list}>
        {events.map((event) => (
          <ActivityEventRow key={event.id} event={event} />
        ))}
      </div>
      <div className={s.footer} aria-live="polite">
        {hasMore && <div ref={sentinelRef} className={s.sentinel} aria-hidden="true" />}
        {isFetchingMore && <span>Loading older activity...</span>}
        {!hasMore && <span>End of activity</span>}
      </div>
    </section>
  )
}
