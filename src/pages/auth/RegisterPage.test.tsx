import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import RegisterPage from './RegisterPage'

function renderRegister() {
  render(
    <ThemeProvider>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('RegisterPage', () => {
  it('renders email, password, and confirm password fields', () => {
    renderRegister()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
  })

  it('rejects a password under the minimum length', async () => {
    renderRegister()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'short')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
  })

  it('rejects mismatched passwords', async () => {
    renderRegister()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'longenough')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'different')
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
  })

  it('passes validation with matching, long-enough passwords', async () => {
    renderRegister()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'longenough')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'longenough')
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(screen.queryByText('Passwords do not match.')).not.toBeInTheDocument()
    expect(screen.queryByText('Password must be at least 8 characters.')).not.toBeInTheDocument()
  })

  it('links to the login page', () => {
    renderRegister()
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login')
  })

  it('has a back link to the landing page', () => {
    renderRegister()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
  })
})
