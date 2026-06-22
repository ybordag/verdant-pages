import type { Page, Route } from '@playwright/test'

export interface ActivitySubjectFixture {
  subject_type: string
  subject_id: string
  role?: string
}

export interface ActivityEventFixture {
  id: string
  created_at: string
  actor_type: string
  actor_label?: string
  event_type: string
  category: string
  summary: string
  notes?: string
  project_id?: string
  subjects: ActivitySubjectFixture[]
}

export interface ActivityRequestRecord {
  before_timestamp: string | null
  category: string | null
  event_type: string | null
  limit: string | null
  since: string | null
  subject_type: string | null
}

export function makeActivityEvents(count: number): ActivityEventFixture[] {
  const categories = ['task', 'garden', 'incident', 'weather']
  const eventTypes = ['task_created', 'plant_updated', 'incident_reported', 'weather_advisory_created']
  const subjectTypes = ['task', 'plant', 'incident', 'weather_snapshot']

  return Array.from({ length: count }, (_, index) => {
    const category = categories[index % categories.length]
    const subjectType = subjectTypes[index % subjectTypes.length]
    const date = new Date(Date.UTC(2026, 5, 21, 12, 0, 0))
    date.setUTCMinutes(date.getUTCMinutes() - index)
    return {
      id: `activity-${index}`,
      created_at: date.toISOString(),
      actor_type: index % 2 === 0 ? 'agent' : 'user',
      actor_label: index % 2 === 0 ? 'Rhizome' : 'Yashi',
      event_type: eventTypes[index % eventTypes.length],
      category,
      summary: `Activity event ${index}`,
      notes: index % 5 === 0 ? `Activity note ${index}` : undefined,
      project_id: index % 3 === 0 ? 'project-summer' : undefined,
      subjects: [{ subject_type: subjectType, subject_id: `${subjectType}-${index}`, role: 'primary' }],
    }
  })
}

export async function mockAuthenticatedActivityApi(
  page: Page,
  events: ActivityEventFixture[],
  options: { delayFirstUnfilteredMs?: number; requests?: ActivityRequestRecord[] } = {},
) {
  let unfilteredRequests = 0
  const requests = options.requests ?? []

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
        user_id: 'activity-e2e-user',
        email: 'activity-e2e@example.com',
        preferred_provider: null,
        preferred_model: null,
      }),
    })
  })

  await page.route('**/api/v1/activity**', async (route) => {
    const url = new URL(route.request().url())
    const record: ActivityRequestRecord = {
      before_timestamp: url.searchParams.get('before_timestamp'),
      category: url.searchParams.get('category'),
      event_type: url.searchParams.get('event_type'),
      limit: url.searchParams.get('limit'),
      since: url.searchParams.get('since'),
      subject_type: url.searchParams.get('subject_type'),
    }
    requests.push(record)

    if (!record.before_timestamp && !record.category && !record.event_type && !record.since && !record.subject_type) {
      unfilteredRequests += 1
      if (unfilteredRequests === 1 && options.delayFirstUnfilteredMs) {
        await new Promise((resolve) => setTimeout(resolve, options.delayFirstUnfilteredMs))
      }
    }

    await fulfillActivity(route, paginate(filterEvents(events, record), record))
  })

  return requests
}

function filterEvents(events: ActivityEventFixture[], record: ActivityRequestRecord): ActivityEventFixture[] {
  return events
    .filter((event) => !record.category || event.category === record.category)
    .filter((event) => !record.event_type || event.event_type === record.event_type)
    .filter((event) => !record.subject_type || event.subjects.some((subject) => subject.subject_type === record.subject_type))
    .filter((event) => !record.since || event.created_at.slice(0, 10) >= record.since)
    .filter((event) => !record.before_timestamp || event.created_at < record.before_timestamp)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

function paginate(events: ActivityEventFixture[], record: ActivityRequestRecord): ActivityEventFixture[] {
  const limit = Number(record.limit ?? 20)
  return events.slice(0, limit)
}

async function fulfillActivity(route: Route, body: ActivityEventFixture[]) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}
