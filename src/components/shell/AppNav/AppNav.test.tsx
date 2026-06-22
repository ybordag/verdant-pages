import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { NavProvider } from './NavContext'
import AppNav from './AppNav'

const logout = vi.fn()

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({
    user: { user_id: '1', email: 'me@example.com', preferred_provider: null, preferred_model: null },
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout,
  }),
}))

function renderNav(path = '/app/today') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <NavProvider>
          <AppNav />
        </NavProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('AppNav', () => {
  beforeEach(() => {
    localStorage.clear()
    logout.mockClear()
  })

  it('renders the Garden Profile card with all four links when expanded', () => {
    renderNav()
    expect(screen.getByText('Garden Profile')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Overview/ })).toHaveAttribute('href', '/app/garden')
    expect(screen.getByRole('link', { name: /Plants/ })).toHaveAttribute('href', '/app/plants')
    expect(screen.getByRole('link', { name: /Beds/ })).toHaveAttribute('href', '/app/beds')
    expect(screen.getByRole('link', { name: /Containers/ })).toHaveAttribute('href', '/app/containers')
  })

  it('does not render fake nav badge counts', () => {
    renderNav()
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).not.toHaveTextContent('12')
    expect(nav).not.toHaveTextContent('5')
    expect(nav).not.toHaveTextContent('2')
  })

  it('marks the active Garden Profile card link', () => {
    renderNav('/app/plants')

    expect(screen.getByRole('link', { name: /Plants/ })).toHaveAttribute('aria-current', 'page')
  })

  it('renders the Quick Actions card', () => {
    renderNav()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ask Rhizome/ })).toHaveAttribute('href', '/app/rhizome')
    expect(screen.getByRole('link', { name: /New Task/ })).toHaveAttribute('href', '/app/tasks/new')
  })

  it('calls logout when the log-out button is clicked', async () => {
    renderNav()
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }))
    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('renders a Settings link', () => {
    renderNav()
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/app/settings')
  })

  it('opens the notification drawer when the bell is clicked', async () => {
    renderNav()
    expect(screen.queryByLabelText('Notifications')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Notifications' }))
  })

  it('switches Garden Profile and Quick Actions to icon widgets when collapsed', async () => {
    renderNav()
    await userEvent.click(screen.getByRole('button', { name: 'Collapse nav' }))
    expect(screen.queryByText('Garden Profile')).not.toBeInTheDocument()
    expect(screen.queryByText('Quick Actions')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Plants/ })).toHaveAttribute('href', '/app/plants')
  })
})
