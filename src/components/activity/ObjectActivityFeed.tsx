import Button from '@/components/primitives/Button/Button'
import type { ActivityEventView } from '@/lib/types/rhizome'
import ActivityEventRow from './ActivityEventRow'
import s from './ObjectActivityFeed.module.css'

interface ObjectActivityFeedProps {
  events: ActivityEventView[]
  isLoading?: boolean
  error?: string | null
  hasMore?: boolean
  onRetry?: () => void
  onLoadMore?: () => void
}

export default function ObjectActivityFeed({
  events,
  isLoading = false,
  error,
  hasMore = false,
  onRetry,
  onLoadMore,
}: ObjectActivityFeedProps) {
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
            <Button type="button" variant="ghost" onClick={onRetry}>
              Retry
            </Button>
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
      {hasMore && onLoadMore && (
        <div className={s.pagination}>
          <Button type="button" variant="ghost" onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      )}
    </section>
  )
}
