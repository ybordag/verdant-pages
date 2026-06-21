import { afterEach, describe, expect, it } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { __resetConnectivity } from '@/lib/connectivity/connectivity'
import OfflineBanner from './OfflineBanner'

// window.dispatchEvent fires outside React's event system, so the resulting
// setState (via the connectivity store's listener) needs to be wrapped in
// act() to flush synchronously before the assertion runs.
function goOffline() {
  act(() => {
    window.dispatchEvent(new Event('offline'))
  })
}

function goOnline() {
  act(() => {
    window.dispatchEvent(new Event('online'))
  })
}

describe('OfflineBanner', () => {
  afterEach(() => {
    __resetConnectivity()
  })

  it('renders nothing while online', () => {
    render(<OfflineBanner />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders the banner once offline', () => {
    render(<OfflineBanner />)
    goOffline()
    expect(screen.getByRole('status')).toHaveTextContent("You're offline — changes won't save")
  })

  it('hides again once back online', () => {
    render(<OfflineBanner />)
    goOffline()
    expect(screen.getByRole('status')).toBeInTheDocument()
    goOnline()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
