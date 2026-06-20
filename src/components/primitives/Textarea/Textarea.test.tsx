import { useState, type ChangeEvent } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Textarea from './Textarea'

function Controlled() {
  const [value, setValue] = useState('')
  return (
    <Textarea
      aria-label="Notes"
      value={value}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
    />
  )
}

describe('Textarea', () => {
  it('renders and reflects the value prop', () => {
    render(<Textarea aria-label="Notes" value="hello" onChange={() => {}} />)
    expect(screen.getByLabelText('Notes')).toHaveValue('hello')
  })

  it('calls onChange as the user types', async () => {
    render(<Controlled />)
    const textarea = screen.getByLabelText('Notes')
    await userEvent.type(textarea, 'multi-line notes')
    expect(textarea).toHaveValue('multi-line notes')
  })

  it('respects the rows attribute', () => {
    render(<Textarea aria-label="Notes" value="" onChange={() => {}} rows={6} />)
    expect(screen.getByLabelText('Notes')).toHaveAttribute('rows', '6')
  })
})
