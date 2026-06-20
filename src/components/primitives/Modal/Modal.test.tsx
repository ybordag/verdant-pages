import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Modal open={false} onClose={() => {}} title="Confirm">content</Modal>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog with its title and content when open', () => {
    render(<Modal open onClose={() => {}} title="Confirm">content</Modal>)
    expect(screen.getByRole('dialog', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="Confirm">content</Modal>)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="Confirm">content</Modal>)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose on backdrop click but not on panel click', async () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="Confirm">content</Modal>)
    const backdrop = screen.getByRole('dialog').parentElement!

    await userEvent.click(screen.getByText('content'))
    expect(onClose).not.toHaveBeenCalled()

    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })
})
