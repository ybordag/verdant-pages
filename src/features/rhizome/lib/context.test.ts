import { describe, expect, it } from 'vitest'
import {
  contextFromSearchResult,
  contextKey,
  contextLabel,
  groupContextResults,
  parseComposerContextTrigger,
  parseContextSearchTerm,
  sessionFocusContextRefs,
} from './context'

describe('Rhizome context helpers', () => {
  it('normalizes typed singular and plural searches', () => {
    expect(parseContextSearchTerm('plants:tomato')).toEqual({ q: 'tomato', types: 'plant' })
    expect(parseContextSearchTerm('batch:')).toEqual({ q: 'batch', types: 'batch' })
    expect(parseContextSearchTerm('unknown:value')).toEqual({ q: 'unknown:value' })
  })

  it('finds a composer token at the cursor without consuming surrounding text', () => {
    const text = 'Check plant:tomato before watering'
    expect(parseComposerContextTrigger(text, 18)).toEqual({
      start: 6,
      end: 18,
      q: 'tomato',
      types: 'plant',
    })
    expect(parseComposerContextTrigger(text, text.length)).toBeNull()
  })

  it('converts, labels, keys, groups, and serializes stable references', () => {
    const result = { subject_type: 'plant', subject_id: 'plant-1', label: 'Cherry Tomato' }
    const context = contextFromSearchResult(result)
    expect(contextLabel(context)).toBe('Cherry Tomato')
    expect(contextKey(context)).toBe('plant:plant-1')
    expect(sessionFocusContextRefs(context)).toEqual([
      { subject_type: 'plant', subject_id: 'plant-1' },
    ])
    expect(groupContextResults([result, { ...result, subject_id: 'plant-2' }])).toEqual([
      ['plant', [result, { ...result, subject_id: 'plant-2' }]],
    ])
  })
})
