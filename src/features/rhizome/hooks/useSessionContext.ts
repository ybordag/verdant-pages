import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getThreadSessionContext, updateThreadSessionContext } from '@/lib/api/chat'
import { search } from '@/lib/api/search'
import type { SearchResultItemView, UpdateSessionContextRequest } from '@/lib/types/rhizome'
import { contextFromSearchResult, contextLabel, groupContextResults, sessionFocusContextRefs } from '../lib/context'
import {
  sessionDraftFromContext,
  sessionFocusLabel,
  sessionTimeLabel,
} from '../lib/presentation'
import {
  EMPTY_SESSION_DRAFT,
  type FocusContext,
  type OptimisticSessionContext,
  type SessionDraft,
} from '../types'

const EMPTY_SEARCH_RESULTS: SearchResultItemView[] = []

export default function useSessionContext(
  threadId: string | undefined,
  optimisticContext: OptimisticSessionContext | null,
) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<SessionDraft>(EMPTY_SESSION_DRAFT)
  const [error, setError] = useState<string | null>(null)
  const [focusTerm, setFocusTerm] = useState('')
  const [focusContext, setFocusContext] = useState<FocusContext>(null)
  const [dismissedFocusQuery, setDismissedFocusQuery] = useState('')

  const query = useQuery({
    queryKey: ['threads', threadId, 'session-context'],
    queryFn: () => getThreadSessionContext(threadId ?? ''),
    enabled: Boolean(threadId),
  })
  const focusQuery = useQuery({
    queryKey: ['search', 'session-focus', focusTerm.trim()],
    queryFn: () => search({ q: focusTerm.trim(), types: 'project', limit: 6 }),
    enabled: isEditing && !focusContext && focusTerm.trim().length >= 2,
  })
  const mutation = useMutation({
    mutationFn: (data: UpdateSessionContextRequest) =>
      updateThreadSessionContext(threadId ?? '', data),
    onSuccess: (context) => {
      queryClient.setQueryData(['threads', threadId, 'session-context'], context)
      setDraft(sessionDraftFromContext(context))
      setFocusContext(null)
      setFocusTerm('')
      setIsEditing(false)
      setError(null)
    },
    onError: () => setError('Session context could not be saved.'),
  })

  const context = query.data
  const activeOptimisticContext = optimisticContext?.threadId === threadId ? optimisticContext : null
  const timeDisplay = context?.time_text?.trim()
    ? sessionTimeLabel(context)
    : activeOptimisticContext?.timeLabel ?? sessionTimeLabel(context)
  const energyDisplay = context?.energy_text?.trim()
    ? context.energy_text
    : activeOptimisticContext?.energyLabel ?? 'Not set'
  const focusDisplay =
    context?.focus_text?.trim() || (context?.focus_context.length ?? 0) > 0
      ? sessionFocusLabel(context)
      : activeOptimisticContext?.focusLabel ?? sessionFocusLabel(context)
  const focusQueryKey = `session:${focusTerm.trim()}`

  function startEditing() {
    setDraft(sessionDraftFromContext(context))
    setFocusContext(context?.focus_context[0] ?? null)
    const label = sessionFocusLabel(context)
    setFocusTerm(label === 'Not set' ? '' : label)
    setError(null)
    setIsEditing(true)
  }

  function cancelEditing() {
    setDraft(sessionDraftFromContext(context))
    setFocusContext(null)
    setFocusTerm('')
    setError(null)
    setIsEditing(false)
  }

  function save() {
    if (!threadId) return
    mutation.mutate({
      time_text: draft.time_text.trim() || null,
      energy_text: draft.energy_text.trim() || null,
      focus_text: focusTerm.trim() || null,
      focus_context: sessionFocusContextRefs(focusContext),
    })
  }

  function selectFocus(result: SearchResultItemView) {
    const selected = contextFromSearchResult(result)
    setFocusContext(selected)
    setFocusTerm(contextLabel(selected))
    setDismissedFocusQuery('')
  }

  function clearFocus() {
    setFocusContext(null)
    setFocusTerm('')
    setDismissedFocusQuery('')
  }

  function changeFocusTerm(value: string) {
    setFocusContext(null)
    setDismissedFocusQuery('')
    setFocusTerm(value)
  }

  return {
    context,
    draft,
    energyDisplay,
    error,
    focus: {
      groups: groupContextResults(focusQuery.data?.results ?? EMPTY_SEARCH_RESULTS),
      isError: focusQuery.isError,
      isLoading: focusQuery.isLoading,
      queryKey: focusQueryKey,
      selected: focusContext,
      showAutocomplete:
        !focusContext &&
        focusTerm.trim().length > 0 &&
        dismissedFocusQuery !== focusQueryKey,
      term: focusTerm,
      changeTerm: changeFocusTerm,
      clear: clearFocus,
      dismiss: () => setDismissedFocusQuery(focusQueryKey),
      select: selectFocus,
    },
    focusDisplay,
    hasOptimisticContext: Boolean(activeOptimisticContext),
    isEditing,
    isError: query.isError,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    timeDisplay,
    cancelEditing,
    save,
    setDraft,
    startEditing,
  }
}
