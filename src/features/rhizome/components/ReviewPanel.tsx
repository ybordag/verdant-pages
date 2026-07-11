import { PanelRightClose } from 'lucide-react'
import MarkdownMessage from '@/components/primitives/MarkdownMessage/MarkdownMessage'
import type { InteractionActionView, InteractionEnvelopeView } from '@/lib/types/rhizome'
import { titleCase } from '../lib/context'
import s from '../WorkbenchRails.module.css'

interface ReviewPanelProps {
  interaction: InteractionEnvelopeView
  isStreaming: boolean
  notes: string
  threadId?: string
  onAction: (action: InteractionActionView) => void
  onClose: () => void
  onNotesChange: (notes: string) => void
}

function interactionTypeLabel(type: string): string {
  return type.replaceAll('_', ' ')
}

function actionButtonLabel(action: InteractionActionView): string {
  return action.label || titleCase(action.id.replaceAll('_', ' '))
}

function actionButtonClass(action: InteractionActionView): string {
  if (action.style_hint === 'primary' || action.kind === 'confirm' || action.id === 'confirm') {
    return s.primaryAction
  }
  if (action.style_hint === 'danger' || action.kind === 'reject' || action.id === 'reject') {
    return s.dangerAction
  }
  return s.secondaryAction
}

export default function ReviewPanel({
  interaction,
  isStreaming,
  notes,
  threadId,
  onAction,
  onClose,
  onNotesChange,
}: ReviewPanelProps) {
  return (
    <aside className={s.reviewPanel} aria-label="Pending Rhizome reviews">
      <div className={s.railContent}>
        <div className={s.railHeader}>
          <div>
            <p className={s.eyebrow}>Current interaction</p>
            <h2>{interaction.title ?? 'Pending review'}</h2>
          </div>
          <button
            aria-label="Collapse reviews panel"
            className={s.iconButton}
            type="button"
            onClick={onClose}
          >
            <PanelRightClose size={16} />
          </button>
        </div>
        <div className={s.interactionCard}>
          <div className={s.interactionType}>
            {interactionTypeLabel(interaction.interaction_type)}
          </div>
          <p>{interaction.summary}</p>
          {interaction.body ? <MarkdownMessage content={interaction.body} /> : null}
          {interaction.sections.length > 0 ? (
            <dl className={s.interactionSections}>
              {interaction.sections.map((section, index) => (
                <div key={index}>
                  <dt>{String(section.title ?? section.label ?? `Detail ${index + 1}`)}</dt>
                  <dd>
                    {String(
                      section.summary ??
                        section.body ??
                        section.value ??
                        JSON.stringify(section),
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          <label className={s.notesField}>
            <span>Decision notes</span>
            <textarea
              value={notes}
              placeholder="Add a note for Rhizome..."
              onChange={(event) => onNotesChange(event.target.value)}
            />
          </label>
          <div className={s.interactionActions}>
            {interaction.actions.map((action) => (
              <button
                key={action.id}
                className={actionButtonClass(action)}
                type="button"
                disabled={isStreaming || !threadId}
                onClick={() => onAction(action)}
              >
                {actionButtonLabel(action)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
