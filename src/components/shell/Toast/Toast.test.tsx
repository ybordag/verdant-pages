import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToastContainer from './Toast'

describe('ToastContainer', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} onDismiss={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a toast message', () => {
    render(<ToastContainer toasts={[{ id: '1', message: 'Job complete' }]} onDismiss={vi.fn()} />)
    expect(screen.getByText('Job complete')).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    render(
      <ToastContainer
        toasts={[
          { id: '1', message: 'First' },
          { id: '2', message: 'Second' },
        ]}
        onDismiss={vi.fn()}
      />,
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('calls onDismiss with the toast id when clicked', async () => {
    const onDismiss = vi.fn()
    render(<ToastContainer toasts={[{ id: 'abc', message: 'Click me' }]} onDismiss={onDismiss} />)
    await userEvent.click(screen.getByText('Click me'))
    expect(onDismiss).toHaveBeenCalledWith('abc')
  })

  it('calls the toast onClick handler when clicked, in addition to dismissing', async () => {
    const onClick = vi.fn()
    const onDismiss = vi.fn()
    render(<ToastContainer toasts={[{ id: '1', message: 'Navigate', onClick }]} onDismiss={onDismiss} />)
    await userEvent.click(screen.getByText('Navigate'))
    expect(onClick).toHaveBeenCalled()
    expect(onDismiss).toHaveBeenCalledWith('1')
  })
})
