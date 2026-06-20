import { test, expect } from '@playwright/test'

test('loads in dark theme by default', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('theme toggle switches to light', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('light theme persists on reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Toggle theme' }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})
