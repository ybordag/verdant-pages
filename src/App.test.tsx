import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('Verdant Pages')).toBeInTheDocument()
  })

  it('renders the theme toggle button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument()
  })

  it('starts in dark theme by default', () => {
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('toggles theme when button is clicked', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Toggle theme' }))
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
