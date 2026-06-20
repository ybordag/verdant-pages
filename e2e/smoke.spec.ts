import { test, expect } from '@playwright/test'

test('app loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
})
