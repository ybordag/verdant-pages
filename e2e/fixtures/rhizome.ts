import type { Page, Route } from '@playwright/test'

export interface ThreadFixture {
  thread_id: string
  title: string
  last_message_preview?: string
  last_active_at?: string
  message_count?: number
  pinned_context?: ContextFixture[]
  created_at?: string
}

export interface ContextFixture {
  subject_type: string
  subject_id: string
}

export interface ThreadMessageFixture {
  role: 'user' | 'assistant' | string
  content: string
  type?: string
  created_at?: string
}

export interface StreamRequestRecord {
  threadId: string
  message: string
}

export interface RhizomeFixtureState {
  createdThreadIds: string[]
  resumeRequests: StreamRequestRecord[]
  streamRequests: StreamRequestRecord[]
  threads: ThreadFixture[]
  messages: Record<string, ThreadMessageFixture[]>
  sessionContexts: Record<string, SessionContextFixture>
}

export interface SessionContextFixture {
  available_minutes?: number | null
  energy_level?: 'low' | 'medium' | 'high' | null
  focus_project_id?: string | null
  focus_label?: string | null
  preferred_location_type?: 'bed' | 'container' | null
  open_to_outdoor_work?: boolean | null
  wants_quick_wins?: boolean | null
  source: 'unset' | 'inferred' | 'user'
  updated_at?: string | null
}

export async function mockAuthenticatedRhizomeApi(
  page: Page,
  options: {
    failFirstStream?: boolean
    initialMessages?: Record<string, ThreadMessageFixture[]>
    streamDelayMs?: number
    threads?: ThreadFixture[]
  } = {},
): Promise<RhizomeFixtureState> {
  const state: RhizomeFixtureState = {
    createdThreadIds: [],
    resumeRequests: [],
    streamRequests: [],
    threads: options.threads ?? makeThreads(),
    messages: {
      'thread-1': [
        { role: 'user', type: 'human', content: 'Existing user note' },
        {
          role: 'assistant',
          type: 'ai',
          content: 'Existing **Rhizome** response with `code`.',
        },
      ],
      'thread-2': [{ role: 'assistant', type: 'ai', content: 'Second thread history.' }],
      ...(options.initialMessages ?? {}),
    },
    sessionContexts: {
      'thread-1': makeSessionContext(),
      'thread-2': makeSessionContext({ available_minutes: 20, energy_level: 'low', focus_label: 'Seedlings' }),
    },
  }
  let streamCount = 0

  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'e2e-token' }),
    })
  })

  await page.route('**/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user_id: 'rhizome-e2e-user',
        email: 'rhizome-e2e@example.com',
        preferred_provider: null,
        preferred_model: null,
      }),
    })
  })

  await page.route('**/api/v1/threads**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname

    if (request.method() === 'POST' && path === '/api/v1/threads') {
      const threadId = 'thread-new'
      if (!state.threads.some((thread) => thread.thread_id === threadId)) {
        state.threads.unshift({
          thread_id: threadId,
          title: 'New Rhizome thread',
          last_message_preview: 'No messages yet',
          last_active_at: '2026-06-22T04:45:00Z',
          message_count: 0,
          pinned_context: [],
          created_at: '2026-06-22T04:45:00Z',
        })
      }
      state.messages[threadId] = state.messages[threadId] ?? []
      state.sessionContexts[threadId] = makeSessionContext({ source: 'unset' })
      state.createdThreadIds.push(threadId)
      await json(route, { thread_id: threadId })
      return
    }

    if (request.method() === 'GET' && path === '/api/v1/threads') {
      await json(route, state.threads)
      return
    }

    const threadMessages = path.match(/^\/api\/v1\/threads\/([^/]+)\/messages$/)
    if (request.method() === 'GET' && threadMessages) {
      const threadId = decodeURIComponent(threadMessages[1])
      await json(route, { thread_id: threadId, messages: state.messages[threadId] ?? [] })
      return
    }

    const threadSessionContext = path.match(/^\/api\/v1\/threads\/([^/]+)\/session-context$/)
    if (threadSessionContext) {
      const threadId = decodeURIComponent(threadSessionContext[1])
      if (request.method() === 'GET') {
        await json(route, state.sessionContexts[threadId] ?? makeSessionContext({ source: 'unset' }))
        return
      }
      if (request.method() === 'PATCH') {
        const body = JSON.parse(request.postData() ?? '{}') as Partial<SessionContextFixture>
        state.sessionContexts[threadId] = {
          ...(state.sessionContexts[threadId] ?? makeSessionContext({ source: 'unset' })),
          ...body,
          source: 'user',
          updated_at: '2026-06-22T04:50:00Z',
        }
        await json(route, state.sessionContexts[threadId])
        return
      }
    }

    const threadContext = path.match(/^\/api\/v1\/threads\/([^/]+)\/context$/)
    if (request.method() === 'POST' && threadContext) {
      const threadId = decodeURIComponent(threadContext[1])
      const context = JSON.parse(request.postData() ?? '{}') as ContextFixture
      const thread = state.threads.find((item) => item.thread_id === threadId)
      if (thread) {
        const pinned = thread.pinned_context ?? []
        if (!pinned.some((item) => item.subject_type === context.subject_type && item.subject_id === context.subject_id)) {
          thread.pinned_context = [...pinned, context]
        }
      }
      await json(route, {})
      return
    }

    const removeThreadContext = path.match(/^\/api\/v1\/threads\/([^/]+)\/context\/([^/]+)\/([^/]+)$/)
    if (request.method() === 'DELETE' && removeThreadContext) {
      const threadId = decodeURIComponent(removeThreadContext[1])
      const subjectType = decodeURIComponent(removeThreadContext[2])
      const subjectId = decodeURIComponent(removeThreadContext[3])
      const thread = state.threads.find((item) => item.thread_id === threadId)
      if (thread) {
        thread.pinned_context = (thread.pinned_context ?? []).filter(
          (item) => item.subject_type !== subjectType || item.subject_id !== subjectId,
        )
      }
      await json(route, {})
      return
    }

    const threadDetail = path.match(/^\/api\/v1\/threads\/([^/]+)$/)
    if (request.method() === 'GET' && threadDetail) {
      const threadId = decodeURIComponent(threadDetail[1])
      await json(route, state.threads.find((thread) => thread.thread_id === threadId) ?? makeThread(threadId))
      return
    }

    await route.fallback()
  })

  await page.route('**/api/v1/chat/stream**', async (route) => {
    streamCount += 1
    const url = new URL(route.request().url())
    const threadId = url.searchParams.get('thread_id') ?? ''
    const body = JSON.parse(route.request().postData() ?? '{}') as { message?: string }
    const message = body.message ?? ''
    state.streamRequests.push({ threadId, message })

    if (options.failFirstStream && streamCount === 1) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'down' }) })
      return
    }

    if (options.streamDelayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.streamDelayMs))
    }

    const response = [
      'Here is a markdown response:\n\n',
      '* **Bold option**\n',
      '* *Italic option*\n',
      '* `inline code`\n\n',
      'Paragraph two.',
    ].join('')
    state.messages[threadId] = [
      ...(state.messages[threadId] ?? []),
      { role: 'user', type: 'human', content: message },
      { role: 'assistant', type: 'ai', content: response },
    ]
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: [
        sse({ type: 'token', content: [{ type: 'text', text: response }] }),
        sse({ type: 'done' }),
      ].join(''),
    })
  })

  await page.route('**/api/v1/chat/resume/stream**', async (route) => {
    const body = JSON.parse(route.request().postData() ?? '{}') as { thread_id?: string; resolution?: string }
    const threadId = body.thread_id ?? ''
    const message = body.resolution ?? ''
    state.resumeRequests.push({ threadId, message })
    const response = 'Decision recorded.'
    state.messages[threadId] = [
      ...(state.messages[threadId] ?? []),
      { role: 'assistant', type: 'ai', content: response },
    ]
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: [sse({ type: 'token', content: response }), sse({ type: 'done' })].join(''),
    })
  })

  await page.route('**/api/v1/interactions/pending', async (route) => {
    await json(route, null)
  })

  await page.route('**/api/v1/search**', async (route) => {
    await json(route, {
      results: [
        {
          subject_type: 'plant',
          subject_id: 'plant-1',
          label: 'Cherry Tomato',
          secondary_label: 'Growbag A',
        },
      ],
      by_type: { plant: 1 },
    })
  })

  return state
}

function makeThreads(): ThreadFixture[] {
  return [
    makeThread('thread-1', 'Autumn flower bed', 'Existing **Rhizome** response with `code`.'),
    makeThread('thread-2', 'Seedling plan', 'Second thread history.'),
  ]
}

function makeThread(threadId: string, title = threadId, preview = 'No messages yet'): ThreadFixture {
  return {
    thread_id: threadId,
    title,
    last_message_preview: preview,
    last_active_at: '2026-06-22T04:30:00Z',
    message_count: 2,
    pinned_context: [],
    created_at: '2026-06-22T04:00:00Z',
  }
}

function makeSessionContext(overrides: Partial<SessionContextFixture> = {}): SessionContextFixture {
  return {
    available_minutes: 45,
    energy_level: 'medium',
    focus_project_id: 'project-1',
    focus_label: 'Autumn flower bed',
    preferred_location_type: 'bed',
    open_to_outdoor_work: true,
    wants_quick_wins: false,
    source: 'inferred',
    updated_at: '2026-06-22T04:30:00Z',
    ...overrides,
  }
}

async function json(route: Route, body: unknown) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

function sse(body: unknown): string {
  return `data: ${JSON.stringify(body)}\n\n`
}
