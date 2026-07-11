import { describe, expect, it } from 'vitest'
import {
  appendStreamContent,
  displayMessageContent,
  messageKey,
  stripTransportStartContext,
} from './messages'

describe('Rhizome message helpers', () => {
  it('hides transport-only startup context from user messages', () => {
    const content = 'For this thread, I have 20 minutes.\n\nWhat should I do first?'
    expect(stripTransportStartContext(content)).toBe('What should I do first?')
    expect(displayMessageContent({ role: 'user', type: 'human', content })).toBe(
      'What should I do first?',
    )
  })

  it('handles delta and cumulative stream chunks without duplicating text', () => {
    expect(appendStreamContent('', 'Hello')).toBe('Hello')
    expect(appendStreamContent('Hello', 'Hello world')).toBe('Hello world')
    expect(appendStreamContent('Hello', ' world')).toBe('Hello world')
    expect(appendStreamContent('Hello', 'Hello')).toBe('Hello')
  })

  it('keys user messages by visible content', () => {
    const message = {
      role: 'user',
      type: 'human',
      content: 'For this thread, context.\n\nVisible question',
    }
    expect(messageKey(message)).toBe('user:Visible question')
  })
})
