import { Pin } from 'lucide-react'
import ContextAutocomplete from '@/components/rhizome/ContextAutocomplete'
import type { SearchResultItemView } from '@/lib/types/rhizome'
import type { FocusContext } from '../types'
import ContextChip from './ContextChip'
import s from '../StartSession.module.css'

interface FocusPickerProps {
  emptyLabel: string
  errorLabel: string
  groups: Array<[string, SearchResultItemView[]]>
  inputId: string
  isError: boolean
  isLoading: boolean
  label: string
  mode: 'start' | 'session'
  placeholder: string
  selected: FocusContext
  showAutocomplete: boolean
  term: string
  onDismiss: () => void
  onSelect: (result: SearchResultItemView) => void
  onSelectedClear: () => void
  onTermChange: (term: string) => void
}

export default function FocusPicker({
  emptyLabel,
  errorLabel,
  groups,
  inputId,
  isError,
  isLoading,
  label,
  mode,
  placeholder,
  selected,
  showAutocomplete,
  term,
  onDismiss,
  onSelect,
  onSelectedClear,
  onTermChange,
}: FocusPickerProps) {
  return (
    <div className={[s.focusPicker, mode === 'start' ? s.startFocusPicker : ''].join(' ')}>
      <div className={s.focusPickerBody}>
        <label className={s.focusInputLabel} htmlFor={inputId}>{label}</label>
        <div className={s.focusInputWrap}>
          <span className={s.focusSearchAnchor}>
            <Pin className={s.focusInputIcon} size={15} aria-hidden="true" />
            {selected ? (
              <ContextChip
                context={selected}
                removeLabel={`Clear ${label}`}
                onRemove={onSelectedClear}
              />
            ) : null}
            <input
              aria-label={label}
              id={inputId}
              placeholder={selected ? 'Selected' : placeholder}
              type="text"
              value={selected ? '' : term}
              onChange={(event) => onTermChange(event.target.value)}
            />
            {showAutocomplete ? (
              <ContextAutocomplete
                anchorMode="inline-below-input"
                selectionMode="single"
                groups={groups}
                isTooShort={term.trim().length < 2}
                isLoading={isLoading}
                isError={isError}
                loadingLabel="Searching focus"
                errorLabel={errorLabel}
                emptyLabel={emptyLabel}
                onDismiss={onDismiss}
                onSelect={onSelect}
              />
            ) : null}
          </span>
        </div>
      </div>
    </div>
  )
}
