import { test, expect } from '@playwright/test'

// Requires Cambium running locally on :8080 (see CLAUDE.md) — these tests
// register real accounts against it, so each run uses a fresh email.

test('register, logout, and log back in', async ({ page }) => {
  const email = `auth-spec-${Date.now()}@example.com`
  const password = 'A-reasonably-long-password1!'

  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Sign Up' }).click()

  await expect(page).toHaveURL('/app/today')
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL('/login')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()

  await expect(page).toHaveURL('/app/today')
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
})

test('rejects login with the wrong password', async ({ page }) => {
  const email = `auth-spec-wrong-${Date.now()}@example.com`
  const password = 'A-reasonably-long-password1!'

  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Sign Up' }).click()
  await expect(page).toHaveURL('/app/today')

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL('/login')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('not-the-right-password')
  await page.getByRole('button', { name: 'Login' }).click()

  await expect(page.getByText(/Invalid email or password/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'No account yet? Sign up' })).toHaveAttribute('href', '/register')
  await expect(page).toHaveURL('/login')
})

test('unauthenticated visit to a protected route redirects to /login', async ({ page }) => {
  await page.goto('/app/today')
  await expect(page).toHaveURL('/login')
})

test('visiting /login or /register while already authenticated redirects to /app/today', async ({ page }) => {
  const email = `auth-spec-already-in-${Date.now()}@example.com`
  const password = 'A-reasonably-long-password1!'

  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Sign Up' }).click()
  await expect(page).toHaveURL('/app/today')

  await page.goto('/login')
  await expect(page).toHaveURL('/app/today')

  await page.goto('/register')
  await expect(page).toHaveURL('/app/today')
})

test('rejects registering with an email that is already taken', async ({ page }) => {
  const email = `auth-spec-taken-${Date.now()}@example.com`
  const password = 'A-reasonably-long-password1!'

  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Sign Up' }).click()
  await expect(page).toHaveURL('/app/today')

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL('/login')

  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Sign Up' }).click()

  await expect(page.getByText(/already exists/)).toBeVisible()
  const loginLink = page.getByRole('link', { name: 'Log in instead' })
  await expect(loginLink).toHaveAttribute('href', '/login')

  await loginLink.click()
  await expect(page).toHaveURL('/login')
  await expect(page.getByText('Log in with your existing account below.')).toBeVisible()
  await expect(page.getByLabel('Email')).toHaveValue(email)
})

test('logs in directly with an existing account', async ({ page }) => {
  const email = `auth-spec-direct-login-${Date.now()}@example.com`
  const password = 'A-reasonably-long-password1!'

  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByLabel('Confirm password').fill(password)
  await page.getByRole('button', { name: 'Sign Up' }).click()
  await expect(page).toHaveURL('/app/today')

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL('/login')

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()

  await expect(page).toHaveURL('/app/today')
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
})
