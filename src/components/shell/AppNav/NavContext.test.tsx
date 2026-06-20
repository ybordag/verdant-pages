import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavProvider, useNav } from './NavContext'

function NavDisplay() {
  const { collapsed, toggle, drawerOpen, setDrawerOpen } = useNav()
  return (
    <div>
      <span data-testid="collapsed">{String(collapsed)}</span>
      <span data-testid="drawer">{String(drawerOpen)}</span>
      <button onClick={toggle}>toggle</button>
      <button onClick={() => setDrawerOpen(true)}>open drawer</button>
    </div>
  )
}

describe('NavProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to expanded when localStorage is empty', () => {
    render(
      <NavProvider>
        <NavDisplay />
      </NavProvider>,
    )
    expect(screen.getByTestId('collapsed')).toHaveTextContent('false')
  })

  it('reads saved collapsed state from localStorage on mount', () => {
    localStorage.setItem('nav_collapsed', 'true')
    render(
      <NavProvider>
        <NavDisplay />
      </NavProvider>,
    )
    expect(screen.getByTestId('collapsed')).toHaveTextContent('true')
  })

  it('toggles collapsed state and persists it', async () => {
    render(
      <NavProvider>
        <NavDisplay />
      </NavProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(screen.getByTestId('collapsed')).toHaveTextContent('true')
    expect(localStorage.getItem('nav_collapsed')).toBe('true')
  })

  it('drawer state starts closed and can be opened', async () => {
    render(
      <NavProvider>
        <NavDisplay />
      </NavProvider>,
    )
    expect(screen.getByTestId('drawer')).toHaveTextContent('false')
    await userEvent.click(screen.getByRole('button', { name: 'open drawer' }))
    expect(screen.getByTestId('drawer')).toHaveTextContent('true')
  })

  it('throws when useNav is used outside the provider', () => {
    function Bare() {
      useNav()
      return null
    }
    expect(() => render(<Bare />)).toThrow('useNav must be used within NavProvider')
  })
})
