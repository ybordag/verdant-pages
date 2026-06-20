import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Select from './Select'

function Controlled() {
  const [value, setValue] = useState('a')
  return (
    <Select aria-label="Fruit" value={value} onChange={(e) => setValue(e.target.value)}>
      <option value="a">Apple</option>
      <option value="b">Banana</option>
    </Select>
  )
}

describe('Select', () => {
  it('renders its options', () => {
    render(
      <Select aria-label="Fruit" value="a" onChange={() => {}}>
        <option value="a">Apple</option>
        <option value="b">Banana</option>
      </Select>,
    )
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument()
  })

  it('reflects the value prop', () => {
    render(
      <Select aria-label="Fruit" value="b" onChange={() => {}}>
        <option value="a">Apple</option>
        <option value="b">Banana</option>
      </Select>,
    )
    expect(screen.getByLabelText('Fruit')).toHaveValue('b')
  })

  it('calls onChange when the user picks a different option', async () => {
    render(<Controlled />)
    await userEvent.selectOptions(screen.getByLabelText('Fruit'), 'Banana')
    expect(screen.getByLabelText('Fruit')).toHaveValue('b')
  })
})
