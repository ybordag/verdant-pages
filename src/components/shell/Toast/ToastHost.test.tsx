import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { __resetToastStore, pushToast } from '@/lib/toast/toastStore'
import ToastHost from './ToastHost'

// pushToast notifies the store's subscribers outside React's event system,
// so the resulting setState needs to be wrapped in act() to flush before
// the assertion runs.
function push(...args: Parameters<typeof pushToast>) {
  act(() => {
    pushToast(...args)
  })
}

describe('ToastHost', () => {
  afterEach(() => {
    __resetToastStore()
  })

  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastHost />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a pushed toast', () => {
    render(<ToastHost />)
    push('Something happened')
    expect(screen.getByText('Something happened')).toBeInTheDocument()
  })

  it('removes the toast on click', async () => {
    render(<ToastHost />)
    push('Click me away')
    await userEvent.click(screen.getByText('Click me away'))
    expect(screen.queryByText('Click me away')).not.toBeInTheDocument()
  })

  it('calls onClick when the toast is clicked', async () => {
    const onClick = vi.fn()
    render(<ToastHost />)
    push('Has a callback', { onClick })
    await userEvent.click(screen.getByText('Has a callback'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
