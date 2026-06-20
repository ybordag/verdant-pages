import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '@/lib/auth/context'

vi.mock('@/lib/auth/context')

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/app/today']}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/app" element={<ProtectedRoute />}>
          <Route path="today" element={<div>today page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('shows a loading state while auth is resolving', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })
    renderProtected()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('redirects to /login when there is no user', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })
    renderProtected()
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('renders the nested route when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { user_id: '1', email: 'me@example.com', preferred_provider: null, preferred_model: null },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })
    renderProtected()
    expect(screen.getByText('today page')).toBeInTheDocument()
  })
})
