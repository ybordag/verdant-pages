import { render, screen } from '@testing-library/react'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('renders its children', () => {
    render(<StatusBadge>Active</StatusBadge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it.each(['neutral', 'green', 'amber', 'red', 'blue', 'purple'] as const)(
    'renders without crashing for color=%s',
    (color) => {
      render(<StatusBadge color={color}>Status</StatusBadge>)
      expect(screen.getByText('Status')).toBeInTheDocument()
    },
  )

  it('applies a custom className alongside the color class', () => {
    render(<StatusBadge className="extra">Status</StatusBadge>)
    expect(screen.getByText('Status')).toHaveClass('extra')
  })
})
