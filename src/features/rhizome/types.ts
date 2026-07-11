import type { ContextObject } from '@/lib/types/rhizome'

export interface SessionDraft {
  time_text: string
  energy_text: string
}

export interface StartThreadDraft {
  time_today: string
  energy: string
}

export interface OptimisticSessionContext {
  threadId: string
  timeLabel: string
  energyLabel: string
  focusLabel: string
}

export type FocusContext = ContextObject | null

export interface ComposerContextTrigger {
  start: number
  end: number
  q: string
  types: string
}

export interface ComposerAutocompletePosition {
  left: number
  top: number
}

export const EMPTY_SESSION_DRAFT: SessionDraft = {
  time_text: '',
  energy_text: '',
}

export const EMPTY_START_THREAD_DRAFT: StartThreadDraft = {
  time_today: '',
  energy: '',
}
