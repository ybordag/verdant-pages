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
  time_text?: string | null
  energy_text?: string | null
  focus_text?: string | null
  focus_context: ContextFixture[]
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
      'thread-2': makeSessionContext({
        time_text: '20 minutes',
        energy_text: 'low',
        focus_text: 'Seedlings',
        focus_context: [],
      }),
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

    const sessionContext = state.sessionContexts[threadId]
    const hasStructuredTomatoBatch = sessionContext?.focus_context.some(
      (item) => item.subject_type === 'batch' && item.subject_id === 'batch-courtyard-tomatoes',
    )
    const response =
      hasStructuredTomatoBatch && message.includes('useful progress')
        ? [
            'Courtyard Tomatoes March 2026 has several pending setup tasks.\n\n',
            'Your first task should be: **Prepare growbag_1**.',
          ].join('')
        : [
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
    const url = new URL(route.request().url())
    const query = (url.searchParams.get('q') ?? '').toLowerCase()
    const types = new Set((url.searchParams.get('types') ?? '').split(',').filter(Boolean))
    const results = makeSearchResults().filter((result) => {
      const matchesType = types.size === 0 || types.has(result.subject_type)
      const searchable = [result.label, result.secondary_label, result.summary, result.subject_type].join(' ').toLowerCase()
      return matchesType && searchable.includes(query)
    })
    await json(route, {
      results,
      by_type: results.reduce<Record<string, number>>((acc, result) => {
        acc[result.subject_type] = (acc[result.subject_type] ?? 0) + 1
        return acc
      }, {}),
    })
  })

  await page.route('**/api/v1/tasks/daily**', async (route) => {
    await json(route, makeDailyTasks())
  })

  await page.route('**/api/v1/triage/latest', async (route) => {
    await json(route, null)
  })

  await page.route('**/api/v1/weather/latest', async (route) => {
    await json(route, {
      id: 'weather-1',
      created_at: '2026-06-22T04:51:00Z',
      location_label: 'Oakland, CA',
      timezone: 'America/Los_Angeles',
      forecast_start_date: '2026-06-22',
      forecast_end_date: '2026-06-23',
      conditions_summary: 'current 78F, rain 0.0mm, wind 6.0',
      alerts_summary: null,
      derived_impacts: [],
      recommended_actions: [],
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
    time_text: '45 minutes',
    energy_text: 'medium',
    focus_text: 'Autumn flower bed',
    focus_context: [{ subject_type: 'project', subject_id: 'project-1' }],
    source: 'inferred',
    updated_at: '2026-06-22T04:30:00Z',
    ...overrides,
  }
}

function makeSearchResults() {
  return [
    {
      subject_type: 'batch',
      subject_id: 'batch-courtyard-tomatoes',
      label: 'Courtyard Tomatoes March 2026',
      secondary_label: 'Cherry Tomato (Sungold) batch',
    },
    {
      subject_type: 'task',
      subject_id: 'task-growbag-1',
      label: 'Prepare growbag_1',
      secondary_label: 'Courtyard Tomatoes March 2026 · pending',
    },
    {
      subject_type: 'plant',
      subject_id: 'plant-1',
      label: 'Cherry Tomato',
      secondary_label: 'Growbag A',
    },
  ]
}

function makeDailyTasks() {
  return [
    makeTask('task-growbag-1', 'Prepare growbag_1', 45),
    makeTask('task-growbag-2', 'Prepare growbag_2', 45),
    makeTask('task-acquire-starts', 'Acquire Tomato starts', 30),
  ]
}

function makeTask(id: string, title: string, estimatedMinutes: number) {
  return {
    id,
    project_id: 'project-courtyard-tomatoes',
    title,
    type: 'milestone',
    status: 'pending',
    priority: 'blocker',
    estimated_minutes: estimatedMinutes,
    is_user_modified: false,
    created_at: '2026-06-22T04:00:00Z',
    blocked: true,
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
