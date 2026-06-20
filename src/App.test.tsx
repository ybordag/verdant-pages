import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import { router } from '@/routes/router'

// App.test.tsx covers shell/landing rendering, not auth — stub the auth
// context so ProtectedRoute always treats the user as signed in and no real
// network call fires on mount.
vi.mock('@/lib/auth/context', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: { user_id: '1', email: 'me@example.com', preferred_provider: null, preferred_model: null },
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}))

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
    await router.navigate('/app/today')
  })

  it('renders the main navigation', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })

  it('renders all 7 nav items', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'Rhizome' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tasks' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Calendar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Incidents' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Activity' })).toBeInTheDocument()
  })

  it('defaults to dark theme', () => {
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('collapse toggle collapses and expands the nav', async () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav.dataset.collapsed).toBe('false')
    await userEvent.click(screen.getByRole('button', { name: /Collapse nav/i }))
    expect(nav.dataset.collapsed).toBe('true')
    await userEvent.click(screen.getByRole('button', { name: /Expand nav/i }))
    expect(nav.dataset.collapsed).toBe('false')
  })

  it('marks nav items with pending badges via data-has-badge, even when the badge itself is hidden on collapse', async () => {
    render(<App />)
    const rhizomeLink = screen.getByRole('link', { name: 'Rhizome' })
    const calendarLink = screen.getByRole('link', { name: 'Calendar' })
    expect(rhizomeLink.dataset.hasBadge).toBe('true')
    expect(calendarLink.dataset.hasBadge).toBe('false')
  })
})

describe('App at /', () => {
  beforeEach(async () => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
    await router.navigate('/')
  })

  it('renders the landing page wordmark and tagline instead of the app shell', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Verdant Pages' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument()
  })

  it('renders Login and Sign Up links', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/register')
  })

  it('renders a GitHub link', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'View on GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/ybordag/verdant-pages',
    )
  })
})
