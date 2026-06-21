import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as stream from '@/lib/sse/stream'
import * as chat from './chat'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

vi.mock('@/lib/sse/stream', () => ({ consumeSSEStream: vi.fn() }))

describe('chat API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('createThread posts the thread payload', async () => {
    const data = { thread_id: 'thread-1' }
    await chat.createThread(data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/threads', { method: 'POST', body: JSON.stringify(data) })
  })

  it('listThreads omits the query string when no params are given', async () => {
    await chat.listThreads()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/threads')
  })

  it('listThreads includes limit when given', async () => {
    await chat.listThreads({ limit: 10 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/threads?limit=10')
  })

  it('getThread fetches a single thread by id', async () => {
    await chat.getThread('thread-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/threads/thread-1')
  })

  it('getThreadMessages fetches the message history', async () => {
    await chat.getThreadMessages('thread-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/threads/thread-1/messages')
  })

  it('deleteThread issues a DELETE', async () => {
    await chat.deleteThread('thread-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/threads/thread-1', { method: 'DELETE' })
  })

  it('addThreadContext posts the context payload', async () => {
    const data = { subject_type: 'plant', subject_id: 'plant-1' }
    await chat.addThreadContext('thread-1', data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/threads/thread-1/context', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })

  it('removeThreadContext issues a DELETE', async () => {
    await chat.removeThreadContext('thread-1', 'plant', 'plant-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/threads/thread-1/context/plant/plant-1', { method: 'DELETE' })
  })

  it('streamChat delegates to consumeSSEStream with the thread_id query param and message body', () => {
    chat.streamChat('thread-1', 'hello')
    expect(stream.consumeSSEStream).toHaveBeenCalledWith('/api/v1/chat/stream?thread_id=thread-1', {
      message: 'hello',
    })
  })

  it('streamResume delegates to consumeSSEStream with thread_id and resolution in the body', () => {
    chat.streamResume('thread-1', 'confirm')
    expect(stream.consumeSSEStream).toHaveBeenCalledWith('/api/v1/chat/resume/stream', {
      thread_id: 'thread-1',
      resolution: 'confirm',
    })
  })
})
