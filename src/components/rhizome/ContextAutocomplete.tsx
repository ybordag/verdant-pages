import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { SearchResultItemView } from '@/lib/types/rhizome'
import s from './ContextAutocomplete.module.css'

export type ContextAutocompleteAnchorMode = 'inline-below-input' | 'textarea-token'
export type ContextAutocompleteSelectionMode = 'single' | 'multi'

interface ContextAutocompleteProps {
  anchorMode: ContextAutocompleteAnchorMode
  selectionMode: ContextAutocompleteSelectionMode
  groups: Array<[string, SearchResultItemView[]]>
  isTooShort?: boolean
  isLoading: boolean
  isError: boolean
  loadingLabel?: string
  errorLabel?: string
  shortLabel?: string
  emptyLabel?: string
  disabled?: boolean
  style?: CSSProperties
  onDismiss: () => void
  onSelect: (result: SearchResultItemView) => void
}

function titleCase(value?: string | null): string {
  if (!value) return 'Not set'
  return value.slice(0, 1).toUpperCase() + value.slice(1)
}

function typeClass(type: string): string {
  switch (type) {
    case 'plant':
      return s.contextTypePlant
    case 'batch':
      return s.contextTypeBatch
    case 'bed':
      return s.contextTypeBed
    case 'container':
      return s.contextTypeContainer
    case 'task':
      return s.contextTypeTask
    case 'project':
      return s.contextTypeProject
    case 'incident':
      return s.contextTypeIncident
    default:
      return ''
  }
}

function anchorClass(anchorMode: ContextAutocompleteAnchorMode): string {
  return anchorMode === 'textarea-token' ? s.textareaToken : s.inlineBelowInput
}

export default function ContextAutocomplete({
  anchorMode,
  selectionMode,
  groups,
  isTooShort = false,
  isLoading,
  isError,
  loadingLabel = 'Searching context',
  errorLabel = 'Context search is unavailable.',
  shortLabel = 'Type at least two characters.',
  emptyLabel = 'No context found.',
  disabled = false,
  style,
  onDismiss,
  onSelect,
}: ContextAutocompleteProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (target instanceof Node && popoverRef.current?.contains(target)) return
      onDismiss()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onDismiss])

  let content
  if (isTooShort) {
    content = <div className={s.state}>{shortLabel}</div>
  } else if (isLoading) {
    content = <div className={s.state}>{loadingLabel}</div>
  } else if (isError) {
    content = <div className={s.state}>{errorLabel}</div>
  } else if (groups.length === 0) {
    content = <div className={s.state}>{emptyLabel}</div>
  } else {
    content = groups.map(([type, results]) => (
      <section className={s.resultGroup} key={type}>
        <h3>{titleCase(type)}</h3>
        {results.map((result) => (
          <button
            key={`${selectionMode}-${result.subject_type}-${result.subject_id}`}
            type="button"
            className={`${s.result} ${typeClass(result.subject_type)}`}
            disabled={disabled}
            onClick={() => onSelect(result)}
          >
            <span>
              <strong>{result.label}</strong>
              <small>{result.secondary_label ?? result.summary ?? result.subject_id}</small>
            </span>
            <em>{result.subject_type}</em>
          </button>
        ))}
      </section>
    ))
  }

  return (
    <div ref={popoverRef} className={`${s.popover} ${anchorClass(anchorMode)}`} style={style}>
      {content}
    </div>
  )
}
