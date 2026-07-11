import type { CSSProperties, ReactNode } from 'react'
import { Pin, Plus, Send } from 'lucide-react'
import { FilterSelect } from '@/components/activity/FilterControls'
import Button from '@/components/primitives/Button/Button'
import Textarea from '@/components/primitives/Textarea/Textarea'
import ContextAutocomplete from '@/components/rhizome/ContextAutocomplete'
import type { SearchResultItemView } from '@/lib/types/rhizome'
import s from '../RhizomeWorkbench.module.css'

interface RhizomeComposerProps {
  autocompleteGroups: Array<[string, SearchResultItemView[]]>
  autocompleteIsError: boolean
  autocompleteIsLoading: boolean
  autocompleteStyle?: CSSProperties
  canPin: boolean
  canSend: boolean
  draft: string
  isStreaming: boolean
  messageContextEditor?: ReactNode
  messageContextOpen: boolean
  modelOptions: Array<{ value: string; label: string }>
  modelValue: string
  pinnedContextOpen: boolean
  showAutocomplete: boolean
  onDismissAutocomplete: () => void
  onDraftChange: (value: string, textarea: HTMLTextAreaElement) => void
  onSelectionChange: (textarea: HTMLTextAreaElement) => void
  onSelectAutocomplete: (result: SearchResultItemView) => void
  onSubmit: () => void
  onToggleMessageContext: () => void
  onTogglePinnedContext: () => void
}

export default function RhizomeComposer({
  autocompleteGroups,
  autocompleteIsError,
  autocompleteIsLoading,
  autocompleteStyle,
  canPin,
  canSend,
  draft,
  isStreaming,
  messageContextEditor,
  messageContextOpen,
  modelOptions,
  modelValue,
  pinnedContextOpen,
  showAutocomplete,
  onDismissAutocomplete,
  onDraftChange,
  onSelectionChange,
  onSelectAutocomplete,
  onSubmit,
  onToggleMessageContext,
  onTogglePinnedContext,
}: RhizomeComposerProps) {
  return (
    <form
      className={s.composer}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className={s.composerBox}>
        {messageContextEditor ? <div className={s.messageContextSection}>{messageContextEditor}</div> : null}
        <div className={s.composerTextAreaWrap}>
          <Textarea
            aria-label="Message Rhizome"
            placeholder="Ask Rhizome about tasks, plants, projects, weather, or incidents..."
            value={draft}
            onChange={(event) => onDraftChange(event.currentTarget.value, event.currentTarget)}
            onClick={(event) => onSelectionChange(event.currentTarget)}
            onKeyUp={(event) => onSelectionChange(event.currentTarget)}
            onSelect={(event) => onSelectionChange(event.currentTarget)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                onSubmit()
              }
            }}
          />
          {showAutocomplete ? (
            <ContextAutocomplete
              anchorMode="textarea-token"
              selectionMode="multi"
              groups={autocompleteGroups}
              isLoading={autocompleteIsLoading}
              isError={autocompleteIsError}
              style={autocompleteStyle}
              onDismiss={onDismissAutocomplete}
              onSelect={onSelectAutocomplete}
            />
          ) : null}
        </div>
        <div className={s.composerControlRow}>
          <div className={s.composerContextButtons}>
            <button
              aria-expanded={messageContextOpen}
              aria-label={messageContextOpen ? 'Close message context' : 'Add message context'}
              className={s.composerAddContext}
              type="button"
              onClick={onToggleMessageContext}
            ><Plus size={14} /></button>
            <button
              aria-expanded={pinnedContextOpen}
              aria-label={pinnedContextOpen ? 'Close pinned context' : 'Add pinned context'}
              className={s.composerPinContext}
              type="button"
              disabled={!canPin}
              onClick={onTogglePinnedContext}
            ><Pin size={13} /></button>
          </div>
          <div className={s.composerRightControls}>
            <div className={s.composerModelSelector} title="Model switching will be editable after Cambium supports profile updates.">
              <FilterSelect label="Model" value={modelValue} placeholder="Model not set" options={modelOptions} disabled onChange={() => {}} />
            </div>
            <Button className={s.composerSend} size="sm" type="submit" disabled={!canSend}>
              <Send size={15} />{isStreaming ? 'Sending' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
