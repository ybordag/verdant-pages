import { expect, test } from '@playwright/test'
import { makeActivityEvents, mockAuthenticatedActivityApi } from './fixtures/activity'

test('activity feed lazy-loads older events for a busy user', async ({ page }) => {
  const events = makeActivityEvents(45)
  const requests = await mockAuthenticatedActivityApi(page, events)

  await page.goto('/app/activity')
  await expect(page.getByRole('heading', { name: 'Activity', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity event 0', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity event 19', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity event 20', exact: true })).not.toBeVisible()

  const appScroller = page.locator('#root > div > div > main')
  await appScroller.evaluate((element) => element.scrollTo(0, element.scrollHeight))
  await expect.poll(() => requests.some((request) => request.before_timestamp === events[19].created_at)).toBe(true)
  await expect(page.getByRole('heading', { name: 'Activity event 20', exact: true })).toBeVisible()

  await appScroller.evaluate((element) => element.scrollTo(0, element.scrollHeight))
  await expect.poll(() => requests.some((request) => request.before_timestamp === events[39].created_at)).toBe(true)
  await expect(page.getByRole('heading', { name: 'Activity event 44', exact: true })).toBeVisible()
})

test('activity filters query the backend and validate invalid date ranges', async ({ page }) => {
  const events = makeActivityEvents(30)
  const requests = await mockAuthenticatedActivityApi(page, events)

  await page.goto('/app/activity')
  await expect(page.getByRole('heading', { name: 'Activity event 0', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Category' }).click()
  await page.getByRole('option', { name: 'incident' }).click()

  await expect(page.getByRole('listbox', { name: 'Category' })).not.toBeVisible()
  await expect.poll(() => requests.some((request) => request.category === 'incident')).toBe(true)
  await expect(page.getByRole('heading', { name: 'Activity event 2', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity event 0', exact: true })).not.toBeVisible()

  await page.getByRole('button', { name: 'Since' }).click()
  await page.getByRole('button', { name: 'Since 06/20/2026' }).click()
  await expect(page.getByRole('dialog', { name: 'Since calendar' })).not.toBeVisible()
  await expect.poll(() => requests.some((request) => request.since === '2026-06-20')).toBe(true)
  const requestCountBeforeInvalidRange = requests.length

  await page.getByRole('button', { name: 'Before' }).click()
  await page.getByRole('button', { name: 'Before 06/19/2026' }).click()

  await expect(page.getByText('Before must be after since.')).toBeVisible()
  await expect.poll(() => requests.length).toBe(requestCountBeforeInvalidRange)
})

test('activity event and subject filters reset back to the unfiltered feed', async ({ page }) => {
  const events = makeActivityEvents(30)
  const requests = await mockAuthenticatedActivityApi(page, events)

  await page.goto('/app/activity')
  await expect(page.getByRole('heading', { name: 'Activity event 0', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Event type' }).click()
  await page.getByRole('option', { name: 'task created' }).click()
  await expect.poll(() => requests.some((request) => request.event_type === 'task_created')).toBe(true)
  await expect(page.getByRole('heading', { name: 'Activity event 0', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity event 1', exact: true })).not.toBeVisible()

  await page.getByRole('button', { name: 'Subject' }).click()
  await page.getByRole('option', { name: 'task', exact: true }).click()
  await expect.poll(() => requests.some((request) => request.event_type === 'task_created' && request.subject_type === 'task')).toBe(true)

  await page.getByRole('button', { name: 'Reset' }).click()
  await expect.poll(() => requests.filter((request) => !request.event_type && !request.subject_type).length).toBeGreaterThan(1)
  await expect(page.getByRole('heading', { name: 'Activity event 1', exact: true })).toBeVisible()
})

test('activity filters reset pagination after older events have loaded', async ({ page }) => {
  const events = makeActivityEvents(45)
  const requests = await mockAuthenticatedActivityApi(page, events)

  await page.goto('/app/activity')
  await expect(page.getByRole('heading', { name: 'Activity event 19', exact: true })).toBeVisible()

  const appScroller = page.locator('#root > div > div > main')
  await appScroller.evaluate((element) => element.scrollTo(0, element.scrollHeight))
  await expect(page.getByRole('heading', { name: 'Activity event 20', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Category' }).click()
  await page.getByRole('option', { name: 'incident' }).click()

  await expect.poll(() => requests.some((request) => request.category === 'incident' && !request.before_timestamp)).toBe(true)
  await expect(page.getByRole('heading', { name: 'Activity event 2', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity event 20', exact: true })).not.toBeVisible()
})

test('activity ignores a slow initial response after the user changes filters', async ({ page }) => {
  const events = [
    ...makeActivityEvents(8).map((event) => ({ ...event, category: 'task', event_type: 'task_created' })),
    {
      ...makeActivityEvents(1)[0],
      id: 'race-incident',
      category: 'incident',
      event_type: 'incident_reported',
      summary: 'Incident filter result',
      subjects: [{ subject_type: 'incident', subject_id: 'race-incident', role: 'primary' }],
    },
  ]
  const requests = await mockAuthenticatedActivityApi(page, events, { delayFirstUnfilteredMs: 350 })

  await page.goto('/app/activity')
  await page.getByRole('button', { name: 'Category' }).click()
  await page.getByRole('option', { name: 'incident' }).click()

  await expect(page.getByText('Incident filter result')).toBeVisible()
  await expect.poll(() => requests.some((request) => !request.category)).toBe(true)
  await expect.poll(() => requests.some((request) => request.category === 'incident')).toBe(true)

  await page.waitForTimeout(450)
  await expect(page.getByText('Activity event 0')).not.toBeVisible()
})

test('activity remains usable without horizontal overflow on mobile', async ({ page }) => {
  const events = makeActivityEvents(12)
  await mockAuthenticatedActivityApi(page, events)
  await page.setViewportSize({ width: 390, height: 844 })

  await page.goto('/app/activity')

  await expect(page.getByRole('heading', { name: 'Activity', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity event 0', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Category' })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true)
})

test('live activity endpoint smoke', async ({ page }) => {
  test.skip(!process.env.VERDANT_LIVE_ACTIVITY_E2E, 'Set VERDANT_LIVE_ACTIVITY_E2E=1 with Cambium/Rhizome running.')

  const email = `activity-live-${Date.now()}@example.com`
  const password = 'A-reasonably-long-password1!'

  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Sign Up' }).click()
  await expect(page).toHaveURL('/app/today')

  await page.goto('/app/activity')
  await expect(page.getByRole('heading', { name: 'Activity', exact: true })).toBeVisible()
  await expect(page.getByText('Activity could not load')).not.toBeVisible()

  await page.getByRole('button', { name: 'Category' }).click()
  await page.getByRole('option', { name: 'incident' }).click()
  await expect(page.getByText('Activity could not load')).not.toBeVisible()
})
