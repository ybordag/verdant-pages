import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
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
