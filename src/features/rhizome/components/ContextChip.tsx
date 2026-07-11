import { X } from 'lucide-react'
import type { ContextObject } from '@/lib/types/rhizome'
import { contextLabel } from '../lib/context'
import { contextTypeClass } from './contextStyles'
import s from '../RhizomeWorkbench.module.css'

interface ContextChipProps {
  context: ContextObject
  disabled?: boolean
  removeLabel?: string
  onRemove: () => void
}

export default function ContextChip({ context, disabled, removeLabel, onRemove }: ContextChipProps) {
  return (
    <span className={`${s.contextChip} ${contextTypeClass(context.subject_type)}`}>
      <em>{context.subject_type}</em>
      <span>{contextLabel(context)}</span>
      <button
        type="button"
        aria-label={removeLabel ?? `Remove ${contextLabel(context)} context`}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation()
          onRemove()
        }}
      >
        <X size={12} />
      </button>
    </span>
  )
}
