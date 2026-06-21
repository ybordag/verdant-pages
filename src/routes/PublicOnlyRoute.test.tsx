import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import PublicOnlyRoute from './PublicOnlyRoute'
import { useAuth } from '@/lib/auth/context'

vi.mock('@/lib/auth/context')

function renderPublicOnly() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/app/today" element={<div>today page</div>} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<div>login page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('PublicOnlyRoute', () => {
  it('renders nothing while auth is resolving', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })
    renderPublicOnly()
    expect(screen.queryByText('login page')).not.toBeInTheDocument()
    expect(screen.queryByText('today page')).not.toBeInTheDocument()
  })

  it('renders the nested route when there is no user', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })
    renderPublicOnly()
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('redirects to /app/today when already authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { user_id: '1', email: 'me@example.com', preferred_provider: null, preferred_model: null },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    })
    renderPublicOnly()
    expect(screen.getByText('today page')).toBeInTheDocument()
  })
})
