import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from './ThemeProvider'

function ThemeDisplay() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('defaults to dark when localStorage is empty', () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('reads saved theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'light')
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('toggles from dark to light', async () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('toggles back from light to dark', async () => {
    localStorage.setItem('theme', 'light')
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('persists theme to localStorage on toggle', async () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
