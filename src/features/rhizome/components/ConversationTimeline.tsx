import { MessageSquare } from 'lucide-react'
import MarkdownMessage from '@/components/primitives/MarkdownMessage/MarkdownMessage'
import type { ThreadMessageView } from '@/lib/types/rhizome'
import { dateLabel, displayMessageContent, messageLabel } from '../lib/messages'
import s from '../ConversationTimeline.module.css'

interface ConversationTimelineProps {
  isError: boolean
  isLoading: boolean
  isStreaming: boolean
  messages: ThreadMessageView[]
  streamingText: string
  onRetry: () => void
}

function messageClass(message: ThreadMessageView): string {
  return message.role === 'user' ? s.userMessage : s.rhizomeMessage
}

export default function ConversationTimeline({
  isError,
  isLoading,
  isStreaming,
  messages,
  streamingText,
  onRetry,
}: ConversationTimelineProps) {
  if (isLoading) return <div className={s.emptyChat}>Loading messages</div>

  if (isError) {
    return (
      <div className={s.emptyChat}>
        <MessageSquare size={26} />
        <strong>Message history could not load.</strong>
        <span>Try again or choose another thread.</span>
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }

  if (messages.length === 0 && !streamingText && !isStreaming) {
    return (
      <div className={s.emptyChat}>
        <MessageSquare size={26} />
        <strong>No messages in this thread yet.</strong>
        <span>Use the composer below to send the first message.</span>
      </div>
    )
  }

  return (
    <ol className={s.messageList} aria-label="Thread messages">
      {messages.map((message, index) => {
        const label = dateLabel(message.created_at)
        const previousLabel = dateLabel(messages[index - 1]?.created_at)
        const showDaySeparator = label && label !== previousLabel
        return (
          <li key={`${message.role}-${message.type ?? 'message'}-${index}`}>
            {showDaySeparator ? <div className={s.daySeparator}>{label}</div> : null}
            <article className={[s.messageBubble, messageClass(message)].join(' ')}>
              <div className={s.messageMeta}>{messageLabel(message)}</div>
              <MarkdownMessage content={displayMessageContent(message)} />
            </article>
          </li>
        )
      })}
      {streamingText || isStreaming ? (
        <li>
          <article
            className={[s.messageBubble, s.rhizomeMessage, s.streamingMessage].join(' ')}
          >
            <div className={s.messageMeta}>Rhizome</div>
            <MarkdownMessage content={streamingText || 'Rhizome is thinking...'} />
          </article>
        </li>
      ) : null}
    </ol>
  )
}
