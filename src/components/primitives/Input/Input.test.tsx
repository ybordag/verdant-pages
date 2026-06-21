import { useState, type ChangeEvent } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from './Input'

function Controlled() {
  const [value, setValue] = useState('')
  return (
    <Input
      aria-label="Email"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
    />
  )
}

describe('Input', () => {
  it('renders and reflects the value prop', () => {
    render(<Input aria-label="Email" value="a@b.com" onChange={() => {}} />)
    expect(screen.getByLabelText('Email')).toHaveValue('a@b.com')
  })

  it('calls onChange as the user types', async () => {
    render(<Controlled />)
    const input = screen.getByLabelText('Email')
    await userEvent.type(input, 'hi@example.com')
    expect(input).toHaveValue('hi@example.com')
  })

  it('respects the type attribute', () => {
    render(<Input aria-label="Password" type="password" value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })
})
