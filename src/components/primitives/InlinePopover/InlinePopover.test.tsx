import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InlinePopover from './InlinePopover'

describe('InlinePopover', () => {
  it('always renders the trigger', () => {
    render(
      <InlinePopover open={false} onClose={() => {}} trigger={<button>Open</button>}>
        content
      </InlinePopover>,
    )
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  it('only renders content when open', () => {
    const { rerender } = render(
      <InlinePopover open={false} onClose={() => {}} trigger={<button>Open</button>}>
        Popover content
      </InlinePopover>,
    )
    expect(screen.queryByText('Popover content')).not.toBeInTheDocument()

    rerender(
      <InlinePopover open onClose={() => {}} trigger={<button>Open</button>}>
        Popover content
      </InlinePopover>,
    )
    expect(screen.getByText('Popover content')).toBeInTheDocument()
  })

  it('calls onClose when clicking outside the anchor', async () => {
    const onClose = vi.fn()
    render(
      <div>
        <InlinePopover open onClose={onClose} trigger={<button>Open</button>}>
          Popover content
        </InlinePopover>
        <button>Outside</button>
      </div>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when clicking inside the popover content', async () => {
    const onClose = vi.fn()
    render(
      <InlinePopover open onClose={onClose} trigger={<button>Open</button>}>
        Popover content
      </InlinePopover>,
    )
    await userEvent.click(screen.getByText('Popover content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    render(
      <InlinePopover open onClose={onClose} trigger={<button>Open</button>}>
        Popover content
      </InlinePopover>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
