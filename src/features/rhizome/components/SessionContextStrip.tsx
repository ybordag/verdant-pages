import type { ReactNode } from 'react'
import type { SessionContextView } from '@/lib/types/rhizome'
import type { SessionDraft } from '../types'
import { sessionSourceLabel } from '../lib/presentation'
import s from '../RhizomeWorkbench.module.css'

interface SessionContextStripProps {
  context?: SessionContextView
  draft: SessionDraft
  energyDisplay: string
  error: string | null
  focusDisplay: string
  focusPicker: ReactNode
  hasOptimisticContext: boolean
  isEditing: boolean
  isError: boolean
  isLoading: boolean
  isSaving: boolean
  timeDisplay: string
  onCancel: () => void
  onDraftChange: (draft: SessionDraft) => void
  onEdit: () => void
  onSave: () => void
}

export default function SessionContextStrip({
  context,
  draft,
  energyDisplay,
  error,
  focusDisplay,
  focusPicker,
  hasOptimisticContext,
  isEditing,
  isError,
  isLoading,
  isSaving,
  timeDisplay,
  onCancel,
  onDraftChange,
  onEdit,
  onSave,
}: SessionContextStripProps) {
  if (isEditing) {
    return (
      <form
        className={[s.sessionStrip, s.sessionEditing].join(' ')}
        aria-label="Session context"
        onSubmit={(event) => {
          event.preventDefault()
          onSave()
        }}
      >
        <label className={s.sessionCard}>
          <span>Time today</span>
          <input
            aria-label="Time today"
            type="text"
            value={draft.time_text}
            onChange={(event) => onDraftChange({ ...draft, time_text: event.target.value })}
          />
        </label>
        <label className={s.sessionCard}>
          <span>Energy</span>
          <input
            aria-label="Energy"
            type="text"
            value={draft.energy_text}
            onChange={(event) => onDraftChange({ ...draft, energy_text: event.target.value })}
          />
        </label>
        <div className={s.sessionCard}>{focusPicker}</div>
        <div className={s.sessionActions}>
          {error ? <span role="alert">{error}</span> : null}
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving' : 'Save'}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    )
  }

  const disabled = isLoading || isError
  return (
    <div className={s.sessionStrip} aria-label="Session context">
      <button
        aria-label="Edit time today"
        className={s.sessionCard}
        type="button"
        disabled={disabled}
        onClick={onEdit}
      >
        <span>Time</span>
        <strong>{isLoading && !hasOptimisticContext ? 'Loading' : timeDisplay}</strong>
        {hasOptimisticContext && !context?.time_text?.trim() ? (
          <small>Pending</small>
        ) : sessionSourceLabel(context) ? (
          <small>{sessionSourceLabel(context)}</small>
        ) : null}
      </button>
      <button
        aria-label="Edit energy"
        className={s.sessionCard}
        type="button"
        disabled={disabled}
        onClick={onEdit}
      >
        <span>Energy</span>
        <strong>{isLoading && !hasOptimisticContext ? 'Loading' : energyDisplay}</strong>
      </button>
      <button
        aria-label="Edit focus"
        className={s.sessionCard}
        type="button"
        disabled={disabled}
        onClick={onEdit}
      >
        <span>Focus</span>
        <strong>{isLoading && !hasOptimisticContext ? 'Loading' : focusDisplay}</strong>
      </button>
    </div>
  )
}
