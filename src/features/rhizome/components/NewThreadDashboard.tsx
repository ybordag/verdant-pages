import type { ReactNode } from 'react'
import {
  AlertTriangle,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Sprout,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TaskSummaryView, ThreadView, WeatherSnapshotView } from '@/lib/types/rhizome'
import type { StartThreadDraft } from '../types'
import { threadPreview, threadTitle, taskMeta } from '../lib/presentation'
import {
  firstWeatherMetric,
  weatherIconKind,
  weatherObservedLabel,
  weatherTemperatureLabel,
  type WeatherIconKind,
} from '../lib/weather'
import s from '../RhizomeWorkbench.module.css'

interface NewThreadDashboardProps {
  draft: StartThreadDraft
  focusPicker: ReactNode
  recentThreads: ThreadView[]
  shortlistSource: 'triage' | 'daily'
  tasksAreLoading: boolean
  threadsCount: number
  todayShortlist: TaskSummaryView[]
  weather: WeatherSnapshotView | null | undefined
  weatherIsLoading: boolean
  onBrowseThreads: () => void
  onDraftChange: (draft: StartThreadDraft) => void
  onSelectStarter: (kind: 'plan' | 'diagnose' | 'prioritize') => void
  onSelectTask: (task: TaskSummaryView) => void
}

function WeatherIcon({ kind }: { kind: WeatherIconKind }) {
  const iconClass = kind.slice(0, 1).toUpperCase() + kind.slice(1)
  const className = [s.weatherIcon, s[`weatherIcon${iconClass}`]].join(' ')
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

export default function NewThreadDashboard({
  draft,
  focusPicker,
  recentThreads,
  shortlistSource,
  tasksAreLoading,
  threadsCount,
  todayShortlist,
  weather,
  weatherIsLoading,
  onBrowseThreads,
  onDraftChange,
  onSelectStarter,
  onSelectTask,
}: NewThreadDashboardProps) {
  const kind = weatherIconKind(weather?.conditions_summary, weather?.alerts_summary)
  const rain = firstWeatherMetric(weather?.conditions_summary, /rain\s+([0-9]+(?:\.[0-9]+)?mm)/i)
  const wind = firstWeatherMetric(weather?.conditions_summary, /wind\s+([0-9]+(?:\.[0-9]+)?)/i)

  return (
    <div className={s.startThreadState}>
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
                value={draft.time_today}
                onChange={(event) => onDraftChange({ ...draft, time_today: event.target.value })}
              />
            </label>
            <label>
              <span>Energy</span>
              <input
                aria-label="Start energy"
                placeholder="low, focused, tired but can water..."
                type="text"
                value={draft.energy}
                onChange={(event) => onDraftChange({ ...draft, energy: event.target.value })}
              />
            </label>
          </article>

          <article className={s.weatherStartCard}>
            <div className={s.weatherCardTop}>
              <p className={s.eyebrow}>Weather</p>
              <span>{weatherObservedLabel(weather?.created_at)}</span>
            </div>
            <div className={s.weatherHero}>
              <WeatherIcon kind={kind} />
              <span
                className={s.weatherTemp}
                aria-label={
                  weatherIsLoading
                    ? 'Weather loading'
                    : `${weatherTemperatureLabel(weather?.conditions_summary)} degrees Fahrenheit`
                }
              >
                <strong>
                  {weatherIsLoading
                    ? 'Loading'
                    : weatherTemperatureLabel(weather?.conditions_summary)}
                </strong>
                {!weatherIsLoading && <span>°F</span>}
              </span>
            </div>
            <div className={s.weatherMetrics} aria-label="Weather details">
              <span>
                <Droplets size={12} />
                {rain ?? '--'}
              </span>
              <span>
                <Wind size={12} />
                {wind ? `${wind} mph` : '--'}
              </span>
              <span>
                <Thermometer size={12} />
                {weather?.location_label ?? '--'}
              </span>
            </div>
          </article>

          <article className={s.startFocusCard}>
            <p className={s.eyebrow}>Focus</p>
            {focusPicker}
          </article>
        </div>
      </section>

      <div className={s.startThreadIntro}>
        <Sprout size={26} />
        <strong>Start a thread when you are ready.</strong>
        <span>Rhizome will wait until you send the first message.</span>
        <div className={s.startChips}>
          <button type="button" onClick={() => onSelectStarter('plan')}>Plan</button>
          <button type="button" onClick={() => onSelectStarter('diagnose')}>Diagnose</button>
          <button type="button" onClick={() => onSelectStarter('prioritize')}>Prioritize</button>
        </div>
      </div>

      <div className={s.startListsGrid}>
        <section className={`${s.startListSection} ${s.recentThreads}`} aria-label="Recent thread shortcuts">
          <div className={s.startListHeader}>
            <span>Previous threads</span>
            <small>{recentThreads.length > 0 ? 'Recent conversations' : 'Navigator'}</small>
          </div>
          {recentThreads.length > 0 ? (
            <div className={s.threadListRows}>
              {recentThreads.map((thread) => (
                <Link
                  className={s.threadListRow}
                  key={thread.thread_id}
                  to={`/app/rhizome/${encodeURIComponent(thread.thread_id)}`}
                >
                  <span>
                    <strong>{threadTitle(thread)}</strong>
                    <small>{threadPreview(thread)}</small>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <button type="button" onClick={onBrowseThreads}>Browse threads</button>
          )}
          {recentThreads.length > 0 && threadsCount > recentThreads.length ? (
            <button type="button" onClick={onBrowseThreads}>Look through more threads</button>
          ) : null}
        </section>

        <section className={`${s.startListSection} ${s.todayShortlist}`} aria-label="Today's task shortlist">
          <div className={s.startListHeader}>
            <span>Today shortlist</span>
            <small>{tasksAreLoading ? 'Loading' : shortlistSource === 'triage' ? 'From latest triage' : 'From daily tasks'}</small>
          </div>
          {todayShortlist.length > 0 ? (
            <div className={s.taskListRows}>
              {todayShortlist.map((task) => (
                <button className={s.taskListRow} key={task.id} type="button" onClick={() => onSelectTask(task)}>
                  <span>
                    <strong>{task.title}</strong>
                    <small>{taskMeta(task)}</small>
                  </span>
                  <em>Task</em>
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
