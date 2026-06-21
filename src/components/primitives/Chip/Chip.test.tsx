import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chip from './Chip'

describe('Chip', () => {
  it('renders its children', () => {
    render(<Chip>Tomatoes</Chip>)
    expect(screen.getByText('Tomatoes')).toBeInTheDocument()
  })

  it('does not render a remove button when onRemove is not provided', () => {
    render(<Chip>Tomatoes</Chip>)
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
  })

  it('renders a remove button when onRemove is provided', () => {
    render(<Chip onRemove={() => {}}>Tomatoes</Chip>)
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('calls onRemove when the remove button is clicked', async () => {
    const onRemove = vi.fn()
    render(<Chip onRemove={onRemove}>Tomatoes</Chip>)
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemove).toHaveBeenCalledOnce()
  })
})
