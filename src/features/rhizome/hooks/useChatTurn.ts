import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  createThread,
  streamChat,
  streamResume,
  updateThreadSessionContext,
} from '@/lib/api/chat'
import type {
  InteractionActionView,
  InteractionEnvelopeView,
  ThreadMessageView,
  UpdateSessionContextRequest,
} from '@/lib/types/rhizome'
import { appendStreamContent } from '../lib/messages'
import type { OptimisticSessionContext } from '../types'

interface StartupLabels {
  timeLabel: string
  energyLabel: string
  focusLabel: string
}

interface UseChatTurnOptions {
  threadId?: string
  interactionNotes: string
  getStartupLabels: () => StartupLabels
  getStartupPayload: () => UpdateSessionContextRequest | null
  onInteraction: (interaction: InteractionEnvelopeView) => void
  onInteractionComplete: () => void
  onMessageAccepted: () => void
}

export default function useChatTurn({
  threadId,
  interactionNotes,
  getStartupLabels,
  getStartupPayload,
  onInteraction,
  onInteractionComplete,
  onMessageAccepted,
}: UseChatTurnOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const controllerRef = useRef<AbortController | null>(null)
  const [streamThreadId, setStreamThreadId] = useState<string | null>(null)
  const [pendingMessages, setPendingMessages] = useState<ThreadMessageView[]>([])
  const [streamInteraction, setStreamInteraction] = useState<InteractionEnvelopeView | null>(null)
  const [streamingText, setStreamingText] = useState('')
  const [streamError, setStreamError] = useState<string | null>(null)
  const [retryMessage, setRetryMessage] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [optimisticSessionContext, setOptimisticSessionContext] =
    useState<OptimisticSessionContext | null>(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  function beginStream(targetThreadId: string) {
    const controller = new AbortController()
    controllerRef.current?.abort()
    controllerRef.current = controller
    setIsStreaming(true)
    setStreamError(null)
    setStreamingText('')
    setStreamThreadId(targetThreadId)
    return controller
  }

  async function resumeInteraction(action: InteractionActionView) {
    if (!threadId || isStreaming) return
    const controller = beginStream(threadId)
    try {
      let responseText = ''
      let sawDone = false
      const resolution = interactionNotes.trim()
        ? `${action.id}\n\nNotes: ${interactionNotes.trim()}`
        : action.id
      for await (const event of streamResume(threadId, resolution, controller.signal)) {
        if (event.type === 'token') {
          responseText = appendStreamContent(responseText, event.content)
          setStreamingText(responseText)
        } else if (event.type === 'interaction') {
          setStreamInteraction(event.payload)
          queryClient.setQueryData(['interactions', 'pending'], event.payload)
          onInteraction(event.payload)
        } else if (event.type === 'done') {
          sawDone = true
          break
        }
      }
      if (!sawDone) {
        setStreamingText(`${responseText}\n\nResponse may be incomplete.`)
        setStreamError('Connection dropped before Rhizome finished.')
        return
      }
      if (responseText.trim()) {
        setPendingMessages((current) => [
          ...current,
          { role: 'assistant', content: responseText, type: 'ai' },
        ])
      }
      setStreamingText('')
      setStreamInteraction(null)
      queryClient.setQueryData(['interactions', 'pending'], null)
      void queryClient.invalidateQueries({ queryKey: ['interactions', 'pending'] })
      void queryClient.invalidateQueries({ queryKey: ['threads', threadId, 'messages'] })
      onInteractionComplete()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStreamError('Connection failed - try again.')
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
      setIsStreaming(false)
    }
  }

  async function submitMessage(rawMessage: string) {
    const message = rawMessage.trim()
    if (!message || isStreaming) return
    let targetThreadId = threadId
    const controller = new AbortController()
    controllerRef.current?.abort()
    controllerRef.current = controller
    setIsStreaming(true)
    setStreamError(null)
    setRetryMessage(message)
    setStreamingText('')

    try {
      if (!targetThreadId) {
        const labels = getStartupLabels()
        const payload = getStartupPayload()
        const createdThread = await createThread({})
        targetThreadId = createdThread.thread_id
        if (
          labels.timeLabel !== 'Not set' ||
          labels.energyLabel !== 'Not set' ||
          labels.focusLabel !== 'Not set'
        ) {
          setOptimisticSessionContext({ threadId: targetThreadId, ...labels })
        }
        if (payload) {
          const context = await updateThreadSessionContext(targetThreadId, payload)
          queryClient.setQueryData(['threads', targetThreadId, 'session-context'], context)
        }
        navigate(`/app/rhizome/${encodeURIComponent(targetThreadId)}`)
      }

      const userMessage: ThreadMessageView = { role: 'user', content: message, type: 'human' }
      onMessageAccepted()
      setStreamThreadId(targetThreadId)
      setPendingMessages((current) =>
        targetThreadId === streamThreadId ? [...current, userMessage] : [userMessage],
      )

      let responseText = ''
      let sawDone = false
      let sawInteraction = false
      for await (const event of streamChat(targetThreadId, message, controller.signal)) {
        if (event.type === 'token') {
          responseText = appendStreamContent(responseText, event.content)
          setStreamingText(responseText)
        } else if (event.type === 'interaction') {
          sawInteraction = true
          setStreamInteraction(event.payload)
          queryClient.setQueryData(['interactions', 'pending'], event.payload)
          onInteraction(event.payload)
        } else if (event.type === 'done') {
          sawDone = true
          break
        }
      }
      if (!sawDone) {
        if (sawInteraction) {
          if (responseText.trim()) {
            setPendingMessages((current) => [
              ...current,
              { role: 'assistant', content: responseText, type: 'ai' },
            ])
          }
          setStreamingText('')
          setStreamError(null)
          setRetryMessage(null)
          return
        }
        setStreamingText(`${responseText}\n\nResponse may be incomplete.`)
        setStreamError('Connection dropped before Rhizome finished.')
        return
      }

      setPendingMessages((current) => [
        ...current,
        { role: 'assistant', content: responseText, type: 'ai' },
      ])
      setStreamingText('')
      setStreamError(null)
      setRetryMessage(null)
      void queryClient.invalidateQueries({ queryKey: ['threads', { limit: 20 }] })
      void queryClient.invalidateQueries({ queryKey: ['threads', targetThreadId, 'messages'] })
      void queryClient.invalidateQueries({
        queryKey: ['threads', targetThreadId, 'session-context'],
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStreamError('Connection failed - try again.')
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
      setIsStreaming(false)
    }
  }

  return {
    isStreaming,
    optimisticSessionContext,
    pendingMessages,
    retryMessage,
    streamError,
    streamInteraction,
    streamThreadId,
    streamingText,
    resumeInteraction,
    submitMessage,
  }
}
