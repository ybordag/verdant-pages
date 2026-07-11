import type { SessionContextView, TaskSummaryView, ThreadView } from '@/lib/types/rhizome'
import type { SessionDraft } from '../types'
import { contextLabel } from './context'
import { EMPTY_SESSION_DRAFT } from '../types'

export function formatDate(value?: string): string {
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

export function threadTitle(thread?: ThreadView): string {
  return thread?.title?.trim() || 'Untitled thread'
}

export function threadPreview(thread: ThreadView): string {
  return thread.last_message_preview?.trim() || 'No messages yet'
}

export function modelLabel(provider?: string | null, model?: string | null): string {
  if (!provider && !model) return 'Model not set'
  if (!provider) return model ?? 'Model not set'
  if (!model) return provider
  return `${provider} · ${model}`
}

export function sessionDraftFromContext(context?: SessionContextView): SessionDraft {
  if (!context) return EMPTY_SESSION_DRAFT
  return {
    time_text: context.time_text ?? '',
    energy_text: context.energy_text ?? '',
  }
}

export function sessionSourceLabel(context?: SessionContextView): string | null {
  if (!context || context.source === 'unset') return null
  return context.source === 'user' ? 'User set' : 'Inferred'
}

export function sessionTimeLabel(context?: SessionContextView): string {
  return context?.time_text?.trim() || 'Not set'
}

export function sessionFocusLabel(context?: SessionContextView): string {
  const focusText = context?.focus_text?.trim()
  if (focusText) return focusText
  const labels = context?.focus_context.map((item) => contextLabel(item)).filter(Boolean) ?? []
  return labels.length > 0 ? labels.join(', ') : 'Not set'
}

export function taskMeta(task: TaskSummaryView): string {
  return [
    task.urgency ?? task.priority,
    task.status,
    task.estimated_minutes ? `${task.estimated_minutes} min` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

export function shortlistFromTriage(tasks?: {
  urgent_tasks: TaskSummaryView[]
  routine_tasks: TaskSummaryView[]
  project_tasks: TaskSummaryView[]
} | null): TaskSummaryView[] {
  if (!tasks) return []
  const seen = new Set<string>()
  const shortlist: TaskSummaryView[] = []
  for (const task of [...tasks.urgent_tasks, ...tasks.routine_tasks, ...tasks.project_tasks]) {
    if (seen.has(task.id)) continue
    seen.add(task.id)
    shortlist.push(task)
    if (shortlist.length === 3) break
  }
  return shortlist
}
