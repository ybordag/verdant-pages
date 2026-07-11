import type {
  ContextObject,
  SearchResultItemView,
  UpdateSessionContextRequest,
} from '@/lib/types/rhizome'
import type { ComposerContextTrigger, FocusContext } from '../types'

const CONTEXT_TYPE_ALIASES = new Map([
  ['plant', 'plant'],
  ['plants', 'plant'],
  ['batch', 'batch'],
  ['batches', 'batch'],
  ['bed', 'bed'],
  ['beds', 'bed'],
  ['container', 'container'],
  ['containers', 'container'],
  ['task', 'task'],
  ['tasks', 'task'],
  ['project', 'project'],
  ['projects', 'project'],
  ['incident', 'incident'],
  ['incidents', 'incident'],
])

export function titleCase(value?: string | null): string {
  if (!value) return 'Not set'
  return value.slice(0, 1).toUpperCase() + value.slice(1)
}

export function contextLabel(context: ContextObject): string {
  if (context.label?.trim()) return context.label
  return `${titleCase(context.subject_type)} ${context.subject_id}`
}

export function contextKey(
  context: Pick<ContextObject, 'subject_type' | 'subject_id'>,
): string {
  return `${context.subject_type}:${context.subject_id}`
}

export function contextFromSearchResult(result: SearchResultItemView): ContextObject {
  return {
    subject_type: result.subject_type,
    subject_id: result.subject_id,
    label: result.label,
  }
}

export function groupContextResults(
  results: SearchResultItemView[],
): Array<[string, SearchResultItemView[]]> {
  const groups = new Map<string, SearchResultItemView[]>()
  for (const result of results) {
    const items = groups.get(result.subject_type) ?? []
    items.push(result)
    groups.set(result.subject_type, items)
  }
  return Array.from(groups.entries())
}

export function parseContextSearchTerm(term: string): { q: string; types?: string } {
  const trimmed = term.trim()
  const typedMatch = trimmed.match(/^([a-z_]+):(.*)$/i)
  if (!typedMatch) return { q: trimmed }
  const type = CONTEXT_TYPE_ALIASES.get(typedMatch[1].toLowerCase())
  if (!type) return { q: trimmed }
  return { q: typedMatch[2].trim() || type, types: type }
}

export function parseComposerContextTrigger(
  text: string,
  cursor: number,
): ComposerContextTrigger | null {
  const beforeCursor = text.slice(0, cursor)
  const match = beforeCursor.match(/(?:^|\s)([a-z_]+):([^\s:]*)$/i)
  if (!match) return null
  const type = CONTEXT_TYPE_ALIASES.get(match[1].toLowerCase())
  if (!type) return null
  const token = `${match[1]}:${match[2]}`
  return {
    start: beforeCursor.length - token.length,
    end: cursor,
    q: match[2].trim() || type,
    types: type,
  }
}

export function sessionFocusContextRefs(
  context: FocusContext,
): UpdateSessionContextRequest['focus_context'] {
  return context
    ? [{ subject_type: context.subject_type, subject_id: context.subject_id }]
    : []
}
