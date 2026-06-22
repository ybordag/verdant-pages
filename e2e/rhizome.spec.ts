import { expect, test } from '@playwright/test'
import { mockAuthenticatedRhizomeApi } from './fixtures/rhizome'

test('Rhizome chat creates a thread, streams markdown, and preserves clean history on refresh', async ({ page }) => {
  const state = await mockAuthenticatedRhizomeApi(page, {
    initialMessages: {
      'thread-new': [
        { role: 'assistant', type: 'ai', content: '   ' },
        { role: 'assistant', type: 'tool', content: 'Error: no garden profile found.' },
      ],
    },
    streamDelayMs: 250,
  })

  await page.goto('/app/rhizome')
  await expect(page.getByText('Start a thread when you are ready.')).toBeVisible()

  await page.getByLabel('Message Rhizome').fill('Please show **bold**, *italic*, and `code`.')
  await page.getByRole('button', { name: 'Send' }).click()

  await expect.poll(() => state.createdThreadIds).toContainEqual('thread-new')
  await expect(page).toHaveURL(/\/app\/rhizome\/thread-new$/)
  await expect(page.getByText('Please show')).toBeVisible()
  await expect(page.getByText('Rhizome is thinking...')).toBeVisible()

  await expect(page.getByText('Rhizome is thinking...')).not.toBeVisible()
  await expect(page.getByText('bold', { exact: true })).toHaveJSProperty('tagName', 'STRONG')
  await expect(page.getByText('italic', { exact: true })).toHaveJSProperty('tagName', 'EM')
  await expect(page.getByText('code', { exact: true })).toHaveJSProperty('tagName', 'CODE')
  await expect(page.getByText('Bold option', { exact: true })).toBeVisible()
  await expect(page.getByText('Bold option', { exact: true })).toHaveJSProperty('tagName', 'STRONG')
  await expect(page.getByText('Italic option', { exact: true })).toHaveJSProperty('tagName', 'EM')
  await expect(page.getByText('inline code', { exact: true })).toHaveJSProperty('tagName', 'CODE')
  await expect(page.getByText('Paragraph two.')).toBeVisible()
  await expect(page.getByText('[object Object]')).not.toBeVisible()
  await expect(page.getByText('Error: no garden profile found.')).not.toBeVisible()

  await page.reload()
  await expect(page.getByText('Please show')).toHaveCount(1)
  await expect(page.getByText('Bold option')).toBeVisible()
  await expect(page.getByText('Error: no garden profile found.')).not.toBeVisible()
})

test('Rhizome chat retries a failed stream without duplicating the response', async ({ page }) => {
  const state = await mockAuthenticatedRhizomeApi(page, { failFirstStream: true })

  await page.goto('/app/rhizome/thread-1')
  await expect(page.getByRole('button', { name: 'Autumn flower bed' })).toBeVisible()

  await page.getByLabel('Message Rhizome').fill('Try a retry')
  await page.getByRole('button', { name: 'Send' }).click()

  const alert = await page.getByRole('alert')
  await expect(alert).toContainText('Connection failed - try again.')
  await expect(alert).toBeVisible()

  await page.getByRole('button', { name: 'Retry' }).click()
  await expect(page.getByText('Paragraph two.')).toBeVisible()
  await expect(page.getByText('Paragraph two.')).toHaveCount(1)
  await expect.poll(() => state.streamRequests).toHaveLength(2)
})

test('Rhizome thread navigator opens, switches threads, and closes cleanly', async ({ page }) => {
  await mockAuthenticatedRhizomeApi(page)

  await page.goto('/app/rhizome/thread-1')
  await page.getByRole('button', { name: 'Autumn flower bed' }).click()

  await expect(page.getByRole('heading', { name: 'Threads' })).toBeVisible()
  await expect(page.getByRole('link', { name: /New thread/i })).toBeVisible()
  await page.getByRole('link', { name: /Seedling plan/i }).click()

  await expect(page).toHaveURL(/\/app\/rhizome\/thread-2$/)
  await expect(page.getByLabel('Thread messages').getByText('Second thread history.')).toBeVisible()

  await page.getByRole('button', { name: 'Seedling plan' }).click()
  await page.getByRole('button', { name: 'Collapse threads panel' }).click()
  await expect(page.getByRole('heading', { name: 'Threads' })).not.toBeVisible()
})

test('Rhizome pinned context can be searched, added, and removed', async ({ page }) => {
  const state = await mockAuthenticatedRhizomeApi(page)

  await page.goto('/app/rhizome/thread-1')
  await expect(page.getByLabel('Pinned context')).toContainText('No pinned context')

  await page.getByRole('button', { name: 'Add context' }).click()
  await page.getByLabel('Search context').fill('tom')
  await page.getByRole('button', { name: /Cherry Tomato/i }).click()

  await expect(page.getByLabel('Pinned context')).toContainText('Plant plant-1')
  await expect.poll(() => state.threads[0].pinned_context).toEqual([
    { subject_type: 'plant', subject_id: 'plant-1' },
  ])

  await page.getByRole('button', { name: 'Remove Plant plant-1 context' }).click()
  await expect(page.getByLabel('Pinned context')).toContainText('No pinned context')
  await expect.poll(() => state.threads[0].pinned_context).toEqual([])
})

test('Rhizome chat shell remains usable in light and dark themes', async ({ page }) => {
  await mockAuthenticatedRhizomeApi(page)

  await page.goto('/app/rhizome/thread-1')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByLabel('Thread messages').getByText('Existing user note')).toBeVisible()
  await expect(page.getByLabel('Thread messages').getByText('Existing Rhizome response')).toBeVisible()

  await page.getByRole('switch', { name: 'Toggle theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByLabel('Thread messages').getByText('Existing user note')).toBeVisible()
  await expect(page.getByLabel('Message Rhizome')).toBeVisible()
})
