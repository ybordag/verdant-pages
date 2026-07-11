import { Search, X } from 'lucide-react'
import ContextAutocomplete from '@/components/rhizome/ContextAutocomplete'
import type { ContextObject, SearchResultItemView } from '@/lib/types/rhizome'
import ContextChip from './ContextChip'
import s from '../RhizomeWorkbench.module.css'

interface ContextInlineInputProps {
  contexts: ContextObject[]
  disabled: boolean
  groups: Array<[string, SearchResultItemView[]]>
  isActive: boolean
  isError: boolean
  isLoading: boolean
  isTooShort: boolean
  label: string
  searchTerm: string
  showAutocomplete: boolean
  onActivate: () => void
  onClose: () => void
  onDismiss: () => void
  onRemove: (context: ContextObject) => void
  onSearchTermChange: (term: string) => void
  onSelect: (result: SearchResultItemView) => void
}

export default function ContextInlineInput({
  contexts,
  disabled,
  groups,
  isActive,
  isError,
  isLoading,
  isTooShort,
  label,
  searchTerm,
  showAutocomplete,
  onActivate,
  onClose,
  onDismiss,
  onRemove,
  onSearchTermChange,
  onSelect,
}: ContextInlineInputProps) {
  return (
    <div className={s.contextInlineBox} aria-label={label}>
      <div className={s.contextInlineTitle}>
        <span>{label}</span>
        <button aria-label={`Close ${label}`} type="button" onClick={onClose}>
          <X size={13} />
        </button>
      </div>
      <div className={s.contextInlineInput}>
        <Search size={14} />
        <span className={s.contextInlineChips}>
          {contexts.map((context) => (
            <ContextChip
              context={context}
              disabled={disabled}
              key={`${context.subject_type}-${context.subject_id}`}
              onRemove={() => onRemove(context)}
            />
          ))}
          <span className={s.contextSearchAnchor}>
            <input
              aria-label={`Search ${label}`}
              placeholder={contexts.length > 0 ? 'Add another...' : 'Search context...'}
              value={isActive ? searchTerm : ''}
              onFocus={onActivate}
              onChange={(event) => onSearchTermChange(event.target.value)}
            />
            {showAutocomplete ? (
              <ContextAutocomplete
                anchorMode="inline-below-input"
                selectionMode="multi"
                groups={groups}
                isTooShort={isTooShort}
                isLoading={isLoading}
                isError={isError}
                shortLabel="Type at least two characters after the prefix."
                disabled={disabled}
                onDismiss={onDismiss}
                onSelect={onSelect}
              />
            ) : null}
          </span>
        </span>
      </div>
    </div>
  )
}
