import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import ThemeToggle from './ThemeToggle'

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('renders a switch reflecting the current theme', () => {
    renderToggle()
    const switchEl = screen.getByRole('switch', { name: 'Toggle theme' })
    expect(switchEl).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles the theme when clicked', async () => {
    renderToggle()
    const switchEl = screen.getByRole('switch', { name: 'Toggle theme' })
    await userEvent.click(switchEl)
    expect(switchEl).toHaveAttribute('aria-checked', 'true')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('updates the title hint to match the next action', async () => {
    renderToggle()
    const switchEl = screen.getByRole('switch', { name: 'Toggle theme' })
    expect(switchEl).toHaveAttribute('title', 'Switch to light')
    await userEvent.click(switchEl)
    expect(switchEl).toHaveAttribute('title', 'Switch to dark')
  })
})
