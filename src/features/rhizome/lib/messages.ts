import type { ThreadMessageView } from '@/lib/types/rhizome'

export function stripTransportStartContext(content: string): string {
  if (!content.startsWith('For this thread, ')) return content
  const [, visible] = content.split(/\n\n(.+)/s)
  return visible?.trim() || content
}

export function displayMessageContent(message: ThreadMessageView): string {
  return message.role === 'user' ? stripTransportStartContext(message.content) : message.content
}

export function appendStreamContent(current: string, next: string): string {
  if (!next) return current
  if (!current) return next
  if (next === current || next.startsWith(current)) return next
  return current + next
}

export function messageKey(message: ThreadMessageView): string {
  return `${message.role}:${displayMessageContent(message)}`
}

export function messageLabel(message: ThreadMessageView): string {
  return message.role === 'user' ? 'You' : 'Rhizome'
}

export function dateLabel(value?: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
