import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import LoginPage from './LoginPage'

function renderLogin() {
  render(
    <ThemeProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderLogin()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('shows validation errors when submitted empty', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
  })

  it('rejects a malformed email', async () => {
    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'not-an-email')
    await userEvent.type(screen.getByLabelText('Password'), 'whatever')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  })

  it('clears validation errors once the form is valid', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByText('Email is required.')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'whatever')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.queryByText('Email is required.')).not.toBeInTheDocument()
  })

  it('links to the register page', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/register')
  })
})
