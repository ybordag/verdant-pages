import { useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addThreadContext, removeThreadContext } from '@/lib/api/chat'
import { search } from '@/lib/api/search'
import type { ContextObject, SearchResultItemView, ThreadView } from '@/lib/types/rhizome'
import {
  contextFromSearchResult,
  contextKey,
  contextLabel,
  groupContextResults,
  parseComposerContextTrigger,
  parseContextSearchTerm,
} from '../lib/context'
import { measureTextareaIndex } from '../lib/textarea'
import type { ComposerAutocompletePosition, FocusContext } from '../types'

const THREAD_LIMIT = 20
const EMPTY_RESULTS: SearchResultItemView[] = []
type ContextTarget = 'message' | 'thread'

interface UseContextSearchOptions {
  draft: string
  isNewThread: boolean
  pinnedContext: ContextObject[]
  threadId?: string
  setDraft: Dispatch<SetStateAction<string>>
}

export default function useContextSearch({
  draft,
  isNewThread,
  pinnedContext,
  threadId,
  setDraft,
}: UseContextSearchOptions) {
  const queryClient = useQueryClient()
  const [messageContextOpen, setMessageContextOpen] = useState(false)
  const [pinnedContextOpen, setPinnedContextOpen] = useState(false)
  const [activeTarget, setActiveTarget] = useState<ContextTarget | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [messageContext, setMessageContext] = useState<ContextObject[]>([])
  const [composerCursor, setComposerCursor] = useState(0)
  const [startFocusTerm, setStartFocusTerm] = useState('')
  const [startFocusContext, setStartFocusContext] = useState<FocusContext>(null)
  const [dismissedContextQuery, setDismissedContextQuery] = useState('')
  const [dismissedStartFocusQuery, setDismissedStartFocusQuery] = useState('')
  const [dismissedComposerQuery, setDismissedComposerQuery] = useState('')
  const [composerPosition, setComposerPosition] =
    useState<ComposerAutocompletePosition | null>(null)

  const parsedSearch = parseContextSearchTerm(searchTerm)
  const contextQuery = useQuery({
    queryKey: ['search', 'context', parsedSearch.types ?? 'all', parsedSearch.q],
    queryFn: () => search({ ...parsedSearch, limit: 8 }),
    enabled: Boolean(activeTarget) && parsedSearch.q.length >= 2,
  })
  const startFocusQuery = useQuery({
    queryKey: ['search', 'start-focus', startFocusTerm.trim()],
    queryFn: () => search({ q: startFocusTerm.trim(), limit: 6 }),
    enabled: isNewThread && !startFocusContext && startFocusTerm.trim().length >= 2,
  })
  const composerTrigger = useMemo(
    () => parseComposerContextTrigger(draft, composerCursor),
    [composerCursor, draft],
  )
  const composerQueryKey = composerTrigger
    ? `${composerTrigger.types}:${composerTrigger.q}:${composerTrigger.start}:${composerTrigger.end}`
    : ''
  const composerQuery = useQuery({
    queryKey: [
      'search',
      'composer-context',
      composerTrigger?.types ?? '',
      composerTrigger?.q ?? '',
    ],
    queryFn: () =>
      search({ q: composerTrigger?.q ?? '', types: composerTrigger?.types, limit: 8 }),
    enabled: Boolean(composerTrigger),
  })
  const addMutation = useMutation({
    mutationFn: (context: ContextObject) => addThreadContext(threadId ?? '', context),
    onSuccess: (_data, context) => updateThreadContextCache(context, 'add'),
  })
  const removeMutation = useMutation({
    mutationFn: (context: ContextObject) =>
      removeThreadContext(threadId ?? '', context.subject_type, context.subject_id),
    onSuccess: (_data, context) => updateThreadContextCache(context, 'remove'),
  })

  const activeItems = activeTarget === 'thread' ? pinnedContext : messageContext
  const contextGroups = useMemo(() => {
    const existing = new Set(activeItems.map(contextKey))
    return groupContextResults(
      (contextQuery.data?.results ?? EMPTY_RESULTS).filter((result) => !existing.has(contextKey(result))),
    )
  }, [activeItems, contextQuery.data?.results])
  const composerGroups = useMemo(() => {
    const existing = new Set([...pinnedContext, ...messageContext].map(contextKey))
    return groupContextResults(
      (composerQuery.data?.results ?? EMPTY_RESULTS).filter(
        (result) => !existing.has(contextKey(result)),
      ),
    )
  }, [composerQuery.data?.results, messageContext, pinnedContext])

  function updateThreadContextCache(context: ContextObject, mode: 'add' | 'remove') {
    function updateThread(thread: ThreadView): ThreadView {
      const exists = thread.pinned_context.some(
        (item) => item.subject_type === context.subject_type && item.subject_id === context.subject_id,
      )
      const pinned_context =
        mode === 'add'
          ? exists
            ? thread.pinned_context
            : [...thread.pinned_context, context]
          : thread.pinned_context.filter(
              (item) =>
                item.subject_type !== context.subject_type || item.subject_id !== context.subject_id,
            )
      return { ...thread, pinned_context }
    }

    queryClient.setQueryData<ThreadView[]>(['threads', { limit: THREAD_LIMIT }], (threads) =>
      threads?.map((thread) => (thread.thread_id === threadId ? updateThread(thread) : thread)),
    )
    queryClient.setQueryData<ThreadView>(['threads', threadId], (thread) =>
      thread ? updateThread(thread) : thread,
    )
  }

  function addMessageContext(context: ContextObject) {
    setMessageContext((current) =>
      current.some(
        (item) => item.subject_type === context.subject_type && item.subject_id === context.subject_id,
      )
        ? current
        : [...current, context],
    )
    setMessageContextOpen(true)
  }

  function selectContextResult(result: SearchResultItemView) {
    const context = contextFromSearchResult(result)
    if (activeTarget === 'message') {
      addMessageContext(context)
      setSearchTerm('')
      setDismissedContextQuery('')
      return
    }
    if (!threadId) return
    addMutation.mutate(context, {
      onSuccess: () => {
        setSearchTerm('')
        setDismissedContextQuery('')
      },
    })
  }

  function selectComposerResult(result: SearchResultItemView) {
    if (!composerTrigger) return
    addMessageContext(contextFromSearchResult(result))
    setDismissedComposerQuery('')
    setComposerPosition(null)
    setDraft((current) => {
      const before = current.slice(0, composerTrigger.start).trimEnd()
      const after = current.slice(composerTrigger.end).replace(/^\s+/, '')
      setComposerCursor(before.length)
      return [before, after].filter(Boolean).join(before && after ? ' ' : '')
    })
  }

  function removeMessageContext(context: ContextObject) {
    setMessageContext((current) =>
      current.filter(
        (item) => item.subject_type !== context.subject_type || item.subject_id !== context.subject_id,
      ),
    )
  }

  function openTarget(target: ContextTarget) {
    setActiveTarget((current) => {
      const next = current === target ? null : target
      setSearchTerm('')
      setDismissedContextQuery('')
      setMessageContextOpen(next === 'message')
      setPinnedContextOpen(next === 'thread')
      return next
    })
  }

  function closeTarget(target: ContextTarget) {
    setSearchTerm('')
    setDismissedContextQuery('')
    setActiveTarget((current) => (current === target ? null : current))
    if (target === 'message') setMessageContextOpen(false)
    else setPinnedContextOpen(false)
  }

  function inlineProps(target: ContextTarget, contexts: ContextObject[]) {
    const isActive = activeTarget === target
    const queryKey = `${target}:${searchTerm.trim()}`
    return {
      contexts,
      disabled:
        target === 'thread' && (addMutation.isPending || removeMutation.isPending),
      groups: contextGroups,
      isActive,
      isError: contextQuery.isError,
      isLoading: contextQuery.isLoading,
      isTooShort: searchTerm.trim().length > 0 && parsedSearch.q.length < 2,
      searchTerm,
      showAutocomplete:
        isActive && searchTerm.trim().length > 0 && dismissedContextQuery !== queryKey,
      onActivate: () => {
        if (!isActive) {
          setActiveTarget(target)
          setSearchTerm('')
        }
      },
      onClose: () => closeTarget(target),
      onDismiss: () => setDismissedContextQuery(queryKey),
      onRemove: target === 'thread' ? (context: ContextObject) => removeMutation.mutate(context) : removeMessageContext,
      onSearchTermChange: (term: string) => {
        if (!isActive) setActiveTarget(target)
        setDismissedContextQuery('')
        setSearchTerm(term)
      },
      onSelect: selectContextResult,
    }
  }

  function updateComposerSelection(textarea: HTMLTextAreaElement) {
    const cursor = textarea.selectionStart ?? textarea.value.length
    const trigger = parseComposerContextTrigger(textarea.value, cursor)
    setComposerCursor(cursor)
    setComposerPosition(trigger ? measureTextareaIndex(textarea, trigger.start) : null)
  }

  const startFocusQueryKey = `start:${startFocusTerm.trim()}`
  return {
    messageContext,
    messageContextOpen,
    pinnedContextOpen,
    startFocus: {
      context: startFocusContext,
      groups: groupContextResults(startFocusQuery.data?.results ?? EMPTY_RESULTS),
      isError: startFocusQuery.isError,
      isLoading: startFocusQuery.isLoading,
      term: startFocusTerm,
      showAutocomplete:
        !startFocusContext &&
        startFocusTerm.trim().length > 0 &&
        dismissedStartFocusQuery !== startFocusQueryKey,
      changeTerm: (term: string) => {
        setStartFocusContext(null)
        setStartFocusTerm(term)
        setDismissedStartFocusQuery('')
      },
      clear: () => {
        setStartFocusContext(null)
        setStartFocusTerm('')
        setDismissedStartFocusQuery('')
      },
      dismiss: () => setDismissedStartFocusQuery(startFocusQueryKey),
      select: (result: SearchResultItemView) => {
        const context = contextFromSearchResult(result)
        setStartFocusContext(context)
        setStartFocusTerm(contextLabel(context))
        setDismissedStartFocusQuery('')
      },
    },
    composer: {
      groups: composerGroups,
      isError: composerQuery.isError,
      isLoading: composerQuery.isLoading,
      position: composerPosition,
      queryKey: composerQueryKey,
      showAutocomplete: Boolean(
        composerTrigger && dismissedComposerQuery !== composerQueryKey,
      ),
      dismiss: () => setDismissedComposerQuery(composerQueryKey),
      resetDismissal: () => setDismissedComposerQuery(''),
      select: selectComposerResult,
      updateSelection: updateComposerSelection,
      clearPosition: () => setComposerPosition(null),
      setCursor: (cursor: number) => {
        setComposerCursor(cursor)
        setComposerPosition(null)
      },
    },
    inlineProps,
    openTarget,
  }
}
