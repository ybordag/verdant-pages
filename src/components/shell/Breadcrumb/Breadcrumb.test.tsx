import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Breadcrumb from './Breadcrumb'

describe('Breadcrumb', () => {
  it('renders a single crumb with no separator', () => {
    render(<Breadcrumb crumbs={[{ label: 'Today' }]} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.queryByText('/')).not.toBeInTheDocument()
  })

  it('renders multiple crumbs separated by /', () => {
    render(<Breadcrumb crumbs={[{ label: 'Tasks' }, { label: 'Today view' }]} />)
    expect(screen.getByText('Tasks')).toBeInTheDocument()
    expect(screen.getByText('Today view')).toBeInTheDocument()
    expect(screen.getByText('/')).toBeInTheDocument()
  })

  it('renders crumbs with onClick as buttons', () => {
    render(<Breadcrumb crumbs={[{ label: 'Garden', onClick: vi.fn() }, { label: 'Bed 3' }]} />)
    expect(screen.getByRole('button', { name: 'Garden' })).toBeInTheDocument()
  })

  it('renders the last crumb without onClick as plain text, not a button', () => {
    render(<Breadcrumb crumbs={[{ label: 'Garden', onClick: vi.fn() }, { label: 'Bed 3' }]} />)
    expect(screen.queryByRole('button', { name: 'Bed 3' })).not.toBeInTheDocument()
    expect(screen.getByText('Bed 3')).toBeInTheDocument()
  })

  it('calls onClick when a clickable crumb is clicked', async () => {
    const onClick = vi.fn()
    render(<Breadcrumb crumbs={[{ label: 'Garden', onClick }, { label: 'Bed 3' }]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Garden' }))
    expect(onClick).toHaveBeenCalled()
  })
})
