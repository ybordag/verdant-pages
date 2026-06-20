import { render, screen } from '@testing-library/react'
import FieldLabel from './FieldLabel'
import Input from '../Input/Input'

describe('FieldLabel', () => {
  it('associates with its input via htmlFor', () => {
    render(
      <>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" value="" onChange={() => {}} />
      </>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders its children text', () => {
    render(<FieldLabel htmlFor="x">Password</FieldLabel>)
    expect(screen.getByText('Password')).toBeInTheDocument()
  })
})
