import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Login</Button>)
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Sign Up</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick} disabled>Login</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('submits its parent form on type="submit"', () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Login</Button>
      </form>,
    )
    screen.getByRole('button', { name: 'Login' }).click()
    expect(onSubmit).toHaveBeenCalledOnce()
  })
})
