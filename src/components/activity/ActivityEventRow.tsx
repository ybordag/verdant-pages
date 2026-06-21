import Chip from '@/components/primitives/Chip/Chip'
import type { ActivityEventView } from '@/lib/types/rhizome'
import s from './ActivityEventRow.module.css'

const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  task: { bg: 'rgba(43, 92, 47, 0.2)', color: 'var(--pale-herb)' },
  care: { bg: 'rgba(184, 212, 58, 0.2)', color: 'var(--chartreuse)' },
  garden: { bg: 'rgba(176, 234, 172, 0.16)', color: 'var(--pale-herb)' },
  incident: { bg: 'rgba(224, 107, 74, 0.16)', color: 'var(--clay)' },
  interaction: { bg: 'rgba(160, 184, 245, 0.16)', color: 'var(--cornflower)' },
  weather: { bg: 'rgba(255, 201, 77, 0.16)', color: 'var(--buttercup)' },
  project: { bg: 'rgba(215, 165, 255, 0.16)', color: 'var(--wisteria)' },
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

interface ActivityEventRowProps {
  event: ActivityEventView
}

function humanize(value: string): string {
  return value.replaceAll('_', ' ')
}

function shortId(value: string): string {
  return value.length > 10 ? `${value.slice(0, 8)}...` : value
}

export default function ActivityEventRow({ event }: ActivityEventRowProps) {
  const createdAt = new Date(event.created_at)
  const categoryStyle = CATEGORY_STYLES[event.category] ?? {
    bg: 'var(--surface-muted)',
    color: 'var(--text-secondary)',
  }

  return (
    <article className={s.row}>
      <time className={s.time} dateTime={event.created_at}>
        <span className={s.date}>{dateFormatter.format(createdAt)}</span>
        <span>{timeFormatter.format(createdAt)}</span>
      </time>
      <div className={s.body}>
        <div className={s.meta}>
          <span
            className={s.category}
            style={{ '--badge-bg': categoryStyle.bg, '--badge-color': categoryStyle.color } as React.CSSProperties}
          >
            {humanize(event.category)}
          </span>
          <span className={s.eventType}>{humanize(event.event_type)}</span>
        </div>
        <h2 className={s.summary}>{event.summary}</h2>
        {event.notes && <p className={s.notes}>{event.notes}</p>}
        <footer className={s.footer}>
          <span className={s.actor}>{event.actor_label ?? humanize(event.actor_type)}</span>
          {event.subjects.length > 0 && (
            <div className={s.subjects} aria-label="Affected objects">
              {event.subjects.map((subject) => (
                <Chip
                  key={`${subject.subject_type}:${subject.subject_id}:${subject.role ?? 'subject'}`}
                  className={s.subject}
                >
                  {subject.role ? `${subject.role} ` : ''}
                  {subject.subject_type} {shortId(subject.subject_id)}
                </Chip>
              ))}
            </div>
          )}
        </footer>
      </div>
    </article>
  )
}
